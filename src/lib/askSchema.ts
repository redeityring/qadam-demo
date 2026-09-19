/**
 * Строгая валидация тела запроса к ИИ-эндпоинту `/api/ask`.
 *
 * Принципы:
 *   1. Никакого доверия клиенту: принимаем только нужные поля и только
 *      с допустимыми значениями.
 *   2. Whitelist вместо blacklist: неизвестные значения отбрасываются,
 *      а не «пролезают» дальше в модель.
 *   3. Data minimization: служебные поля профиля (избранное, сравнение,
 *      отметки плана) ИИ не нужны — они не покидают браузер.
 *   4. Границы важнее удобства: слишком длинный текст, чужой язык или
 *      отсутствие согласия — это отказ, а не «попробуем как-нибудь».
 */

import type { Lang } from "@/i18n/dictionaries";
import { MAJOR_L } from "@/i18n/engine";
import { CITIES, EXAMS, SUBJECTS } from "@/lib/constants";
import { AI_CONSENT_VERSION } from "@/lib/aiPolicy";
import type { CityId, ExamId, MajorId, Profile, SubjectId } from "@/types";

/** Максимальный размер тела запроса (байт) — защита от «тяжёлых» тел */
export const MAX_BODY_BYTES = 8 * 1024;
/** Максимальная длина вопроса пользователя */
export const MAX_QUESTION_CHARS = 300;
export const MIN_QUESTION_CHARS = 2;

const CITIES_SET = new Set<string>(CITIES.map((c) => c.id));
const SUBJECTS_SET = new Set<string>(SUBJECTS.map((s) => s.id));
const EXAMS_SET = new Set<string>(EXAMS.map((e) => e.id));
const MAJORS_SET = new Set<string>(Object.keys(MAJOR_L));
const PRIORITIES = ["cost", "proximity", "ranking", "dorm"] as const;
const LANGS = ["ru", "kk", "en"] as const;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const strArray = (v: unknown, allowed: Set<string>, max: number): string[] =>
  Array.isArray(v)
    ? Array.from(new Set(v.filter((x): x is string => typeof x === "string" && allowed.has(x)))).slice(0, max)
    : [];

/**
 * Число из клиента → целое в жёстких границах.
 * Не число → null (поле считается отсутствующим); число → зажимаем в диапазон.
 * Зажимаем, а не отклоняем: клиент не может «сломать» ответ значением
 * слайдера, но и выйти за пределы модели не получится.
 */
const clampInt = (v: unknown, min: number, max: number): number | null => {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  return Math.min(max, Math.max(min, Math.round(v)));
};

/** Схлопываем пробелы и убираем управляющие символы (в т.ч. попытки prompt-injection «переносами») */
export function normalizeQuestion(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length < MIN_QUESTION_CHARS || cleaned.length > MAX_QUESTION_CHARS) return null;
  if (!/[\p{L}\p{N}]/u.test(cleaned)) return null; // вопрос не может быть только из символов
  return cleaned;
}

/** Профиль из запроса → безопасный Profile только из разрешённых полей (или null) */
export function sanitizeProfile(raw: unknown): Profile | null {
  if (!isRecord(raw)) return null;

  const interests = strArray(raw.interests, SUBJECTS_SET, 4) as SubjectId[];
  const entEstimate = clampInt(raw.entEstimate, 50, 140);
  // Неполный профиль не отправляем: без интересов и балла ЕНТ ответ будет водой
  if (interests.length === 0 || entEstimate === null) return null;

  const strengths: Partial<Record<SubjectId, number>> = {};
  if (isRecord(raw.strengths)) {
    for (const [key, value] of Object.entries(raw.strengths)) {
      if (!SUBJECTS_SET.has(key)) continue;
      const n = clampInt(value, 1, 5);
      if (n !== null) strengths[key as SubjectId] = n;
    }
  }

  const budgetAny = raw.budgetAny === true;
  // Если бюджет не передан числом — берём нейтральное значение по умолчанию,
  // иначе все программы выглядели бы «дороже бюджета».
  const budget = clampInt(raw.budgetPerYearTenge, 0, 100_000_000) ?? 1_000_000;

  const gradeRaw = clampInt(raw.grade, 9, 11) ?? 11;
  const grade = gradeRaw as Profile["grade"];

  const city = (typeof raw.city === "string" && CITIES_SET.has(raw.city) ? raw.city : "any") as CityId;
  const studyLanguage = (LANGS as readonly string[]).includes(String(raw.studyLanguage))
    ? (raw.studyLanguage as Profile["studyLanguage"])
    : "ru";
  const countries = raw.countries === "kz+abroad" ? "kz+abroad" : "kz";
  const plannedExams = strArray(raw.plannedExams, EXAMS_SET, 3) as ExamId[];

  const ielts =
    typeof raw.ieltsEstimate === "number" && Number.isFinite(raw.ieltsEstimate)
      ? Math.min(9, Math.max(0, Math.round(raw.ieltsEstimate * 2) / 2))
      : null;
  const sat = typeof raw.satEstimate === "number" ? clampInt(raw.satEstimate, 400, 1600) : null;

  const priority = strArray(raw.priority, new Set<string>(PRIORITIES), 4);

  return {
    grade,
    city,
    interests,
    strengths,
    desiredMajors: strArray(raw.desiredMajors, MAJORS_SET, 5) as MajorId[],
    studyLanguage,
    budgetPerYearTenge: budget,
    budgetAny,
    needsDorm: raw.needsDorm === true,
    countries,
    plannedExams: plannedExams.length ? plannedExams : ["ent"],
    entEstimate,
    ieltsEstimate: ielts,
    satEstimate: sat,
    targetYear: clampInt(raw.targetYear, 2020, 2100) ?? new Date().getFullYear() + 1,
    // Служебные поля никогда не приходят с клиента в ИИ-запрос:
    nextActionDoneAt: null,
    doneSteps: [],
    compareIds: [],
    favoriteIds: [],
    priority: priority.length ? priority : [...PRIORITIES],
  };
}

export interface AskRequest {
  question: string;
  lang: Lang;
  profile: Profile | null;
}

export type ValidationResult =
  | { ok: true; value: AskRequest }
  | { ok: false; status: number; error: string };

/** Полная проверка тела POST /api/ask */
export function validateAskPayload(raw: unknown): ValidationResult {
  if (!isRecord(raw)) return { ok: false, status: 400, error: "invalid_body" };

  const question = normalizeQuestion(raw.question);
  if (!question) return { ok: false, status: 400, error: "invalid_question" };

  const lang = (LANGS as readonly string[]).includes(String(raw.lang)) ? (raw.lang as Lang) : "ru";

  // Прозрачное согласие: без него профиль в модель не уходит вообще
  const consent = raw.consent;
  if (!isRecord(consent) || consent.granted !== true || consent.version !== AI_CONSENT_VERSION) {
    return { ok: false, status: 403, error: "consent_required" };
  }

  return { ok: true, value: { question, lang, profile: sanitizeProfile(raw.profile) } };
}
