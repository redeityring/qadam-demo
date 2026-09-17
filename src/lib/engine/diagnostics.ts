/**
 * Диагностика профиля (этап 3 кейса): краткое резюме — сильные стороны,
 * ограничения и образовательная цель. Чистая функция от профиля и языка.
 */

import type { Lang } from "@/i18n/dictionaries";
import { diagConstraints, diagGoal, diagStrengths, diagSummary } from "@/i18n/engine";
import type { Profile } from "@/types";

export interface Diagnostics {
  goal: string;
  strengths: string[];
  constraints: string[];
  summary: string;
}

export function getDiagnostics(profile: Profile, lang: Lang = "ru"): Diagnostics {
  return {
    goal: diagGoal(profile, lang),
    strengths: diagStrengths(profile, lang),
    constraints: diagConstraints(profile, lang),
    summary: diagSummary(profile, lang),
  };
}
