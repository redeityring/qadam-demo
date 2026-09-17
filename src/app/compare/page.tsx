"use client";

/**
 * Этап 5 кейса: Сравнение. Минимум два выбранных варианта по параметрам,
 * важным для пользователя: стоимость, проходной, гранты, предметы, город, язык.
 */

import Link from "next/link";
import { useMemo } from "react";
import { JourneyLayout } from "@/components/JourneyLayout";
import { useProfile } from "@/context/ProfileContext";
import { useLang } from "@/i18n/LanguageContext";
import { CITY_L, MAJOR_L, SUBJECT_L } from "@/i18n/engine";
import { getRecommendations, scoreProgram } from "@/lib/engine/recommend";
import { formatTenge } from "@/lib/constants";

export default function ComparePage() {
  const { profile, complete, update } = useProfile();
  const { lang, t } = useLang();

  const recommendations = useMemo(
    () => getRecommendations(profile, lang, 20),
    [profile, lang],
  );

  const selected = useMemo(() => {
    const ids = profile.compareIds ?? [];
    return recommendations.filter((r) => ids.includes(r.program.id));
  }, [recommendations, profile.compareIds]);

  // Если пользователь ничего не выбрал — предлагаем топ-2 рекомендации
  function autoSelect() {
    const top2 = recommendations.slice(0, 2).map((r) => r.program.id);
    update({ compareIds: top2 });
  }

  if (!complete) {
    return (
      <JourneyLayout>
        <div className="card p-6 text-center">
          <h1 className="section-title">{t.resultsTitle}</h1>
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
        <h1 className="section-title">{t.compareTitle}</h1>
        <p className="muted mt-1">{t.compareSub}</p>
      </div>

      {selected.length < 2 ? (
        <div className="card anim-rise p-6 text-center">
          <p className="text-3xl">⚖️</p>
          <h2 className="mt-2 font-bold">{t.compareEmptyT}</h2>
          <p className="muted mt-1">{t.compareEmptyD}</p>
          <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
            <button type="button" onClick={autoSelect} className="btn btn-primary">
              {t.compareAuto}
            </button>
            <Link href="/results" className="btn btn-secondary">
              ← {t.backToRecs}
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Десктоп: таблица */}
          <div className="card anim-rise hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left">
                  <th className="p-4 font-semibold text-ink/40">{t.param}</th>
                  {selected.map((r) => (
                    <th key={r.program.id} className="p-4">
                      <p className="font-bold text-ink">{MAJOR_L[r.program.majorId][lang]}</p>
                      <p className="muted text-xs">{r.university.shortName ?? r.university.name}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                <Row label={t.rowFit}>
                  {selected.map((r) => {
                    const { score } = scoreProgram(profile, r.program, lang);
                    return (
                      <td key={r.program.id} className="p-4">
                        <span
                          className={`badge ${
                            score >= 70
                              ? "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-success"
                              : score >= 45
                                ? "bg-[color-mix(in_srgb,var(--color-warn)_12%,transparent)] text-warn"
                                : "bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] text-danger"
                          }`}
                        >
                          {score}/100
                        </span>
                      </td>
                    );
                  })}
                </Row>
                <Row label={t.rowTuition}>
                  {selected.map((r) => (
                    <td key={r.program.id} className="p-4 font-semibold">
                      {formatTenge(r.program.tuitionPerYearTenge, lang)}
                    </td>
                  ))}
                </Row>
                <Row label={t.rowPassing}>
                  {selected.map((r) => (
                    <td key={r.program.id} className="p-4">
                      {r.program.historicalPassingENT ?? "—"}
                      {r.program.historicalPassingENT != null && profile.entEstimate != null && (
                        <span
                          className={`ml-1 text-xs font-semibold ${
                            profile.entEstimate >= r.program.historicalPassingENT
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          (
                          {profile.entEstimate >= r.program.historicalPassingENT
                            ? t.passAbove
                            : t.passBelow}
                          )
                        </span>
                      )}
                    </td>
                  ))}
                </Row>
                <Row label={t.rowGrants}>
                  {selected.map((r) => (
                    <td key={r.program.id} className="p-4">
                      {r.program.grantsCount ?? "—"}
                    </td>
                  ))}
                </Row>
                <Row label={t.rowSubjects}>
                  {selected.map((r) => (
                    <td key={r.program.id} className="p-4">
                      {r.program.entrySubjects.map((s) => SUBJECT_L[s][lang]).join(" + ")}
                    </td>
                  ))}
                </Row>
                <Row label={t.rowLangs}>
                  {selected.map((r) => (
                    <td key={r.program.id} className="p-4">
                      {r.program.languages.map((l) => l.toUpperCase()).join(", ")}
                    </td>
                  ))}
                </Row>
                <Row label={t.rowCity}>
                  {selected.map((r) => (
                    <td key={r.program.id} className="p-4">
                      {CITY_L[r.program.city]?.[lang] ?? "—"}
                    </td>
                  ))}
                </Row>
                <Row label={t.rowDorm}>
                  {selected.map((r) => (
                    <td key={r.program.id} className="p-4">
                      {r.program.dorm ? `✓ ${t.dormYes}` : `— ${t.dormNo}`}
                    </td>
                  ))}
                </Row>
              </tbody>
            </table>
          </div>

          {/* Мобильный: карточки-столбцы */}
          <div className="grid gap-4 md:hidden">
            {selected.map((r) => {
              const { score } = scoreProgram(profile, r.program, lang);
              return (
                <div key={r.program.id} className="card p-5">
                  <h2 className="font-bold text-ink">{MAJOR_L[r.program.majorId][lang]}</h2>
                  <p className="muted text-xs">{r.university.shortName ?? r.university.name}</p>
                  <dl className="mt-3 space-y-2 text-sm">
                    {[
                      [t.rowFit, `${score}/100`],
                      [t.rowTuition, formatTenge(r.program.tuitionPerYearTenge, lang)],
                      [t.rowPassing, r.program.historicalPassingENT ?? "—"],
                      [t.rowGrants, r.program.grantsCount ?? "—"],
                      [t.rowSubjects, r.program.entrySubjects.map((s) => SUBJECT_L[s][lang]).join(" + ")],
                      [t.rowLangs, r.program.languages.map((l) => l.toUpperCase()).join(", ")],
                      [t.rowDorm, r.program.dorm ? t.dormYes : t.dormNo],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 border-b border-ink/8 pb-2">
                        <dt className="text-ink/45">{k}</dt>
                        <dd className="text-right font-semibold text-ink">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <a
                    href={r.university.website}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary mt-3 w-full !py-2 text-xs"
                  >
                    {t.uniSite} ↗
                  </a>
                </div>
              );
            })}
          </div>

          <p className="muted anim-rise anim-rise-3 mt-4 text-xs">{t.compareDemoNote}</p>

          <div className="anim-rise anim-rise-4 mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Link href="/results" className="btn btn-secondary">
              ← {t.backToRecs}
            </Link>
            <Link href="/roadmap" className="btn btn-primary">
              {t.myPlan} →
            </Link>
          </div>
        </>
      )}
    </JourneyLayout>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td className="p-4 font-semibold text-ink/50">{label}</td>
      {children}
    </tr>
  );
}
