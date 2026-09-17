/** Общие константы интерфейса: этапы пути, справочники для анкеты, форматтеры */

import type { Lang } from "@/i18n/dictionaries";
import type { CityId, ExamId, StepId, SubjectId } from "@/types";

/** Обязательные 7 этапов кейса — единый источник для Stepper и навигации */
export const STEPS: Array<{ id: StepId; path: string; label: Record<Lang, string> }> = [
  { id: "entry", path: "/", label: { ru: "Вход", kk: "Кіру", en: "Start" } },
  { id: "profile", path: "/profile", label: { ru: "Профиль", kk: "Профиль", en: "Profile" } },
  {
    id: "diagnostics",
    path: "/diagnostics",
    label: { ru: "Диагностика", kk: "Диагностика", en: "Diagnostics" },
  },
  {
    id: "results",
    path: "/results",
    label: { ru: "Рекомендации", kk: "Ұсыныстар", en: "Recommendations" },
  },
  {
    id: "compare",
    path: "/compare",
    label: { ru: "Сравнение", kk: "Салыстыру", en: "Compare" },
  },
  { id: "roadmap", path: "/roadmap", label: { ru: "План", kk: "Жоспар", en: "Plan" } },
  {
    id: "next",
    path: "/roadmap",
    label: { ru: "Следующий шаг", kk: "Келесі қадам", en: "Next step" },
  },
];

export const STEP_INDEX: Record<StepId, number> = Object.fromEntries(
  STEPS.map((s, i) => [s.id, i]),
) as Record<StepId, number>;

export const SUBJECTS: Array<{ id: SubjectId; emoji: string; label: Record<Lang, string> }> = [
  { id: "math", emoji: "➗", label: { ru: "Математика", kk: "Математика", en: "Math" } },
  { id: "physics", emoji: "🧲", label: { ru: "Физика", kk: "Физика", en: "Physics" } },
  { id: "cs", emoji: "💻", label: { ru: "Информатика", kk: "Информатика", en: "Computer science" } },
  { id: "chemistry", emoji: "⚗️", label: { ru: "Химия", kk: "Химия", en: "Chemistry" } },
  { id: "biology", emoji: "🧬", label: { ru: "Биология", kk: "Биология", en: "Biology" } },
  { id: "geography", emoji: "🌍", label: { ru: "География", kk: "География", en: "Geography" } },
  { id: "history", emoji: "🏛️", label: { ru: "История", kk: "Тарих", en: "History" } },
  { id: "economics", emoji: "📈", label: { ru: "Экономика", kk: "Экономика", en: "Economics" } },
  { id: "kazakh", emoji: "📖", label: { ru: "Казахский язык", kk: "Қазақ тілі", en: "Kazakh" } },
  { id: "russian", emoji: "✍️", label: { ru: "Русский язык", kk: "Орыс тілі", en: "Russian" } },
  { id: "english", emoji: "🔤", label: { ru: "Английский язык", kk: "Ағылшын тілі", en: "English" } },
];

export const CITIES: Array<{ id: CityId; label: Record<Lang, string> }> = [
  { id: "almaty", label: { ru: "Алматы", kk: "Алматы", en: "Almaty" } },
  { id: "astana", label: { ru: "Астана", kk: "Астана", en: "Astana" } },
  { id: "shymkent", label: { ru: "Шымкент", kk: "Шымкент", en: "Shymkent" } },
  { id: "other", label: { ru: "Другой город", kk: "Басқа қала", en: "Another city" } },
  { id: "any", label: { ru: "Не важно / готов переехать", kk: "Маңызды емес", en: "Any / relocate" } },
];

export const EXAMS: Array<{ id: ExamId; label: Record<Lang, string>; hint: Record<Lang, string> }> = [
  {
    id: "ent",
    label: { ru: "ЕНТ", kk: "ЖБТ", en: "ENT" },
    hint: { ru: "Единое национальное тестирование", kk: "Ұлттық бірыңғай тестілеу", en: "Unified national testing" },
  },
  {
    id: "ielts",
    label: { ru: "IELTS", kk: "IELTS", en: "IELTS" },
    hint: { ru: "Для программ на английском и за рубежом", kk: "Ағылшын тілді бағдарламаларға", en: "For English-taught programs" },
  },
  {
    id: "sat",
    label: { ru: "SAT", kk: "SAT", en: "SAT" },
    hint: { ru: "Для зарубежных вузов", kk: "Шетел университеттеріне", en: "For universities abroad" },
  },
];

export const LANGUAGES: Array<{ id: "ru" | "kz" | "en"; label: Record<Lang, string> }> = [
  { id: "ru", label: { ru: "Русский", kk: "Орысша", en: "Russian" } },
  { id: "kz", label: { ru: "Казахский", kk: "Қазақша", en: "Kazakh" } },
  { id: "en", label: { ru: "Английский", kk: "Ағылшынша", en: "English" } },
];

export const MIN_BUDGET = 300_000;
export const MAX_BUDGET = 4_000_000;
export const BUDGET_STEP = 50_000;

export const MIN_ENT = 50;
export const MAX_ENT = 140;

/** Форматирование суммы в тенге (числа одинаковы для всех языков, разделители локали RU/KZ) */
export function formatTenge(n: number, lang: Lang = "ru"): string {
  const locale = lang === "en" ? "en-US" : "ru-RU";
  return `${new Intl.NumberFormat(locale).format(n)} ₸`;
}
