/**
 * Roadmap-генератор (этап 6 кейса): персональный план из профиля.
 * Правила по классу, экзаменам, языку, странам и интересам.
 * Каждый пункт — действие с объяснением «зачем», периодом и источником.
 * Строки локализуются через i18n/engine; структура шагов детерминирована.
 */

import type { Lang } from "@/i18n/dictionaries";
import { roadmapStrings, ROADMAP_SECTIONS_L } from "@/i18n/engine";
import type { Profile } from "@/types";
import { SUBJECT_L } from "@/i18n/engine";

export type RoadmapSectionId = "exams" | "documents" | "academic" | "activities";

/** Заголовки разделов плана (локализованные) + emoji для визуальной системы */
export const ROADMAP_SECTIONS: Array<{
  id: RoadmapSectionId;
  emoji: string;
}> = [
  { id: "exams", emoji: "📝" },
  { id: "documents", emoji: "📄" },
  { id: "academic", emoji: "🎓" },
  { id: "activities", emoji: "🏅" },
];

export function roadmapSectionLabel(id: RoadmapSectionId, lang: Lang) {
  return ROADMAP_SECTIONS_L[id][lang];
}

export interface RoadmapStep {
  id: string;
  section: RoadmapSectionId;
  title: string;
  why: string;
  period: Record<Lang, string>;
  source: { label: string; url?: string; kind: "official" | "demo" };
}

const EGOV = { label: "e.gov.kz", url: "https://egov.kz", kind: "official" as const };
const ENTEC = {
  label: "entec.gov.kz",
  url: "https://entec.gov.kz",
  kind: "official" as const,
};
const DEMO = { label: "demo", kind: "demo" as const };

const PERIODS = {
  now: { ru: "Сейчас", kk: "Қазір", en: "Now" },
  sepMar: { ru: "Сентябрь — март", kk: "Қыркүйек — наурыз", en: "Sep — Mar" },
  weekly: { ru: "Систематически, 2–3 раза в неделю", kk: "Жүйелі, аптасына 2–3 рет", en: "Weekly, 2–3 times" },
  marApr: { ru: "Март — апрель", kk: "Наурыз — сәуір", en: "Mar — Apr" },
  toGrad: { ru: "К выпуску", kk: "Бітіруге дейін", en: "By graduation" },
  sixTwelve: { ru: "6–12 месяцев подготовки", kk: "6–12 ай дайындық", en: "6–12 months prep" },
  jun: { ru: "Июнь", kk: "Мамыр — маусым", en: "June" },
  julAug: { ru: "Июль — август", kk: "Шілде — тамыз", en: "Jul — Aug" },
  toDec: { ru: "До декабря", kk: "Желтоқсанға дейін", en: "By December" },
  toYearEnd: { ru: "До конца учебного года", kk: "Оқу жылының соңына дейін", en: "By year end" },
  allYear: { ru: "Весь год", kk: "Жыл бойы", en: "All year" },
  octMar: { ru: "Октябрь — март", kk: "Қазан — наурыз", en: "Oct — Mar" },
  decApr: { ru: "Декабрь — апрель", kk: "Желтоқсан — сәуір", en: "Dec — Apr" },
} as const;

export function getRoadmap(profile: Profile, lang: Lang = "ru"): RoadmapStep[] {
  const steps: RoadmapStep[] = [];
  const releaseYear = profile.targetYear;

  const push = (
    id: string,
    section: RoadmapSectionId,
    period: Record<Lang, string>,
    source: { label: string; url?: string; kind: "official" | "demo" },
    vars?: Record<string, string>,
  ) => {
    const s = roadmapStrings(id, lang);
    if (!s) return;
    let { title, why } = s;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        title = title.replaceAll(`{{${k}}}`, v);
        why = why.replaceAll(`{{${k}}}`, v);
      }
    }
    steps.push({ id, section, title, why, period, source });
  };

  const subjList = (list: string[]) =>
    list.map((s) => SUBJECT_L[s as keyof typeof SUBJECT_L][lang]).join(", ");

  // ---------- ЭКЗАМЕНЫ ----------
  if (profile.plannedExams.includes("ent")) {
    push(
      "ent-plan",
      "exams",
      PERIODS[profile.grade === 11 ? "sepMar" : "weekly"],
      ENTEC,
      { SUBJECTS: subjList(profile.interests.slice(0, 2)) },
    );
    push("ent-register", "exams", PERIODS.marApr, ENTEC, { YEAR: String(releaseYear) });
    if (profile.entEstimate != null && profile.entEstimate < 100) {
      push("ent-boost", "exams", PERIODS.toGrad, DEMO, { ENT: String(profile.entEstimate) });
    }
  }

  if (profile.countries === "kz+abroad" || profile.plannedExams.includes("ielts")) {
    push("ielts", "exams", PERIODS.sixTwelve, {
      label: "ielts.org",
      url: "https://ielts.org",
      kind: "official",
    });
  }

  // ---------- ДОКУМЕНТЫ ----------
  push("docs-id", "documents", PERIODS.now, EGOV);
  if (profile.grade === 11) {
    push("docs-diploma", "documents", PERIODS.jun, EGOV);
  }
  push("docs-grant", "documents", PERIODS.julAug, EGOV);

  // ---------- АКАДЕМИЧЕСКИЕ ШАГИ ----------
  const weak = Object.entries(profile.strengths)
    .filter(([, v]) => (v ?? 0) <= 2)
    .map(([k]) => k);
  if (weak.length) {
    push("acad-weak", "academic", PERIODS.toDec, EGOV, { SUBJECTS: subjList(weak) });
  }
  if (profile.grade !== 11) {
    push("acad-profile", "academic", PERIODS.toYearEnd, EGOV);
  }
  push("acad-gpa", "academic", PERIODS.allYear, EGOV);

  // ---------- АКТИВНОСТИ ----------
  if (profile.interests.includes("cs") || profile.interests.includes("math")) {
    push("act-olympiad", "activities", PERIODS.octMar, EGOV);
  }
  if (profile.interests.includes("biology") || profile.interests.includes("chemistry")) {
    push("act-science", "activities", PERIODS.decApr, EGOV);
  }
  push("act-volunteer", "activities", PERIODS.allYear, EGOV);

  return steps;
}

/** Первый незавершённый пункт плана — кандидат в «следующее действие» */
export function firstOpenStep(steps: RoadmapStep[], done: string[]): RoadmapStep | null {
  return steps.find((s) => !done.includes(s.id)) ?? null;
}
