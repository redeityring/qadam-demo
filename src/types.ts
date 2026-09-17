/** Доменные типы продукта «Qadam» */

export type SubjectId =
  | "math"
  | "physics"
  | "cs"
  | "chemistry"
  | "biology"
  | "history"
  | "worldHistory"
  | "geography"
  | "kazakh"
  | "russian"
  | "english"
  | "economics"
  | "law"
  | "art"
  | "pe"
  | "german"
  | "french";

export type StudyLanguage = "ru" | "kz" | "en";

export type CityId =
  | "almaty"
  | "astana"
  | "shymkent"
  | "karaganda"
  | "aktobe"
  | "taraz"
  | "pavlodar"
  | "oskemen"
  | "atyrau"
  | "aktau"
  | "turkistan"
  | "kostanay"
  | "semey"
  | "other"
  | "any";

export type ExamId = "ent" | "ielts" | "sat";

export type ProgramField =
  | "it"
  | "engineering"
  | "medicine"
  | "economics"
  | "humanities"
  | "natural";

/** Ключ специальности (майора) — локализуемое название из i18n/engine MAJOR_L */
export type MajorId =
  // IT
  | "computer-science"
  | "information-systems"
  | "software-engineering"
  | "cybersecurity"
  | "media-tech"
  | "telecom"
  // Engineering
  | "mining"
  | "chem-eng"
  | "civil"
  | "mechanical"
  | "oil-gas"
  | "transport"
  | "power"
  | "geology"
  | "metallurgy"
  // Medicine
  | "general-medicine"
  | "dentistry"
  | "pharmacy"
  | "nursing"
  // Economics
  | "finance"
  | "management"
  | "economics"
  | "accounting"
  | "tourism"
  | "logistics"
  // Humanities
  | "law"
  | "journalism"
  | "international-relations"
  | "foreign-philology"
  | "translation"
  | "pedagogy"
  | "psychology"
  // Natural
  | "biology"
  | "chemistry"
  | "ecology"
  | "geography-science"
  | "mathematics";

export interface Profile {
  /** Класс обучения */
  grade: 9 | 10 | 11;
  city: CityId;
  /** Интересы: 1–4 предмета */
  interests: SubjectId[];
  /** Самооценка силы предмета 1..5 */
  strengths: Partial<Record<SubjectId, number>>;
  /** Желаемые специальности (майоры) — необязательно, до 5 */
  desiredMajors?: MajorId[];
  /** Язык обучения */
  studyLanguage: StudyLanguage;
  /** Бюджет на обучение, ₸ в год */
  budgetPerYearTenge: number;
  /** Бюджет не важен / есть грант-намерение */
  budgetAny?: boolean;
  /** Нужно общежитие */
  needsDorm: boolean;
  /** География: только КЗ или КЗ + за рубеж */
  countries: "kz" | "kz+abroad";
  /** Планируемые экзамены */
  plannedExams: ExamId[];
  /** Прогноз/самооценка балла ЕНТ (50..140) */
  entEstimate: number | null;
  /** Ожидаемый балл IELTS (4.0..9.0, шаг 0.5) */
  ieltsEstimate?: number | null;
  /** Ожидаемый балл SAT (400..1600) */
  satEstimate?: number | null;
  /** Год поступления (выпуск из школы + поступление) */
  targetYear: number;
  /** Служебное: последний отмеченный выполненным «следующий шаг» */
  nextActionDoneAt?: string | null;
  /** Служебное: id выполненных пунктов roadmap */
  doneSteps: string[];
  /** Служебное: id программ, выбранных для сравнения */
  compareIds: string[];
  /** Служебное: id программ, добавленных в избранное */
  favoriteIds: string[];
  /** Приоритеты пользователя: порядок = важность (для взвешивания рекомендаций) */
  priority?: string[];
}

/** Программа обучения (специальность в вузе) */
export interface Program {
  id: string;
  universityId: string;
  /** Ключ специальности для локализации */
  majorId: MajorId;
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
  /** Рейтинг 0..5 (демо-оценка на основе открытых списков) */
  rating?: number;
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
