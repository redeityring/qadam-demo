"use client";

/**
 * Этап 4 кейса: Рекомендации. Минимум три варианта с объяснением
 * «почему подходит», бейджами источников, избранным и Ask AI.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { JourneyLayout } from "@/components/JourneyLayout";
import { AnalysisOverlay } from "@/components/AnalysisOverlay";
import { AskAiPanel } from "@/components/AskAiPanel";
import { NextActionCard } from "@/components/NextActionCard";
import { useProfile } from "@/context/ProfileContext";
import { useLang } from "@/i18n/LanguageContext";
import { MAJOR_L, SUBJECT_L } from "@/i18n/engine";
import { getRecommendations } from "@/lib/engine/recommend";
import { formatTenge } from "@/lib/constants";
import { firstOpenStep, getRoadmap } from "@/lib/engine/roadmap";

export default function ResultsPage() {
  const { profile, complete, update, hydrated } = useProfile();
  const { lang, t } = useLang();
  const [showAnalysis, setShowAnalysis] = useState(true);

  // Чистая проекция профиля: любые изменения анкеты мгновенно меняют выдачу
  const recommendations = useMemo(
    () => getRecommendations(profile, lang),
    [profile, lang],
  );
  const roadmap = useMemo(() => getRoadmap(profile, lang), [profile, lang]);
  const openStep = useMemo(
    () => firstOpenStep(roadmap, profile.doneSteps ?? []),
    [roadmap, profile.doneSteps],
  );

  if (!hydrated) {
    return (
      <JourneyLayout>
        <div className="space-y-4" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card h-40 animate-pulse bg-ink/5" />
          ))}
        </div>
      </JourneyLayout>
    );
  }

  // «Думающий» анализ: показывается при каждом заходе на результаты (SSR-безопасно,
  // т.к. состояние начинается с true только после гидрации)
  if (hydrated && complete && showAnalysis) {
    return (
      <AnalysisOverlay
        onDone={() => {
          setShowAnalysis(false);
        }}
      />
    );
  }

  if (!complete) {
    return (
      <JourneyLayout>
        <div className="card p-6 text-center">
          <h1 className="section-title">{t.resultsTitle}</h1>
          <p className="muted mt-2">{t.diagEmptyD}</p>
          <Link href="/profile" className="btn btn-primary mt-4">
            {t.fillProfile} →
          </Link>
        </div>
      </JourneyLayout>
    );
  }

  function toggleCompare(id: string) {
    const current = profile.compareIds ?? [];
    const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id].slice(-3);
    update({ compareIds: next });
  }

  function toggleFavorite(id: string) {
    const current = profile.favoriteIds ?? [];
    const next = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id].slice(-12);
    update({ favoriteIds: next });
  }

  const favCount = profile.favoriteIds?.length ?? 0;

  return (
    <JourneyLayout wide>
      <div className="anim-rise mb-4">
        <h1 className="section-title">{t.resultsTitle}</h1>
        <p className="muted mt-1">
          {t.resultsSubA} {recommendations.length} {t.resultsSubB}
        </p>
      </div>

      <NextActionCard
        action={
          openStep
            ? {
                title: openStep.title,
                description: openStep.why,
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

      <AskAiPanel />

      {/* Изменить вводные — проверка жюри «изменил → изменилось» */}
      <div className="card anim-rise anim-rise-2 mt-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-ink/80">{t.recalcsHint}</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/profile" className="btn btn-secondary !px-3 !py-2 text-xs">
            {t.changeInputs}
          </Link>
          <Link href="/diagnostics" className="btn btn-ghost !px-3 !py-2 text-xs">
            {t.toDiagnostics}
          </Link>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink/40">
          <span>
            {t.inCompare} {profile.compareIds?.length ?? 0} / 3
          </span>
          <span>·</span>
          <Link href="/favorites" className="text-pine underline-offset-2 hover:underline">
            ★ {favCount}
          </Link>
        </div>
      </div>

      {/* Карточки рекомендаций */}
      {recommendations.length === 0 ? (
        <div className="card anim-rise mt-4 p-6 text-center">
          <p className="text-3xl">🔍</p>
          <h2 className="mt-2 font-bold">{t.noResultsT}</h2>
          <p className="muted mt-1">{t.noResultsD}</p>
          <Link href="/profile" className="btn btn-primary mt-4">
            {t.changeInputs2}
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {recommendations.map((r, i) => {
            const inCompare = (profile.compareIds ?? []).includes(r.program.id);
            const inFav = (profile.favoriteIds ?? []).includes(r.program.id);
            return (
              <article
                key={r.program.id}
                className={`card card-hover anim-rise p-5 ${i < 5 ? `anim-rise-${i + 1}` : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-pine">
                      {i === 0 ? t.topPick : `${t.optionN}${i + 1}`} ·{" "}
                      {r.university.shortName ?? r.university.name}
                    </p>
                    <h2 className="mt-0.5 font-bold text-ink">{MAJOR_L[r.program.majorId][lang]}</h2>
                    <p className="muted mt-0.5 text-xs">{r.university.name}</p>
                  </div>
                  {/* Кольцо совместимости */}
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                    <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e7e0d2" strokeWidth="4" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        stroke={r.score >= 70 ? "var(--color-success)" : r.score >= 45 ? "var(--color-warn)" : "var(--color-danger)"}
                        strokeWidth="4"
                        strokeDasharray={`${(r.score / 100) * 97.4} 97.4`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-sm font-extrabold text-ink">{r.score}</span>
                  </div>
                </div>

                {/* Ключевые параметры */}
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="badge bg-ink/5 text-ink/70">
                    {formatTenge(r.program.tuitionPerYearTenge, lang)}/{lang === "en" ? "yr" : lang === "kk" ? "жыл" : "год"}
                  </span>
                  {r.program.historicalPassingENT != null && (
                    <span className="badge bg-ink/5 text-ink/70">
                      {lang === "en" ? "Passing" : lang === "kk" ? "Өту" : "Проходной"} {r.program.historicalPassingENT}*
                    </span>
                  )}
                  {r.program.grantsCount != null && (
                    <span className="badge bg-ink/5 text-ink/70">
                      {lang === "en" ? "Grants" : lang === "kk" ? "Грант" : "Грантов"}: {r.program.grantsCount}
                    </span>
                  )}
                  <span className="badge bg-ink/5 text-ink/70">
                    {r.program.entrySubjects.map((s) => SUBJECT_L[s][lang]).join(" + ")}
                  </span>
                </div>

                {/* Почему подходит */}
                <div className="mt-3 rounded-xl bg-pine/5 p-3">
                  <p className="text-xs font-bold text-pine">{t.whyFits}</p>
                  <ul className="mt-1 space-y-1">
                    {r.reasons.map((reason) => (
                      <li key={reason} className="flex gap-1.5 text-xs text-ink/80">
                        <span className="text-moss">•</span> {reason}
                      </li>
                    ))}
                  </ul>
                  {r.warnings.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {r.warnings.map((w) => (
                        <li key={w} className="flex gap-1.5 text-xs text-clay-deep">
                          <span>⚠</span> {w}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Источники */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  {r.program.sources.map((s) =>
                    s.url ? (
                      <a
                        key={s.label}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="badge badge-source hover:underline"
                      >
                        ↗ {s.label}
                      </a>
                    ) : (
                      <span key={s.label} className="badge badge-demo">
                        {s.label}
                      </span>
                    ),
                  )}
                </div>

                {/* Действия */}
                <div className="mt-4 flex items-center gap-2 border-t border-ink/8 pt-3">
                  <button
                    type="button"
                    onClick={() => toggleCompare(r.program.id)}
                    aria-pressed={inCompare}
                    className={`btn ${inCompare ? "btn-primary" : "btn-secondary"} !px-3 !py-2 text-xs`}
                  >
                    {inCompare ? `✓ ${t.inCompareBtn}` : `⚖ ${t.compareBtn}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(r.program.id)}
                    aria-pressed={inFav}
                    className={`btn ${inFav ? "btn-secondary text-clay" : "btn-ghost"} !px-3 !py-2 text-xs`}
                  >
                    {inFav ? `★ ${t.favBtnOn}` : `☆ ${t.favBtn}`}
                  </button>
                  <a
                    href={r.university.website}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost !px-3 !py-2 text-xs"
                  >
                    {t.uniSite} ↗
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="anim-rise anim-rise-5 mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Link href="/diagnostics" className="btn btn-secondary">
          ← {t.backToDiag}
        </Link>
        <Link
          href="/compare"
          className={`btn ${(profile.compareIds?.length ?? 0) >= 2 ? "btn-primary" : "btn-secondary"}`}
        >
          {t.toCompare} ({profile.compareIds?.length ?? 0}) →
        </Link>
      </div>
    </JourneyLayout>
  );
}
