"use client";

/**
 * Календарь дедлайнов: ключевые даты маршрута на одной шкале.
 * Строится из roadmap-движка; демо-периоды помечены честно.
 */

import Link from "next/link";
import { useMemo } from "react";
import { JourneyLayout } from "@/components/JourneyLayout";
import { useProfile } from "@/context/ProfileContext";
import { useLang } from "@/i18n/LanguageContext";
import { firstOpenStep, getRoadmap } from "@/lib/engine/roadmap";

export default function CalendarPage() {
  const { profile, complete } = useProfile();
  const { lang, t } = useLang();

  const steps = useMemo(() => getRoadmap(profile, lang), [profile, lang]);
  const done = useMemo(() => profile.doneSteps ?? [], [profile.doneSteps]);
  const open = useMemo(() => firstOpenStep(steps, done), [steps, done]);

  if (!complete) {
    return (
      <JourneyLayout>
        <div className="card p-6 text-center">
          <h1 className="section-title">{t.calTitle}</h1>
          <p className="muted mt-2">{t.calEmpty}</p>
          <Link href="/profile" className="btn btn-primary mt-4">
            {t.fillProfile} →
          </Link>
        </div>
      </JourneyLayout>
    );
  }

  return (
    <JourneyLayout>
      <div className="anim-rise mb-4">
        <h1 className="section-title">📅 {t.calTitle}</h1>
        <p className="muted mt-1">{t.calSub}</p>
      </div>

      <ol className="relative space-y-3 border-l-2 border-pine/25 pl-5">
        {steps.map((s, i) => {
          const isDone = done.includes(s.id);
          const isNext = open?.id === s.id;
          return (
            <li
              key={s.id}
              className={`anim-rise anim-rise-${Math.min(i + 1, 5)} relative ${isDone ? "opacity-60" : ""}`}
            >
              <span
                className={`absolute -left-[27px] flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                  isDone
                    ? "border-success bg-success"
                    : isNext
                      ? "anim-glow border-clay bg-clay"
                      : "border-ink/20 bg-white"
                }`}
              />
              <div className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{s.title}</p>
                  <span className={`badge ${isNext ? "badge-demo" : "bg-ink/5 text-ink/60"}`}>
                    🕒 {s.period[lang]}
                  </span>
                </div>
                <p className="muted mt-1 text-xs">{s.why}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="muted mt-4 text-xs">{t.compareDemoNote}</p>

      <div className="mt-6 flex justify-between">
        <Link href="/roadmap" className="btn btn-secondary">
          ← {t.myPlan}
        </Link>
      </div>
    </JourneyLayout>
  );
}
