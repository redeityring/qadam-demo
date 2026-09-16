/** Доменные типы продукта «Траектория» */

export type SubjectId =
  | "math"
  | "physics"
  | "cs"
  | "chemistry"
  | "biology"
  | "history"
  | "geography"
  | "kazakh"
  | "russian"
  | "english"
  | "economics";

export type StudyLanguage = "ru" | "kz" | "en";

export type CityId = "almaty" | "astana" | "shymkent" | "other" | "any";

export type ExamId = "ent" | "ielts" | "sat";

export type ProgramField =
  | "it"
  | "engineering"
  | "medicine"
  | "economics"
  | "humanities"
  | "natural";

export interface Profile {
  /** Класс обучения */
  grade: 9 | 10 | 11;
  city: CityId;
  /** Интересы: 1–4 предмета */
  interests: SubjectId[];
  /** Самооценка силы предмета 1..5 */
  strengths: Partial<Record<SubjectId, number>>;
  /** Язык обучения */
  studyLanguage: StudyLanguage;
  /** Бюджет на обучение, ₸ в год */
  budgetPerYearTenge: number;
  /** Нужно общежитие */
  needsDorm: boolean;
  /** География: только КЗ или КЗ + за рубеж */
  countries: "kz" | "kz+abroad";
  /** Планируемые экзамены */
  plannedExams: ExamId[];
  /** Прогноз/самооценка балла ЕНТ (50..140) */
  entEstimate: number | null;
  /** Год поступления (выпуск из школы + поступление) */
  targetYear: number;
  /** Служебное: последний отмеченный выполненным «следующий шаг» */
  nextActionDoneAt?: string | null;
  /** Служебное: id выполненных пунктов roadmap */
  doneSteps: string[];
  /** Служебное: id программ, выбранных для сравнения */
  compareIds: string[];
}

/** Программа обучения (специальность в вузе) */
export interface Program {
  id: string;
  universityId: string;
  title: string;
  field: ProgramField;
  /** Предметы для поступления */
  entrySubjects: SubjectId[];
  /** Стоимость обучения, ₸ в год */
  tuitionPerYearTenge: number;
  /** Проходной балл ЕНТ прошлого года (демо-данные, подлежит проверке) */
  historicalPassingENT: number | null;
  /** Количество грантов в прошлом году (демо) */
  grantsCount: number | null;
  languages: StudyLanguage[];
  city: CityId;
  dorm: boolean;
  /** Источники данных по программе */
  sources: Array<{ label: string; url?: string; kind: "official" | "demo" }>;
}

export interface University {
  id: string;
  name: string;
  shortName?: string;
  city: CityId;
  /** Краткое описание для карточки */
  blurb: string;
  website: string;
}

/** Результат рекомендации — возвращается движком (этап 2) */
export interface Recommendation {
  program: Program;
  university: University;
  /** Совместимость 0..100 */
  score: number;
  /** Причины «почему подходит» — человеческим языком */
  reasons: string[];
  /** Предупреждения (например, «выше бюджета») */
  warnings: string[];
}

/** Этапы пользовательского пути (обязательные 7 этапов кейса) */
export type StepId =
  | "entry"
  | "profile"
  | "diagnostics"
  | "results"
  | "compare"
  | "roadmap"
  | "next";
