/**
 * Локализованные строки движков: справочники + шаблоны объяснений
 * для диагностики, рекомендаций и roadmap на RU / KZ / EN.
 * Чистые функции от профиля и языка — движок остаётся детерминированным.
 */

import type { Lang } from "@/i18n/dictionaries";
import type { CityId, ExamId, MajorId, Profile, SubjectId } from "@/types";
import { formatTenge } from "@/lib/constants";

/* ---------- Справочники ---------- */

export const CITY_L: Record<CityId, Record<Lang, string>> = {
  almaty: { ru: "Алматы", kk: "Алматы", en: "Almaty" },
  astana: { ru: "Астана", kk: "Астана", en: "Astana" },
  shymkent: { ru: "Шымкент", kk: "Шымкент", en: "Shymkent" },
  karaganda: { ru: "Караганда", kk: "Қарағанды", en: "Karaganda" },
  aktobe: { ru: "Актобе", kk: "Ақтөбе", en: "Aktobe" },
  taraz: { ru: "Тараз", kk: "Тараз", en: "Taraz" },
  pavlodar: { ru: "Павлодар", kk: "Павлодар", en: "Pavlodar" },
  oskemen: { ru: "Усть-Каменогорск", kk: "Өскемен", en: "Oskemen" },
  atyrau: { ru: "Атырау", kk: "Атырау", en: "Atyrau" },
  aktau: { ru: "Актау", kk: "Ақтау", en: "Aktau" },
  turkistan: { ru: "Туркестан", kk: "Түркістан", en: "Turkistan" },
  kostanay: { ru: "Костанай", kk: "Қостанай", en: "Kostanay" },
  semey: { ru: "Семей", kk: "Семей", en: "Semey" },
  other: { ru: "Другой город", kk: "Басқа қала", en: "Another city" },
  any: { ru: "Не важно / готов переехать", kk: "Маңызды емес / көшуге дайынмын", en: "Any / ready to relocate" },
};

export const SUBJECT_L: Record<SubjectId, Record<Lang, string>> = {
  math: { ru: "Математика", kk: "Математика", en: "Math" },
  physics: { ru: "Физика", kk: "Физика", en: "Physics" },
  cs: { ru: "Информатика", kk: "Информатика", en: "Computer science" },
  chemistry: { ru: "Химия", kk: "Химия", en: "Chemistry" },
  biology: { ru: "Биология", kk: "Биология", en: "Biology" },
  history: { ru: "История Казахстана", kk: "Қазақстан тарихы", en: "History of Kazakhstan" },
  worldHistory: { ru: "Всемирная история", kk: "Әлем тарихы", en: "World history" },
  geography: { ru: "География", kk: "География", en: "Geography" },
  kazakh: { ru: "Казахский язык", kk: "Қазақ тілі", en: "Kazakh" },
  russian: { ru: "Русский язык", kk: "Орыс тілі", en: "Russian" },
  english: { ru: "Английский язык", kk: "Ағылшын тілі", en: "English" },
  economics: { ru: "Экономика", kk: "Экономика", en: "Economics" },
  law: { ru: "Право", kk: "Құқық", en: "Law basics" },
  art: { ru: "Художественный труд / черчение", kk: "Көркем еңбек / сызу", en: "Art & drafting" },
  pe: { ru: "Физкультура", kk: "Дене шынықтыру", en: "Physical education" },
  german: { ru: "Немецкий язык", kk: "Неміс тілі", en: "German" },
  french: { ru: "Французский язык", kk: "Француз тілі", en: "French" },
};

export const EXAM_L: Record<ExamId, Record<Lang, string>> = {
  ent: { ru: "ЕНТ", kk: "ЖБТ", en: "ENT" },
  ielts: { ru: "IELTS", kk: "IELTS", en: "IELTS" },
  sat: { ru: "SAT", kk: "SAT", en: "SAT" },
};

/** Локализованные названия специальностей (майоров) */
export const MAJOR_L: Record<MajorId, Record<Lang, string>> = {
  // IT
  "computer-science": { ru: "Компьютерные науки", kk: "Компьютерлік ғылымдар", en: "Computer Science" },
  "information-systems": { ru: "Информационные системы", kk: "Ақпараттық жүйелер", en: "Information Systems" },
  "software-engineering": { ru: "Программная инженерия", kk: "Бағдарламалық инженерия", en: "Software Engineering" },
  cybersecurity: { ru: "Кибербезопасность", kk: "Киберқауіпсіздік", en: "Cybersecurity" },
  "media-tech": { ru: "Медиатехнологии и коммуникации", kk: "Медиатехнологиялар", en: "Media Technologies" },
  telecom: { ru: "Телекоммуникации", kk: "Телекоммуникациялар", en: "Telecommunications" },
  // Engineering
  mining: { ru: "Горное дело", kk: "Тау-кен ісі", en: "Mining Engineering" },
  "chem-eng": { ru: "Химическая инженерия", kk: "Химиялық инженерия", en: "Chemical Engineering" },
  civil: { ru: "Строительство", kk: "Құрылыс", en: "Civil Engineering" },
  mechanical: { ru: "Машиностроение", kk: "Машина жасау", en: "Mechanical Engineering" },
  "oil-gas": { ru: "Нефтегазовое дело", kk: "Мұнай-газ ісі", en: "Oil & Gas Engineering" },
  transport: { ru: "Транспортная инженерия", kk: "Көлік инженериясы", en: "Transport Engineering" },
  power: { ru: "Энергетика", kk: "Энергетика", en: "Power Engineering" },
  geology: { ru: "Геология", kk: "Геология", en: "Geology" },
  metallurgy: { ru: "Металлургия", kk: "Металлургия", en: "Metallurgy" },
  // Medicine
  "general-medicine": { ru: "Общая медицина", kk: "Жалпы медицина", en: "General Medicine" },
  dentistry: { ru: "Стоматология", kk: "Стоматология", en: "Dentistry" },
  pharmacy: { ru: "Фармация", kk: "Фармация", en: "Pharmacy" },
  nursing: { ru: "Сестринское дело", kk: "Медбік ісі", en: "Nursing" },
  // Economics
  finance: { ru: "Финансы", kk: "Қаржы", en: "Finance" },
  management: { ru: "Менеджмент", kk: "Менеджмент", en: "Management" },
  economics: { ru: "Экономика", kk: "Экономика", en: "Economics" },
  accounting: { ru: "Учёт и аудит", kk: "Есеп және аудит", en: "Accounting & Audit" },
  tourism: { ru: "Туризм", kk: "Туризм", en: "Tourism" },
  logistics: { ru: "Логистика", kk: "Логистика", en: "Logistics" },
  // Humanities
  law: { ru: "Юриспруденция", kk: "Құқықтану", en: "Law" },
  journalism: { ru: "Журналистика", kk: "Журналистика", en: "Journalism" },
  "international-relations": { ru: "Международные отношения", kk: "Халықаралық қатынастар", en: "International Relations" },
  "foreign-philology": { ru: "Иностранная филология", kk: "Шетел филологиясы", en: "Foreign Philology" },
  translation: { ru: "Переводческое дело", kk: "Аударма ісі", en: "Translation Studies" },
  pedagogy: { ru: "Педагогика", kk: "Педагогика", en: "Education" },
  psychology: { ru: "Психология", kk: "Психология", en: "Psychology" },
  // Natural
  biology: { ru: "Биология", kk: "Биология", en: "Biology" },
  chemistry: { ru: "Химия", kk: "Химия", en: "Chemistry" },
  ecology: { ru: "Экология", kk: "Экология", en: "Ecology" },
  "geography-science": { ru: "География", kk: "География", en: "Geography" },
  mathematics: { ru: "Математика", kk: "Математика", en: "Mathematics" },
};

const FIELD_L: Record<SubjectId, Record<Lang, string>> = {
  math: { ru: "технических и экономических", kk: "техникалық және экономикалық", en: "technical & economic" },
  physics: { ru: "инженерных", kk: "инженерлік", en: "engineering" },
  cs: { ru: "IT-направлений", kk: "IT-бағыттары", en: "IT" },
  chemistry: { ru: "химических и медицинских", kk: "химиялық және медициналық", en: "chemical & medical" },
  biology: { ru: "медицинских и биологических", kk: "медициналық және биологиялық", en: "medical & biological" },
  history: { ru: "гуманитарных и юридических", kk: "гуманитарлық және құқықтық", en: "humanities & law" },
  worldHistory: { ru: "исторических и международных", kk: "тарихи және халықаралық", en: "historical & international" },
  geography: { ru: "экономических и экологических", kk: "экономикалық және экологиялық", en: "economic & environmental" },
  kazakh: { ru: "филологических и педагогических", kk: "филологиялық және педагогикалық", en: "philology & education" },
  russian: { ru: "филологических и коммуникативных", kk: "филологиялық және коммуникативтік", en: "philology & communication" },
  english: { ru: "международных и языковых", kk: "халықаралық және тілдік", en: "international & language" },
  economics: { ru: "экономических и бизнес-", kk: "экономикалық және бизнес-", en: "economics & business" },
  law: { ru: "юридических", kk: "құқықтық", en: "legal" },
  art: { ru: "архитектурных и творческих", kk: "сәулеттік және шығармашылық", en: "architecture & creative" },
  pe: { ru: "спортивных и педагогических", kk: "спорттық және педагогикалық", en: "sports & education" },
  german: { ru: "языковых и международных", kk: "тілдік және халықаралық", en: "language & international" },
  french: { ru: "языковых и международных", kk: "тілдік және халықаралық", en: "language & international" },
};

const L = (lang: Lang) => (lang === "kk" ? 1 : lang === "en" ? 2 : 0) as 0 | 1 | 2;
const pick = <T,>(lang: Lang, [ru, kk, en]: [T, T, T]): T => [ru, kk, en][L(lang)];

/* ---------- Поиск: предметы + специальности ---------- */

function norm(s: string): string {
  return s.toLowerCase().replace(/[ё]/g, "е").trim();
}

/** Поиск майоров по запросу (ru/en текст названия). Возвращает id с оценкой релевантности. */
export function searchMajors(query: string): Array<{ id: MajorId; score: number }> {
  const q = norm(query);
  if (!q) return [];
  const out: Array<{ id: MajorId; score: number }> = [];
  for (const [id, l] of Object.entries(MAJOR_L) as Array<[MajorId, Record<Lang, string>]>) {
    const hay = `${norm(l.ru)} ${norm(l.en)} ${id}`;
    const idx = hay.indexOf(q);
    if (idx >= 0) out.push({ id, score: idx === 0 ? 2 : 1 });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 8);
}

/** Поиск предметов по запросу */
export function searchSubjects(query: string): Array<{ id: SubjectId; score: number }> {
  const q = norm(query);
  if (!q) return [];
  const out: Array<{ id: SubjectId; score: number }> = [];
  for (const [id, l] of Object.entries(SUBJECT_L) as Array<[SubjectId, Record<Lang, string>]>) {
    const hay = `${norm(l.ru)} ${norm(l.en)} ${norm(l.kk)} ${id}`;
    const idx = hay.indexOf(q);
    if (idx >= 0) out.push({ id, score: idx === 0 ? 2 : 1 });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 8);
}

/* ---------- Диагностика ---------- */

export function budgetLabel(p: Profile, lang: Lang): string {
  if (p.budgetAny) {
    return pick(lang, ["Бюджет не ограничен", "Бюджет шектеусіз", "Budget is not a constraint"]);
  }
  return formatTenge(p.budgetPerYearTenge, lang);
}

export function diagGoal(p: Profile, lang: Lang): string {
  const city = CITY_L[p.city][lang];
  const fields = Array.from(new Set(p.interests.map((s) => FIELD_L[s][lang]))).slice(0, 2);
  const f = fields.length ? fields.join(" / ") : pick(lang, ["выбранных направлений", "таңдалған бағыттар", "chosen fields"]);
  if (lang === "en")
    return `Enrollment in ${p.targetYear} for a program in ${f}${p.city !== "any" ? `, city: ${city}` : " (city doesn't matter)"}.`;
  if (lang === "kk")
    return `${p.targetYear} жылы ${f} бағыты бойынша қабылдау${p.city !== "any" ? `, қала: ${city}` : " (қала маңызды емес)"}.`;
  return `Поступление в ${p.targetYear} году на программу в области ${f}${p.city !== "any" ? `, город: ${city}` : " (город не важен)"}.`;
}

export function diagStrengths(p: Profile, lang: Lang): string[] {
  const out: string[] = [];
  const strong = Object.entries(p.strengths)
    .filter(([, v]) => (v ?? 0) >= 4)
    .map(([k]) => SUBJECT_L[k as SubjectId][lang]);
  const ent = p.entEstimate;
  if (strong.length)
    out.push(
      pick(lang, [
        `Сильные предметы: ${strong.join(", ")}.`,
        `Күшті пәндер: ${strong.join(", ")}.`,
        `Strong subjects: ${strong.join(", ")}.`,
      ]),
    );
  if (p.interests.length) {
    const interests = p.interests.map((s) => SUBJECT_L[s][lang]).join(", ");
    out.push(
      pick(lang, [`Интересы: ${interests}.`, `Қызығушылық: ${interests}.`, `Interests: ${interests}.`]),
    );
  }
  if (p.desiredMajors?.length) {
    const majors = p.desiredMajors.map((m) => MAJOR_L[m][lang]).join(", ");
    out.push(
      pick(lang, [
        `Желаемые специальности: ${majors}.`,
        `Қалаған мамандықтар: ${majors}.`,
        `Desired majors: ${majors}.`,
      ]),
    );
  }
  if (ent != null) {
    out.push(
      ent >= 100
        ? pick(lang, [
            `Прогноз ЕНТ ${ent} — конкурентный балл для грантов и топовых программ.`,
            `ЖБТ болжамы ${ent} — гранттар мен үздік бағдарламалар үшін бәсекеге қабілетті балл.`,
            `ENT estimate ${ent} — a competitive score for grants and top programs.`,
          ])
        : pick(lang, [
            `Прогноз ЕНТ ${ent} — есть программы, куда вы проходите, и запас времени для роста.`,
            `ЖБТ болжамы ${ent} — өтетін бағдарламалар бар және өсуге уақыт жеткілікті.`,
            `ENT estimate ${ent} — there are programs you pass, with room to grow.`,
          ]),
    );
  }
  return out;
}

export function diagConstraints(p: Profile, lang: Lang): string[] {
  const out: string[] = [];
  const city = CITY_L[p.city][lang];
  out.push(
    p.budgetAny
      ? pick(lang, [
          `Бюджет: не ограничен${p.needsDorm ? " + общежитие" : ""} — рассматриваете и платные топ-программы.`,
          `Бюджет: шектеусіз${p.needsDorm ? " + жатақхана" : ""} — үздік ақылы бағдарламалар да қарастырылады.`,
          `Budget: not limited${p.needsDorm ? " + dormitory" : ""} — top paid programs are considered too.`,
        ])
      : pick(lang, [
          `Бюджет: до ${formatTenge(p.budgetPerYearTenge, lang)} в год${p.needsDorm ? " + общежитие" : ""}.`,
          `Бюджет: жылына ${formatTenge(p.budgetPerYearTenge, lang)}${p.needsDorm ? " + жатақхана" : ""} дейін.`,
          `Budget: up to ${formatTenge(p.budgetPerYearTenge, lang)} per year${p.needsDorm ? " + dormitory" : ""}.`,
        ]),
  );
  if (p.city === "other" || p.city === "any") {
    out.push(
      pick(lang, [
        "Готовность к переезду — расширяет выбор.",
        "Көшуге дайындық — таңдауды кеңейтеді.",
        "Willingness to relocate widens your choice.",
      ]),
    );
  } else {
    out.push(
      pick(lang, [
        `Предпочтение вузам в городе «${city}» — сужает выбор, но снижает расходы.`,
        `«${city}» қаласының университеттеріне басымдық — таңдауды тарылтады, бірақ шығынды азайтады.`,
        `Preference for universities in ${city} — narrows the choice but cuts costs.`,
      ]),
    );
  }
  out.push(
    pick(lang, [
      `Язык обучения: ${p.studyLanguage.toUpperCase()}.`,
      `Оқу тілі: ${p.studyLanguage.toUpperCase()}.`,
      `Study language: ${p.studyLanguage.toUpperCase()}.`,
    ]),
  );
  if (p.plannedExams.includes("ielts")) {
    out.push(
      pick(lang, [
        `IELTS: ${p.ieltsEstimate ? p.ieltsEstimate.toFixed(1) : "планируете сдавать"} — открывает англоязычные программы.`,
        `IELTS: ${p.ieltsEstimate ? p.ieltsEstimate.toFixed(1) : "тапсыру жоспарланған"} — ағылшын тілді бағдарламалар ашылады.`,
        `IELTS: ${p.ieltsEstimate ? p.ieltsEstimate.toFixed(1) : "planned"} — unlocks English-taught programs.`,
      ]),
    );
  }
  if (p.countries === "kz+abroad") {
    out.push(
      pick(lang, [
        "Рассматриваете программы за рубежом — потребуется IELTS/SAT.",
        "Шетел бағдарламаларын қарастырасыз — IELTS/SAT қажет болады.",
        "You're considering programs abroad — IELTS/SAT will be needed.",
      ]),
    );
  }
  return out;
}

export function diagSummary(p: Profile, lang: Lang): string {
  const city = CITY_L[p.city][lang];
  const budget = budgetLabel(p, lang);
  const strong = Object.entries(p.strengths)
    .filter(([, v]) => (v ?? 0) >= 4)
    .map(([k]) => SUBJECT_L[k as SubjectId][lang]);
  const fields = Array.from(new Set(p.interests.map((s) => FIELD_L[s][lang]))).slice(0, 2);
  if (lang === "en")
    return `Class of ${p.targetYear}, grade ${p.grade}. Goal: ${fields.length ? fields.join(" / ") : "suitable"} programs${p.city !== "any" ? ` in ${city}` : ""}. Strengths: ${strong.length ? strong.join(", ").toLowerCase() : "being defined"}. Main constraint — budget of ${budget} per year.`;
  if (lang === "kk")
    return `${p.targetYear} жылғы түлектер, ${p.grade}-сынып. Мақсат — ${fields.length ? fields.join(" / ") : "жарамды"} бағдарламалар${p.city !== "any" ? ` (${city})` : ""}. Күшті жақтары: ${strong.length ? strong.join(", ").toLowerCase() : "анықталуда"}. Негізгі шектеу — жылына ${budget} бюджет.`;
  return `Выпуск ${p.targetYear} года, ${p.grade} класс. Цель — ${fields.length ? fields.join(" / ") : "подходящие"} программы${p.city !== "any" ? ` в ${city}` : ""}. Сильные стороны: ${strong.length ? strong.join(", ").toLowerCase() : "определяются"}. Основное ограничение — бюджет ${budget} в год.`;
}

/* ---------- Рекомендации: причины и предупреждения ---------- */

export function reasonSubjects(overlap: SubjectId[], lang: Lang): string {
  const list = overlap.map((s) => SUBJECT_L[s][lang]).join(", ");
  if (lang === "en") return `Entry subjects (${list}) match your interests and strengths.`;
  if (lang === "kk") return `Түсу пәндері (${list}) қызығушылығыңыз бен күшті жақтарыңызға сәйкес.`;
  return `Профильные предметы (${list}) совпадают с вашими интересами и сильными сторонами.`;
}

export function reasonSubjectsPartial(overlap: SubjectId[], lang: Lang): string {
  const list = overlap.map((s) => SUBJECT_L[s][lang]).join(", ");
  if (lang === "en") return `Some entry subjects (${list}) are close to you.`;
  if (lang === "kk") return `Түсу пәндерінің бір бөлігі (${list}) сізге жақын.`;
  return `Часть предметов поступления (${list}) вам близка.`;
}

export function reasonMajorMatch(lang: Lang): string {
  return pick(lang, [
    "Совпадает с желаемой специальностью из вашей анкеты.",
    "Сауалнамадағы қалаған мамандығыңызға сәйкес.",
    "Matches a desired major from your questionnaire.",
  ]);
}

export function reasonBudget(tuition: number, budget: number, lang: Lang): string {
  const t = formatTenge(tuition, lang);
  const b = formatTenge(budget, lang);
  if (lang === "en") return `${t} per year — within your budget of ${b}.`;
  if (lang === "kk") return `${t} жылына — ${b} бюджетіңізге сай.`;
  return `${t} в год — в вашем бюджете до ${b}.`;
}

export function reasonBudgetAny(tuition: number, lang: Lang): string {
  const t = formatTenge(tuition, lang);
  if (lang === "en") return `${t} per year — shown because budget is not a constraint.`;
  if (lang === "kk") return `${t} жылына — бюджет шектеусіз болғандықтан көрсетілген.`;
  return `${t} в год — показано, так как бюджет не ограничен.`;
}

export function warnBudgetSlightly(tuition: number, budget: number, lang: Lang): string {
  const t = formatTenge(tuition, lang);
  const b = formatTenge(budget, lang);
  if (lang === "en") return `Tuition ${t} is slightly above your budget (${b}) — consider a grant.`;
  if (lang === "kk") return `Құны ${t} бюджеттен (${b}) сәл жоғары — грантты қарастырыңыз.`;
  return `Стоимость ${t} немного выше бюджета (${b}) — рассмотрите грант.`;
}

export function warnBudgetFar(tuition: number, budget: number, lang: Lang): string {
  const t = formatTenge(tuition, lang);
  const b = formatTenge(budget, lang);
  if (lang === "en") return `Tuition ${t} is well above your budget (${b}).`;
  if (lang === "kk") return `Құны ${t} бюджеттен (${b}) айтарлықтай жоғары.`;
  return `Стоимость ${t} заметно выше вашего бюджета (${b}).`;
}

export function reasonEntAbove(ent: number, passing: number, lang: Lang): string {
  if (lang === "en") return `Your ENT estimate ${ent} is above last year's passing score (${passing}).`;
  if (lang === "kk") return `ЖБТ болжамыңыз ${ent} — өткен жылғы өту балынан (${passing}) жоғары.`;
  return `Ваш прогноз ЕНТ ${ent} — выше проходного прошлого года (${passing}).`;
}

export function reasonEntClose(ent: number, passing: number, lang: Lang): string {
  if (lang === "en")
    return `Last year's passing score (${passing}) matches your estimate ${ent}: realistic, but needs steady preparation.`;
  if (lang === "kk")
    return `Өткен жылғы өту балы (${passing}) болжамыңызға (${ent}) тең: шынайы, бірақ жүйелі дайындық керек.`;
  return `Проходной прошлого года (${passing}) — на уровне вашего прогноза ${ent}: реально, но потребуется стабильная подготовка.`;
}

export function warnEntBelow(passing: number, ent: number, gap: number, lang: Lang): string {
  if (lang === "en")
    return `Last year's passing score (${passing}) is ${Math.abs(gap)} points above your estimate (${ent}) — strong preparation needed.`;
  if (lang === "kk")
    return `Өткен жылғы өту балы (${passing}) болжамыздан (${ent}) ${Math.abs(gap)} балл жоғары — қатты дайындық керек.`;
  return `Проходной прошлого года (${passing}) выше вашего прогноза (${ent}) на ${Math.abs(gap)} баллов — потребуется сильная подготовка.`;
}

export function warnEntFarBelow(passing: number, ent: number, lang: Lang): string {
  if (lang === "en") return `Last year's passing score (${passing}) is far above your estimate (${ent}).`;
  if (lang === "kk") return `Өткен жылғы өту балы (${passing}) болжамыздан (${ent}) әлдеқайда жоғары.`;
  return `Проходной прошлого года (${passing}) значительно выше прогноза (${ent}).`;
}

export function reasonCityAny(lang: Lang): string {
  return pick(lang, [
    "Город значения не имеет — рассматриваете все варианты.",
    "Қала маңызды емес — барлық нұсқаларды қарастырасыз.",
    "City doesn't matter — you're considering all options.",
  ]);
}

export function reasonCityMatch(lang: Lang): string {
  return pick(lang, ["Вуз в вашем городе — без переезда.", "Университет сіздің қалаңызда — көшусіз.", "University in your city — no relocation."]);
}

export function reasonCityOk(lang: Lang): string {
  return pick(lang, ["Вариант в вашем городе.", "Нұсқа сіздің қалаңызда.", "An option in your city."]);
}

export function warnRelocate(lang: Lang): string {
  return pick(lang, ["Потребуется переезд в другой город.", "Басқа қалаға көшу қажет болады.", "Relocation to another city will be needed."]);
}

export function reasonDorm(lang: Lang): string {
  return pick(lang, ["Есть общежитие — как вам и нужно.", "Жатақхана бар — сізге керек болғандай.", "Dormitory available — exactly what you need."]);
}

export function warnNoDorm(lang: Lang): string {
  return pick(lang, ["Общежития может не быть — уточняйте на сайте вуза.", "Жатақхана болмауы мүмкін — университет сайтынан нақтылаңыз.", "Dormitory may not be available — check the university website."]);
}

export function reasonLanguage(lang: Lang): string {
  return pick(lang, [
    "Программа ведётся на нужном вам языке обучения.",
    "Бағдарлама сізге қажетті оқу тілінде жүргізіледі.",
    "The program is taught in your preferred language.",
  ]);
}

export function reasonUniRating(rating: number, lang: Lang): string {
  if (lang === "en") return `University rating ${rating.toFixed(1)}/5 — strong reputation in open rankings.`;
  if (lang === "kk") return `Университет рейтингісі ${rating.toFixed(1)}/5 — ашық рейтингтерде жоғары баға.`;
  return `Рейтинг вуза ${rating.toFixed(1)}/5 — высокая оценка в открытых рейтингах.`;
}

/* ---------- Roadmap ---------- */

export const ROADMAP_SECTIONS_L: Record<string, Record<Lang, { title: string; description: string }>> = {
  exams: {
    ru: { title: "Экзамены", description: "ЕНТ, IELTS — что и когда сдавать" },
    kk: { title: "Емтихандар", description: "ЖБТ, IELTS — не мен қашан тапсыру" },
    en: { title: "Exams", description: "ENT, IELTS — what and when to take" },
  },
  documents: {
    ru: { title: "Документы", description: "Заявления, аттестат, справки" },
    kk: { title: "Құжаттар", description: "Өтініштер, аттестат, анықтамалар" },
    en: { title: "Documents", description: "Applications, diploma, certificates" },
  },
  academic: {
    ru: { title: "Академические шаги", description: "Предметы и оценки до выпуска" },
    kk: { title: "Академиялық қадамдар", description: "Пәндер және бағалар выпускқа дейін" },
    en: { title: "Academic steps", description: "Subjects and grades before graduation" },
  },
  activities: {
    ru: { title: "Активности", description: "Олимпиады, проекты, волонтёрство" },
    kk: { title: "Белсенділіктер", description: "Олимпиадалар, жобалар, волонтёрлік" },
    en: { title: "Activities", description: "Olympiads, projects, volunteering" },
  },
};

export function roadmapStrings(id: string, lang: Lang): { title: string; why: string } | null {
  const T: Record<string, Record<Lang, { title: string; why: string }>> = {
    "ent-plan": {
      ru: {
        title: "Составьте план подготовки к ЕНТ по профильным предметам",
        why: `ЕНТ — главный экзамен для поступления в вузы КЗ. Ваши предметы: {{SUBJECTS}}.`,
      },
      kk: {
        title: "ЖБТ-ға дайындық жоспарын құрыңыз",
        why: `ЖБТ — ҚР университеттеріне түсудің басты емтиханы. Пәндеріңіз: {{SUBJECTS}}.`,
      },
      en: {
        title: "Build your ENT prep plan for your entry subjects",
        why: `ENT is the main exam for Kazakh universities. Your subjects: {{SUBJECTS}}.`,
      },
    },
    "ent-register": {
      ru: { title: "Регистрация на ЕНТ (выпуск {{YEAR}})", why: "Регистрация обычно открывается весной — не пропустите окно." },
      kk: { title: "ЖБТ тіркелуі (түлек {{YEAR}})", why: "Тіркелу әдетте көктемде ашылады — мезгілді жібермейңіз." },
      en: { title: "ENT registration (class of {{YEAR}})", why: "Registration usually opens in spring — don't miss the window." },
    },
    "ent-boost": {
      ru: { title: "Цель по баллу: 100+", why: "Прогноз {{ENT}}. Балл 100+ открывает больше программ и грантов." },
      kk: { title: "Бал мақсаты: 100+", why: "Болжам {{ENT}}. 100+ балл көбірек бағдарлама мен грант ашады." },
      en: { title: "Score goal: 100+", why: "Your estimate is {{ENT}}. A 100+ score unlocks more programs and grants." },
    },
    ielts: {
      ru: { title: "Подготовка к IELTS (цель 6.5+)", why: "Нужен для англоязычных программ и зарубежных вузов." },
      kk: { title: "IELTS дайындығы (мақсат 6.5+)", why: "Ағылшын тілді бағдарламалар мен шетел университеттері үшін керек." },
      en: { title: "IELTS preparation (target 6.5+)", why: "Required for English-taught programs and universities abroad." },
    },
    "docs-id": {
      ru: { title: "Проверьте документы и УИН", why: "Для регистрации на ЕНТ и подачи в вузы нужны действующие документы." },
      kk: { title: "Құжаттар мен ЖСН-ді тексеріңіз", why: "ЖБТ тіркелуі мен университеттерге өтініш үшін жарамды құжаттар керек." },
      en: { title: "Check your documents and IIN", why: "Valid documents are needed for ENT registration and university applications." },
    },
    "docs-diploma": {
      ru: { title: "Аттестат об окончании школы", why: "Понадобится при зачислении; аттестат с отличием даёт надбавку к конкурсу грантов." },
      kk: { title: "Мектеп бітіру аттестаты", why: "Қабылдау кезінде керек; үлгілі аттестат грант конкурсына үстеме береді." },
      en: { title: "School graduation certificate", why: "Needed at enrollment; a honours diploma adds points in the grant competition." },
    },
    "docs-grant": {
      ru: { title: "Заявление на грант", why: "Гранты распределяются после ЕНТ — заявление подаётся через вуз или портал." },
      kk: { title: "Грантқа өтініш", why: "Гранттар ЖБТ-дан кейін бөлінеді — өтініш университет немесе портал арқылы беріледі." },
      en: { title: "Grant application", why: "Grants are allocated after the ENT — apply via the university or the portal." },
    },
    "acad-weak": {
      ru: { title: "Подтянуть: {{SUBJECTS}}", why: "Слабые предметы снижают балл ЕНТ и шансы на грант." },
      kk: { title: "Көтеру: {{SUBJECTS}}", why: "Әлсіз пәндер ЖБТ балын және грант мүмкіндігін төмендетеді." },
      en: { title: "Strengthen: {{SUBJECTS}}", why: "Weak subjects lower your ENT score and grant chances." },
    },
    "acad-profile": {
      ru: { title: "Выбрать профильные предметы на следующий год", why: "Профильные предметы должны совпадать с предметами ЕНТ по выбранному направлению." },
      kk: { title: "Келесі жылға профильді пәндерді таңдау", why: "Профильді пәндер таңдалған бағыттың ЖБТ пәндеріне сәйкес болуы керек." },
      en: { title: "Choose profile subjects for next year", why: "Profile subjects must match the ENT subjects of your chosen field." },
    },
    "acad-gpa": {
      ru: { title: "Держите оценки для аттестата с отличием", why: "Аттестат с отличием даёт надбавку к баллу при конкурсе на грант." },
      kk: { title: "Үлгілі аттестат үшін бағаларды сақтаңыз", why: "Үлгілі аттестат грант конкурсында балға үстеме береді." },
      en: { title: "Keep grades for a honours certificate", why: "A honours certificate adds points in the grant competition." },
    },
    "act-olympiad": {
      ru: { title: "Олимпиада по математике/информатике", why: "Призёры получают гранты вне квоты или преимущества при зачислении." },
      kk: { title: "Математика/информатика олимпиадасы", why: "Жеңімпаздар квотадан тыс грант немесе қабылдауда артықшылық алады." },
      en: { title: "Math/CS olympiad", why: "Winners get grants outside the quota or enrollment advantages." },
    },
    "act-science": {
      ru: { title: "Научный проект по биологии/химии", why: "Усиливает портфолио для медицинских и научных программ." },
      kk: { title: "Биология/химия ғылыми жобасы", why: "Медициналық және ғылыми бағдарламаларға портфолионы күшейтеді." },
      en: { title: "Science project in biology/chemistry", why: "Strengthens your portfolio for medical and science programs." },
    },
    "act-volunteer": {
      ru: { title: "Волонтёрство или социальный проект", why: "Развивает мягкие навыки и укрепляет мотивационное письмо." },
      kk: { title: "Волонтёрлік немесе әлеуметтік жоба", why: "Жұмсақ дағдыларды дамытады және мотивациялық хатты нығайтады." },
      en: { title: "Volunteering or a social project", why: "Builds soft skills and strengthens your motivation letter." },
    },
  };
  const entry = T[id];
  if (!entry) return null;
  return entry[lang] ?? entry.ru;
}

/* ---------- Стипендии (демо) ---------- */

export interface Scholarship {
  id: string;
  name: Record<Lang, string>;
  provider: string;
  url: string;
  amount: Record<Lang, string>;
  deadline: string;
  fields: Array<ProgramFieldLike>;
  minENT: number | null;
  budgetMax: number | null;
  note: Record<Lang, string>;
}

type ProgramFieldLike = "it" | "engineering" | "medicine" | "economics" | "humanities" | "natural";

export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: "state-grant",
    name: {
      ru: "Государственный грант РК",
      kk: "ҚР Мемлекеттік гранты",
      en: "KZ state education grant",
    },
    provider: "Министерство просвещения РК",
    url: "https://egov.kz",
    amount: {
      ru: "Полное покрытие обучения",
      kk: "Оқуды толық қамту",
      en: "Full tuition coverage",
    },
    deadline: "июль — август",
    fields: ["it", "engineering", "medicine", "economics", "humanities", "natural"],
    minENT: null,
    budgetMax: null,
    note: {
      ru: "Распределяется по конкурсу баллов ЕНТ. Основной способ учиться бесплатно.",
      kk: "ЖБТ балдарының конкурсымен бөлінеді. Тегін оқудың негізгі жолы.",
      en: "Allocated via ENT score competition. The main route to tuition-free study.",
    },
  },
  {
    id: "bolashak-young",
    name: { ru: "Стипендия «Болашақ» (программы для молодёжи)", kk: "«Болашақ» стипендиясы", en: "Bolashak scholarship" },
    provider: "Center for International Programs",
    url: "https://bolashak.gov.kz",
    amount: { ru: "Обучение за рубежом + стипендия", kk: "Шетелде оқу + стипендия", en: "Study abroad + stipend" },
    deadline: "по набору",
    fields: ["it", "engineering", "medicine", "economics", "natural"],
    minENT: null,
    budgetMax: null,
    note: {
      ru: "Конкурсная программа: для бакалавриата обычно требуется учёба на 1 курсе вуза КЗ — план на 2–3 шаг вперёд.",
      kk: "Бәсекелі бағдарлама: бакалавриатқа әдетте ҚР вузының 1-курсы талап етіледі — 2–3 қадам алға жоспарлаңыз.",
      en: "Competitive program: bachelor's track usually requires studying in a KZ university first — plan 2–3 steps ahead.",
    },
  },
  {
    id: "kbtu-nerf",
    name: { ru: "NERF — Need-based грант KBTU", kk: "NERF — KBTU қажеттілік гранты", en: "NERF need-based grant (KBTU)" },
    provider: "KBTU / Bashneft Heritage",
    url: "https://kbtu.kz",
    amount: { ru: "Частичное покрытие обучения", kk: "Оқуды ішінара қамту", en: "Partial tuition coverage" },
    deadline: "сентябрь",
    fields: ["it", "engineering", "economics", "natural"],
    minENT: null,
    budgetMax: 1_500_000,
    note: {
      ru: "Для абитуриентов из семей с невысоким доходом: снижает финансовую нагрузку.",
      kk: "Табысы төмен отбасылар үшін: қаржылық жүктемені азайтады.",
      en: "For applicants from lower-income families: reduces financial pressure.",
    },
  },
  {
    id: "aiu-merit",
    name: { ru: "Merit-стипендия AIU", kk: "AIU merit-стипендиясы", en: "AIU merit scholarship" },
    provider: "Almaty International University",
    url: "https://aiu.edu.kz",
    amount: { ru: "До 50% обучения", kk: "Оқудың 50%-ына дейін", en: "Up to 50% of tuition" },
    deadline: "июнь — август",
    fields: ["it", "economics", "humanities"],
    minENT: 105,
    budgetMax: null,
    note: {
      ru: "За высокий балл ЕНТ и достижения: автоматически рассматривается при подаче.",
      kk: "Жоғары ЖБТ балы мен жетістіктер үшін: өтініммен бірге автоматты қарастырылады.",
      en: "For high ENT scores and achievements: considered automatically upon application.",
    },
  },
  {
    id: "narxoz-impact",
    name: { ru: "Narxoz Impact Scholarship", kk: "Narxoz Impact стипендиясы", en: "Narxoz Impact Scholarship" },
    provider: "Narxoz University",
    url: "https://narxoz.kz",
    amount: { ru: "До 70% обучения", kk: "Оқудың 70%-ына дейін", en: "Up to 70% of tuition" },
    deadline: "июль",
    fields: ["economics", "it", "humanities"],
    minENT: 110,
    budgetMax: null,
    note: {
      ru: "За лидерство и социальные проекты — совпадает с блоком «Активности» плана.",
      kk: "Көшбасшылық пен әлеуметтік жобалар үшін — жоспардың «Белсенділіктер» бөліміне сай.",
      en: "For leadership and social projects — aligns with the “Activities” block of your plan.",
    },
  },
];

export function scholarshipFits(s: Scholarship, p: Profile): boolean {
  if (p.entEstimate != null && s.minENT != null && p.entEstimate < s.minENT) return false;
  if (!p.budgetAny && s.budgetMax != null && p.budgetPerYearTenge > s.budgetMax) return false;
  return true;
}
