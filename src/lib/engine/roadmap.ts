/**
 * Roadmap-генератор (этап 6 кейса): персональный план из профиля.
 * Правила по классу, экзаменам, языку, странам и интересам.
 * Каждый пункт — действие с объяснением «зачем», периодом и источником.
 */

import type { Profile } from "@/types";
import { SUBJECT_LABEL } from "@/lib/constants";

export type RoadmapSectionId = "exams" | "documents" | "academic" | "activities";

export const ROADMAP_SECTIONS: Array<{
  id: RoadmapSectionId;
  title: string;
  emoji: string;
  description: string;
}> = [
  { id: "exams", title: "Экзамены", emoji: "📝", description: "ЕНТ, IELTS — что и когда сдавать" },
  { id: "documents", title: "Документы", emoji: "📄", description: "Заявления, аттестат, справки" },
  { id: "academic", title: "Академические шаги", emoji: "🎓", description: "Предметы и оценки до выпуска" },
  { id: "activities", title: "Активности", emoji: "🏅", description: "Олимпиады, проекты, волонтёрство" },
];

export interface RoadmapStep {
  id: string;
  section: RoadmapSectionId;
  title: string;
  why: string;
  period: string;
  source: { label: string; url?: string; kind: "official" | "demo" };
}

const EGOV = { label: "e.gov.kz — госпортал (демо-сроки)", kind: "demo" as const };
const ENTEC = {
  label: "entec.gov.kz — регистрация на ЕНТ",
  url: "https://entec.gov.kz",
  kind: "official" as const,
};

export function getRoadmap(profile: Profile): RoadmapStep[] {
  const steps: RoadmapStep[] = [];
  const releaseYear = profile.targetYear;

  // ---------- ЭКЗАМЕНЫ ----------
  if (profile.plannedExams.includes("ent")) {
    steps.push({
      id: "ent-plan",
      section: "exams",
      title: "Составьте план подготовки к ЕНТ по профильным предметам",
      why: `ЕНТ — главный экзамен для поступления в вузы КЗ. Ваши предметы: ${profile.interests
        .slice(0, 2)
        .map((s) => SUBJECT_LABEL[s])
        .join(", ")}.`,
      period: profile.grade === 11 ? "Сентябрь — март" : "Систематически, 2–3 раза в неделю",
      source: ENTEC,
    });
    steps.push({
      id: "ent-register",
      section: "exams",
      title: `Регистрация на ЕНТ (выпуск ${releaseYear})`,
      why: "Регистрация обычно открывается весной — не пропустите окно.",
      period: "Март — апрель",
      source: ENTEC,
    });
    if (profile.entEstimate != null && profile.entEstimate < 100) {
      steps.push({
        id: "ent-boost",
        section: "exams",
        title: "Цель по баллу: 100+",
        why: `Прогноз ${profile.entEstimate}. Балл 100+ открывает больше программ и грантов.`,
        period: "К выпуску",
        source: EGOV,
      });
    }
  }

  if (profile.countries === "kz+abroad" || profile.plannedExams.includes("ielts")) {
    steps.push({
      id: "ielts",
      section: "exams",
      title: "Подготовка к IELTS (цель 6.5+)",
      why: "Нужен для англоязычных программ и зарубежных вузов.",
      period: "6–12 месяцев подготовки",
      source: { label: "ielts.org", url: "https://ielts.org", kind: "official" },
    });
  }

  // ---------- ДОКУМЕНТЫ ----------
  steps.push({
    id: "docs-id",
    section: "documents",
    title: "Проверьте документы и УИН",
    why: "Для регистрации на ЕНТ и подачи в вузы нужны действующие документы.",
    period: "Сейчас",
    source: EGOV,
  });
  if (profile.grade === 11) {
    steps.push({
      id: "docs-diploma",
      section: "documents",
      title: "Аттестат об окончании школы",
      why: "Понадобится при зачислении; аттестат с отличием даёт надбавку к конкурсу грантов.",
      period: "Июнь",
      source: EGOV,
    });
  }
  steps.push({
    id: "docs-grant",
    section: "documents",
    title: "Заявление на грант",
    why: "Гранты распределяются после ЕНТ — заявление подаётся через вуз или портал.",
    period: "Июль — август",
    source: EGOV,
  });

  // ---------- АКАДЕМИЧЕСКИЕ ШАГИ ----------
  const weak = Object.entries(profile.strengths)
    .filter(([, v]) => (v ?? 0) <= 2)
    .map(([k]) => SUBJECT_LABEL[k as keyof typeof SUBJECT_LABEL]);
  if (weak.length) {
    steps.push({
      id: "acad-weak",
      section: "academic",
      title: `Подтянуть: ${weak.join(", ")}`,
      why: "Слабые предметы снижают балл ЕНТ и шансы на грант.",
      period: "До декабря",
      source: EGOV,
    });
  }
  if (profile.grade !== 11) {
    steps.push({
      id: "acad-profile",
      section: "academic",
      title: "Выбрать профильные предметы на следующий год",
      why: "Профильные предметы должны совпадать с предметами ЕНТ по выбранному направлению.",
      period: "До конца учебного года",
      source: EGOV,
    });
  }
  steps.push({
    id: "acad-gpa",
    section: "academic",
    title: "Держите оценки для аттестата с отличием",
    why: "Аттестат с отличием даёт надбавку к баллу при конкурсе на грант.",
    period: "Весь год",
    source: EGOV,
  });

  // ---------- АКТИВНОСТИ ----------
  if (profile.interests.includes("cs") || profile.interests.includes("math")) {
    steps.push({
      id: "act-olympiad",
      section: "activities",
      title: "Олимпиада по математике/информатике",
      why: "Призёры получают гранты вне квоты или преимущества при зачислении.",
      period: "Октябрь — март",
      source: EGOV,
    });
  }
  if (profile.interests.includes("biology") || profile.interests.includes("chemistry")) {
    steps.push({
      id: "act-science",
      section: "activities",
      title: "Научный проект по биологии/химии",
      why: "Усиливает портфолио для медицинских и научных программ.",
      period: "Декабрь — апрель",
      source: EGOV,
    });
  }
  steps.push({
    id: "act-volunteer",
    section: "activities",
    title: "Волонтёрство или социальный проект",
    why: "Развивает мягкие навыки и укрепляет мотивационное письмо.",
    period: "В течение года",
    source: EGOV,
  });

  return steps;
}

/** Первый незавершённый пункт плана — кандидат в «следующее действие» */
export function firstOpenStep(steps: RoadmapStep[], done: string[]): RoadmapStep | null {
  return steps.find((s) => !done.includes(s.id)) ?? null;
}
