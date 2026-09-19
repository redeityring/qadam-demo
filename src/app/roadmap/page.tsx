"use client";

/**
 * Этапы 6–7 кейса: Roadmap и «Следующее действие».
 * Персональный план из 4 разделов с чекбоксами, прогрессом и XP.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { JourneyLayout } from "@/components/JourneyLayout";
import { AskAiPanel } from "@/components/AskAiPanel";
import { useProfile } from "@/context/ProfileContext";
import { useLang } from "@/i18n/LanguageContext";
import { XP_PER_ROADMAP_STEP, useGamification } from "@/i18n/GamificationContext";
import { firstOpenStep, getRoadmap, roadmapSectionLabel, ROADMAP_SECTIONS } from "@/lib/engine/roadmap";
import { NextActionCard } from "@/components/NextActionCard";
import { sourceLabel } from "@/i18n/engine";

export default function RoadmapPage() {
  const { profile, complete, update } = useProfile();
  const { lang, t } = useLang();
  const { addXp, hydrated: gamHydrated } = useGamification();
  const [celebrate, setCelebrate] = useState(false);

  const steps = useMemo(() => getRoadmap(profile, lang), [profile, lang]);
  const done = useMemo(() => profile.doneSteps ?? [], [profile.doneSteps]);
  const doneCount = steps.filter((s) => done.includes(s.id)).length;
  const open = useMemo(() => firstOpenStep(steps, done), [steps, done]);
  const progress = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;

  function toggleDone(id: string, title: string) {
    const nextDone = done.includes(id) ? done.filter((d) => d !== id) : [...done, id];
    update({ doneSteps: nextDone });
    // Синхронизация «следующего шага» с отметкой пунктов плана
    if (!done.includes(id)) {
      // начисление XP за шаг
      if (gamHydrated) addXp(XP_PER_ROADMAP_STEP);
      // все шаги выполнены?
      const remaining = steps.filter((s) => !nextDone.includes(s.id)).length;
      if (remaining === 0) {
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 4000);
      }
    }
    update({ nextActionDoneAt: done.includes(id) ? null : title });
  }

  if (!complete) {
    return (
      <JourneyLayout>
        <div className="card p-6 text-center">
          <h1 className="section-title">{t.roadmapTitle}</h1>
          <p className="muted mt-2">{t.calEmpty}</p>
          <Link href="/profile" className="btn btn-primary mt-4">
            {t.fillProfile} →
          </Link>
        </div>
      </JourneyLayout>
    );
  }

  return (
    <JourneyLayout wide>
      <div className="anim-rise mb-4">
        <h1 className="section-title">{t.roadmapTitle}</h1>
        <p className="muted mt-1">{t.roadmapSub}</p>
      </div>

      {/* Прогресс */}
      <div className="card anim-rise anim-rise-1 mb-4 p-5">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span className="text-ink/80">{t.roadmapProgress}</span>
          <span className={doneCount === steps.length && steps.length > 0 ? "text-success" : "text-pine"}>
            {doneCount === steps.length && steps.length > 0
              ? `🎉 ${t.roadmapDone}`
              : `${doneCount} ${t.roadmapOf} ${steps.length} · ${progress}%`}
          </span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-ink/10">
          <div
            className="anim-progress h-full rounded-full bg-pine"
            style={{ width: `${progress}%` }}
          />
        </div>
        {celebrate && (
          <p className="anim-pop mt-3 text-center text-sm font-bold text-clay">
            🎉 {t.keepGoing} {t.roadmapDone}
          </p>
        )}
      </div>

      <NextActionCard
        action={
          open
            ? {
                title: open.title,
                description: `${open.why} ${lang === "en" ? "Period:" : lang === "kk" ? "Мерзімі:" : "Период:"} ${open.period[lang]}.`,
                href: "/roadmap",
                cta: t.openPlan,
              }
            : {
                title: t.journeyDoneT,
                description: t.journeyDoneD,
                href: "/profile",
                cta: t.journeyDoneCta,
              }
        }
      />

      {/* Разделы плана */}
      <div className="mt-4 space-y-6">
        {ROADMAP_SECTIONS.map((section) => {
          const sectionSteps = steps.filter((s) => s.section === section.id);
          if (sectionSteps.length === 0) return null;
          const sectionDone = sectionSteps.filter((s) => done.includes(s.id)).length;
          const label = roadmapSectionLabel(section.id, lang);
          return (
            <section key={section.id} aria-label={label.title}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl">{section.emoji}</span>
                <h2 className="font-bold text-ink">{label.title}</h2>
                <span className="badge bg-ink/5 text-ink/50">
                  {sectionDone}/{sectionSteps.length}
                </span>
              </div>
              <p className="muted anim-rise-2 mb-3 -mt-1 text-xs">{label.description}</p>
              <ol className="space-y-2">
                {sectionSteps.map((s) => {
                  const isDone = done.includes(s.id);
                  return (
                    <li
                      key={s.id}
                      className={`card p-4 transition ${isDone ? "opacity-60" : "card-hover"}`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={isDone}
                          aria-label={s.title}
                          onClick={() => toggleDone(s.id, s.title)}
                          className={`mt-0.5 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 transition ${
                            isDone
                              ? "border-success bg-success text-paper"
                              : "border-ink/20 bg-white hover:border-pine"
                          }`}
                        >
                          {isDone && "✓"}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-semibold ${
                              isDone ? "text-ink/40 line-through" : "text-ink"
                            }`}
                          >
                            {s.title}
                          </p>
                          <p className="muted mt-0.5 text-xs">{s.why}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="badge bg-ink/5 text-ink/60">🕒 {s.period[lang]}</span>
                            {s.source.url ? (
                              <a
                                href={s.source.url}
                                target="_blank"
                                rel="noreferrer"
                                className="badge badge-source hover:underline"
                              >
                                ↗ {sourceLabel(s.source.label, lang)}
                              </a>
                            ) : (
                              <span className="badge badge-demo">
                                {sourceLabel(s.source.label, lang)}
                              </span>
                            )}
                          </div>
                        </div>
                        {!isDone && (
                          <span className="badge badge-demo shrink-0">+{XP_PER_ROADMAP_STEP} XP</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>

      {/* Спроси ИИ о плане */}
      <AskAiPanel />

      {/* Экспорт плана в PDF */}
      <div className="anim-rise anim-rise-5 mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/compare" className="btn btn-secondary">
            ← {t.toCompareBack}
          </Link>
          <Link href="/profile" className="btn btn-secondary">
            {t.recalcHint}
          </Link>
        </div>
        <Link href="/roadmap/print" className="btn btn-primary" target="_blank">
          🖨 {t.exportPlan}
        </Link>
      </div>
    </JourneyLayout>
  );
}
