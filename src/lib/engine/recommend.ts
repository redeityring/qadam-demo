/**
 * Движок рекомендаций — чистые функции, детерминированный rule-based скоринг.
 * Каждое слагаемое оценки порождает объяснение человеческим языком (RU/KZ/EN).
 *
 * Веса: предметы 30 / бюджет 25 / академика 20 / формат 15 / язык 10.
 * Язык обучения — единственный хард-фильтр.
 */

import type { Lang } from "@/i18n/dictionaries";
import {
  reasonBudget,
  reasonCityAny,
  reasonCityMatch,
  reasonCityOk,
  reasonDorm,
  reasonEntAbove,
  reasonEntClose,
  reasonLanguage,
  reasonSubjects,
  reasonSubjectsPartial,
  warnBudgetFar,
  warnBudgetSlightly,
  warnEntBelow,
  warnEntFarBelow,
  warnNoDorm,
  warnRelocate,
} from "@/i18n/engine";
import type { Profile, Program, Recommendation, SubjectId } from "@/types";
import { getUniversity, PROGRAMS } from "@/lib/data";

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

/** Оценка совместимости 0..100 + объяснения на выбранном языке */
export function scoreProgram(profile: Profile, program: Program, lang: Lang = "ru") {
  const reasons: string[] = [];
  const warnings: string[] = [];

  // --- Предметы (30) ---
  const overlap = subjectOverlap(program, profile);
  const subjRatio = program.entrySubjects.length
    ? overlap.length / program.entrySubjects.length
    : 0;
  const subjScore = subjRatio * 30;
  if (overlap.length === program.entrySubjects.length && overlap.length > 0) {
    reasons.push(reasonSubjects(overlap, lang));
  } else if (overlap.length > 0) {
    reasons.push(reasonSubjectsPartial(overlap, lang));
  }

  // --- Бюджет (25) ---
  const { ratio: budRatio, above } = budgetFactor(program, profile);
  const budScore = budRatio * 25;
  if (!above) {
    reasons.push(reasonBudget(program.tuitionPerYearTenge, profile.budgetPerYearTenge, lang));
  } else if (budRatio > 0) {
    warnings.push(
      warnBudgetSlightly(program.tuitionPerYearTenge, profile.budgetPerYearTenge, lang),
    );
  } else {
    warnings.push(warnBudgetFar(program.tuitionPerYearTenge, profile.budgetPerYearTenge, lang));
  }

  // --- Академическая совместимость (20) ---
  let acadScore = 10; // нейтрально, если данных нет
  if (profile.entEstimate != null && program.historicalPassingENT != null) {
    const gap = profile.entEstimate - program.historicalPassingENT;
    if (gap >= 5) {
      acadScore = 20;
      reasons.push(reasonEntAbove(profile.entEstimate, program.historicalPassingENT, lang));
    } else if (gap >= 0) {
      acadScore = 15;
      reasons.push(reasonEntClose(profile.entEstimate, program.historicalPassingENT, lang));
    } else if (gap >= -10) {
      acadScore = 8;
      warnings.push(
        warnEntBelow(program.historicalPassingENT, profile.entEstimate, gap, lang),
      );
    } else {
      acadScore = 3;
      warnings.push(warnEntFarBelow(program.historicalPassingENT, profile.entEstimate, lang));
    }
  }

  // --- Формат: город / общежитие (15) ---
  let formatScore = 8;
  if (profile.city === "any") {
    formatScore += 4;
    reasons.push(reasonCityAny(lang));
  } else if (profile.city === "other" || program.city === profile.city) {
    formatScore += 7;
    reasons.push(
      program.city === profile.city ? reasonCityMatch(lang) : reasonCityOk(lang),
    );
  } else {
    formatScore -= 5;
    warnings.push(warnRelocate(lang));
  }
  if (profile.needsDorm && program.dorm) {
    formatScore += 3;
    reasons.push(reasonDorm(lang));
  } else if (profile.needsDorm && !program.dorm) {
    formatScore -= 6;
    warnings.push(warnNoDorm(lang));
  }
  formatScore = Math.max(0, Math.min(15, formatScore));

  // --- Язык (10) ---
  const langOk = program.languages.includes(profile.studyLanguage);
  const langScore = langOk ? 10 : 0;
  if (langOk) reasons.push(reasonLanguage(lang));

  // --- Приоритеты пользователя (бонус до +12, штраф за нижние позиции) ---
  const prio = (profile.priority ?? ["cost", "proximity", "ranking", "dorm"]) as string[];
  const pos = (id: string) => prio.indexOf(id);
  let prioBonus = 0;
  // Стоимость: чем важнее, тем сильнее штраф за превышение бюджета
  if (pos("cost") >= 0) {
    if (above) prioBonus -= (4 - pos("cost")) * 2;
    else prioBonus += (4 - pos("cost")) * 2.5;
  }
  // Близость к дому
  if (pos("proximity") >= 0) {
    if (profile.city === "any" || program.city === profile.city) prioBonus += (4 - pos("proximity")) * 1.5;
    else prioBonus -= (4 - pos("proximity")) * 1.5;
  }
  // Сила программы: прокси — количество грантов и проходной балл
  if (pos("ranking") >= 0) {
    const strength =
      (program.grantsCount ?? 0) / 80 + (program.historicalPassingENT ?? 0) / 140;
    prioBonus += (4 - pos("ranking")) * 1.5 * Math.min(1.5, strength);
  }
  // Общежитие
  if (pos("dorm") >= 0) {
    if (profile.needsDorm) prioBonus += program.dorm ? (4 - pos("dorm")) : -(4 - pos("dorm")) * 0.5;
  }  prioBonus = Math.max(-12, Math.min(12, prioBonus));

  const score = Math.round(subjScore + budScore + acadScore + formatScore + langScore + prioBonus);

  return { score: Math.max(0, Math.min(100, score)), reasons, warnings, langOk };
}

/** Главная функция: топ-N рекомендаций с объяснениями на выбранном языке */
export function getRecommendations(profile: Profile, lang: Lang = "ru", limit = 6): Recommendation[] {
  const scored = PROGRAMS.map((p) => {
    const { score, reasons, warnings, langOk } = scoreProgram(profile, p, lang);
    return {
      program: p,
      university: getUniversity(p.universityId),
      score,
      reasons,
      warnings,
      langOk,
    };
  })
    .filter((r) => r.langOk) // хард-фильтр по языку
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, limit);
  return top.map(({ program, university, score, reasons, warnings }) => ({
    program,
    university,
    score,
    reasons: reasons.slice(0, 4),
    warnings,
  }));
}
