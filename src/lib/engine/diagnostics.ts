/**
 * Диагностика профиля (этап 3 кейса): краткое резюме — сильные стороны,
 * ограничения и образовательная цель. Чистая функция от профиля.
 */

import type { Profile } from "@/types";
import { CITIES, formatTenge, SUBJECT_LABEL } from "@/lib/constants";

export interface Diagnostics {
  goal: string;
  strengths: string[];
  constraints: string[];
  summary: string;
}

const FIELD_HINTS: Record<string, string> = {
  math: "технических и экономических",
  physics: "инженерных",
  cs: "IT-направлений",
  chemistry: "химических и медицинских",
  biology: "медицинских и биологических",
  history: "гуманитарных и юридических",
  geography: "экономических и экологических",
  kazakh: "филологических и педагогических",
  russian: "филологических и коммуникативных",
  english: "международных и языковых",
  economics: "экономических и бизнес-",
};

export function getDiagnostics(profile: Profile): Diagnostics {
  const cityLabel = CITIES.find((c) => c.id === profile.city)?.label ?? "—";
  const strongSubjects = Object.entries(profile.strengths)
    .filter(([, v]) => (v ?? 0) >= 4)
    .map(([k]) => SUBJECT_LABEL[k as keyof typeof SUBJECT_LABEL]);

  const interestsLabel = profile.interests.map((s) => SUBJECT_LABEL[s]).join(", ");

  const fields = Array.from(
    new Set(profile.interests.map((s) => FIELD_HINTS[s]).filter(Boolean)),
  ).slice(0, 2);

  // --- Цель ---
  const goal = `Поступление в ${profile.targetYear} году на программу в области ${
    fields.length ? fields.join(" / ") : "выбранных направлений"
  }${profile.city !== "any" ? `, город: ${cityLabel}` : " (город не важен)"}.`;

  // --- Сильные стороны ---
  const strengths: string[] = [];
  if (strongSubjects.length) {
    strengths.push(`Сильные предметы: ${strongSubjects.join(", ")}.`);
  }
  if (profile.interests.length) {
    strengths.push(`Интересы: ${interestsLabel}.`);
  }
  if (profile.entEstimate != null) {
    strengths.push(
      profile.entEstimate >= 100
        ? `Прогноз ЕНТ ${profile.entEstimate} — конкурентный балл для грантов и топовых программ.`
        : `Прогноз ЕНТ ${profile.entEstimate} — есть программы, куда вы проходите, и запас времени для роста.`,
    );
  }

  // --- Ограничения ---
  const constraints: string[] = [];
  constraints.push(
    `Бюджет: до ${formatTenge(profile.budgetPerYearTenge)} в год${
      profile.needsDorm ? " + общежитие" : ""
    }.`,
  );
  if (profile.city === "other" || profile.city === "any") {
    constraints.push("Готовность к переезду — расширяет выбор.");
  } else {
    constraints.push(`Предпочтение вузам в городе «${cityLabel}» — сужает выбор, но снижает расходы.`);
  }
  constraints.push(`Язык обучения: ${profile.studyLanguage.toUpperCase()}.`);
  if (profile.countries === "kz+abroad") {
    constraints.push("Рассматриваете программы за рубежом — потребуется IELTS/SAT.");
  }

  const summary = `Выпуск ${profile.targetYear} года, ${
    profile.grade
  } класс. Цель — ${fields.length ? fields.join(" / ") : "подходящие"} программы${
    profile.city !== "any" ? ` в ${cityLabel}` : ""
  }. Сильные стороны: ${strongSubjects.length ? strongSubjects.join(", ").toLowerCase() : "определяются"}. Основное ограничение — бюджет ${formatTenge(
    profile.budgetPerYearTenge,
  )} в год.`;

  return { goal, strengths, constraints, summary };
}
