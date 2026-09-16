/**
 * Движок рекомендаций — чистые функции, детерминированный rule-based скоринг.
 * Каждое слагаемое оценки порождает объяснение человеческим языком.
 *
 * Веса (из плана): предметы 30 / бюджет 25 / академика 20 / формат 15 / язык 10.
 * Язык обучения — единственный хард-фильтр.
 */

import type { Profile, Program, Recommendation, SubjectId } from "@/types";
import { getUniversity, PROGRAMS } from "@/lib/data";
import { formatTenge, SUBJECT_LABEL } from "@/lib/constants";

/** Пересечение введённых интересов и сильных предметов с предметами поступления */
export function subjectOverlap(program: Program, profile: Profile): SubjectId[] {
  const userSubjects = new Set<SubjectId>([
    ...profile.interests,
    ...(Object.entries(profile.strengths)
      .filter(([, v]) => (v ?? 0) >= 4)
      .map(([k]) => k as SubjectId)),
  ]);
  return program.entrySubjects.filter((s) => userSubjects.has(s));
}

function budgetFactor(program: Program, profile: Profile) {
  const { budgetPerYearTenge: b } = profile;
  const t = program.tuitionPerYearTenge;
  if (t <= b) return { ratio: 1, above: false };
  if (t <= b * 1.25) return { ratio: 0.5, above: true };
  return { ratio: 0, above: true };
}

/** Оценка совместимости 0..100 + объяснения */
export function scoreProgram(profile: Profile, program: Program) {
  const reasons: string[] = [];
  const warnings: string[] = [];

  // --- Предметы (30) ---
  const overlap = subjectOverlap(program, profile);
  const subjRatio = program.entrySubjects.length
    ? overlap.length / program.entrySubjects.length
    : 0;
  const subjScore = subjRatio * 30;
  if (overlap.length === program.entrySubjects.length && overlap.length > 0) {
    reasons.push(
      `Профильные предметы (${overlap.map((s) => SUBJECT_LABEL[s]).join(", ")}) совпадают с вашими интересами и сильными сторонами.`,
    );
  } else if (overlap.length > 0) {
    reasons.push(
      `Часть предметов поступления (${overlap.map((s) => SUBJECT_LABEL[s]).join(", ")}) вам близка.`,
    );
  }

  // --- Бюджет (25) --- 
  const { ratio: budRatio, above } = budgetFactor(program, profile);
  const budScore = budRatio * 25;
  if (!above) {
    reasons.push(
      `${formatTenge(program.tuitionPerYearTenge)} в год — в вашем бюджете до ${formatTenge(profile.budgetPerYearTenge)}.`,
    );
  } else if (budRatio > 0) {
    warnings.push(
      `Стоимость ${formatTenge(program.tuitionPerYearTenge)} немного выше бюджета (${formatTenge(profile.budgetPerYearTenge)}) — рассмотрите грант.`,
    );
  } else {
    warnings.push(
      `Стоимость ${formatTenge(program.tuitionPerYearTenge)} заметно выше вашего бюджета (${formatTenge(profile.budgetPerYearTenge)}).`,
    );
  }

  // --- Академическая совместимость (20) ---
  let acadScore = 10; // нейтрально, если данных нет
  if (profile.entEstimate != null && program.historicalPassingENT != null) {
    const gap = profile.entEstimate - program.historicalPassingENT;
    if (gap >= 5) {
      acadScore = 20;
      reasons.push(
        `Ваш прогноз ЕНТ ${profile.entEstimate} — выше проходного прошлого года (${program.historicalPassingENT}).`,
      );
    } else if (gap >= 0) {
      acadScore = 15;
      reasons.push(
        `Проходной прошлого года (${program.historicalPassingENT}) — на уровне вашего прогноза ${profile.entEstimate}: реально, но потребуется стабильная подготовка.`,
      );
    } else if (gap >= -10) {
      acadScore = 8;
      warnings.push(
        `Проходной прошлого года (${program.historicalPassingENT}) выше вашего прогноза (${profile.entEstimate}) на ${Math.abs(gap)} баллов — потребуется сильная подготовка.`,
      );
    } else {
      acadScore = 3;
      warnings.push(
        `Проходной прошлого года (${program.historicalPassingENT}) значительно выше прогноза (${profile.entEstimate}).`,
      );
    }
  }

  // --- Формат: город / общежитие (15) ---
  let formatScore = 8;
  const cityOk =
    profile.city === "any" ||
    profile.city === "other" ||
    program.city === profile.city;
  if (profile.city === "any") {
    formatScore += 4;
    reasons.push("Город значения не имеет — рассматриваете все варианты.");
  } else if (cityOk) {
    formatScore += 7;
    reasons.push(
      program.city === profile.city
        ? "Вуз в вашем городе — без переезда."
        : "Вариант в вашем городе.",
    );
  } else {
    formatScore -= 5;
    warnings.push("Потребуется переезд в другой город.");
  }
  if (profile.needsDorm && program.dorm) {
    formatScore += 3;
    reasons.push("Есть общежитие — как вам и нужно.");
  } else if (profile.needsDorm && !program.dorm) {
    formatScore -= 6;
    warnings.push("Общежития может не быть — уточняйте на сайте вуза.");
  }
  formatScore = Math.max(0, Math.min(15, formatScore));

  // --- Язык (10) ---
  const langOk = program.languages.includes(profile.studyLanguage);
  const langScore = langOk ? 10 : 0;
  if (langOk) reasons.push("Программа ведётся на нужном вам языке обучения.");

  const score = Math.round(subjScore + budScore + acadScore + formatScore + langScore);

  return { score: Math.max(0, Math.min(100, score)), reasons, warnings, langOk };
}

/** Главная функция: топ-N рекомендаций с объяснениями */
export function getRecommendations(profile: Profile, limit = 6): Recommendation[] {
  const scored = PROGRAMS.map((p) => {
    const { score, reasons, warnings, langOk } = scoreProgram(profile, p);
    return { program: p, university: getUniversity(p.universityId), score, reasons, warnings, langOk };
  })
    .filter((r) => r.langOk) // хард-фильтр по языку
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, limit);
  const results: Recommendation[] = top.map(({ program, university, score, reasons, warnings }) => ({
    program,
    university,
    score,
    reasons: reasons.slice(0, 4),
    warnings,
  }));

  // Честная пометка: если после фильтра ничего не осталось — UI покажет EmptyState с советом изменить вводные
  return results;
}
