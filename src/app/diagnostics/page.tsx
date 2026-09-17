"use client";

/**
 * Этап 3 кейса: Диагностика. Краткое резюме профиля: сильные стороны,
 * ограничения и образовательная цель + быстрый переход к правкам.
 */

import Link from "next/link";
import { JourneyLayout } from "@/components/JourneyLayout";
import { useProfile } from "@/context/ProfileContext";
import { useLang } from "@/i18n/LanguageContext";
import { getDiagnostics } from "@/lib/engine/diagnostics";
import { formatTenge } from "@/lib/constants";

export default function DiagnosticsPage() {
  const { profile, complete } = useProfile();
  const { lang, t } = useLang();
  const d = getDiagnostics(profile, lang);

  if (!complete) {
    return (
      <JourneyLayout>
        <div className="card p-6 text-center">
          <h1 className="section-title">{t.diagEmptyT}</h1>
          <p className="muted mt-2">{t.diagEmptyD}</p>
          <Link href="/profile" className="btn btn-primary mt-4">
            {t.fillProfile} →
          </Link>
        </div>
      </JourneyLayout>
    );
  }

  return (
    <JourneyLayout>
      <div className="anim-rise mb-6">
        <h1 className="section-title">{t.diagTitle}</h1>
        <p className="muted mt-1">{t.diagSub}</p>
      </div>

      {/* Цель */}
      <section className="card anim-rise anim-rise-1 border-l-4 border-l-pine p-5">
        <h2 className="text-xs font-bold tracking-wide text-pine uppercase">{t.diagGoal}</h2>
        <p className="mt-2 font-semibold text-ink">{d.goal}</p>
      </section>

      {/* Сильные стороны и ограничения */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <section className="card anim-rise anim-rise-2 p-5">
          <h2 className="text-xs font-bold tracking-wide text-success uppercase">
            {t.diagStrengths}
          </h2>
          <ul className="mt-2 space-y-1.5">
            {d.strengths.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-ink/80">
                <span className="text-success">✓</span> {s}
              </li>
            ))}
          </ul>
        </section>
        <section className="card anim-rise anim-rise-3 p-5">
          <h2 className="text-xs font-bold tracking-wide text-warn uppercase">
            {t.diagConstraints}
          </h2>
          <ul className="mt-2 space-y-1.5">
            {d.constraints.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-ink/80">
                <span className="text-warn">•</span> {s}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Резюме */}
      <section className="card anim-rise anim-rise-4 mt-4 p-5">
        <h2 className="text-xs font-bold tracking-wide text-ink/50 uppercase">{t.diagSummary}</h2>
        <p className="mt-2 text-sm text-ink/80">{d.summary}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[
            [t.diagGrade, `${profile.grade}`],
            [t.diagCity, profile.city === "any" ? "—" : profile.city === "almaty" ? (lang === "en" ? "Almaty" : "Алматы") : profile.city === "astana" ? (lang === "en" ? "Astana" : "Астана") : profile.city === "shymkent" ? (lang === "en" ? "Shymkent" : "Шымкент") : (lang === "en" ? "Other" : lang === "kk" ? "Басқа" : "Другой")],
            [t.diagBudget, formatTenge(profile.budgetPerYearTenge, lang)],
            [t.diagENT, profile.entEstimate ?? "—"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-paper-dark/60 p-3">
              <dt className="text-xs text-ink/45">{k}</dt>
              <dd className="font-bold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Навигация */}
      <div className="anim-rise anim-rise-5 mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Link href="/profile" className="btn btn-secondary">
          ← {t.changeAnswers}
        </Link>
        <Link href="/results" className="btn btn-primary">
          {t.showRecs} →
        </Link>
      </div>
    </JourneyLayout>
  );
}
