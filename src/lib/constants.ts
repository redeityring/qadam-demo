/** Общие константы интерфейса: этапы пути, справочники для анкеты */

import type { CityId, ExamId, StepId, SubjectId } from "@/types";

/** Обязательные 7 этапов кейса — единый источник для Stepper и навигации */
export const STEPS: Array<{ id: StepId; label: string; path: string }> = [
  { id: "entry", label: "Вход", path: "/" },
  { id: "profile", label: "Профиль", path: "/profile" },
  { id: "diagnostics", label: "Диагностика", path: "/diagnostics" },
  { id: "results", label: "Рекомендации", path: "/results" },
  { id: "compare", label: "Сравнение", path: "/compare" },
  { id: "roadmap", label: "План", path: "/roadmap" },
  { id: "next", label: "Следующий шаг", path: "/roadmap" },
];

export const STEP_INDEX: Record<StepId, number> = Object.fromEntries(
  STEPS.map((s, i) => [s.id, i]),
) as Record<StepId, number>;

export const SUBJECTS: Array<{ id: SubjectId; label: string; emoji: string }> = [
  { id: "math", label: "Математика", emoji: "➗" },
  { id: "physics", label: "Физика", emoji: "🧲" },
  { id: "cs", label: "Информатика", emoji: "💻" },
  { id: "chemistry", label: "Химия", emoji: "⚗️" },
  { id: "biology", label: "Биология", emoji: "🧬" },
  { id: "geography", label: "География", emoji: "🌍" },
  { id: "history", label: "История", emoji: "🏛️" },
  { id: "economics", label: "Экономика", emoji: "📈" },
  { id: "kazakh", label: "Казахский язык", emoji: "📖" },
  { id: "russian", label: "Русский язык", emoji: "✍️" },
  { id: "english", label: "Английский язык", emoji: "🔤" },
];

export const SUBJECT_LABEL: Record<SubjectId, string> = Object.fromEntries(
  SUBJECTS.map((s) => [s.id, s.label]),
) as Record<SubjectId, string>;

export const CITIES: Array<{ id: CityId; label: string }> = [
  { id: "almaty", label: "Алматы" },
  { id: "astana", label: "Астана" },
  { id: "shymkent", label: "Шымкент" },
  { id: "other", label: "Другой город" },
  { id: "any", label: "Не важно / готов переехать" },
];

export const EXAMS: Array<{ id: ExamId; label: string; hint: string }> = [
  { id: "ent", label: "ЕНТ", hint: "Единое национальное тестирование" },
  { id: "ielts", label: "IELTS", hint: "Для программ на английском и за рубежом" },
  { id: "sat", label: "SAT", hint: "Для зарубежных вузов" },
];

export const LANGUAGES: Array<{ id: "ru" | "kz" | "en"; label: string }> = [
  { id: "ru", label: "Русский" },
  { id: "kz", label: "Казахский" },
  { id: "en", label: "Английский" },
];

export const MIN_BUDGET = 300_000;
export const MAX_BUDGET = 4_000_000;
export const BUDGET_STEP = 50_000;

export const MIN_ENT = 50;
export const MAX_ENT = 140;

/** Форматирование суммы в тенге: 950 000 ₸ */
export function formatTenge(n: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(n)} ₸`;
}
