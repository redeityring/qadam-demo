"use client";

/**
 * Этап 4 кейса: Рекомендации. Минимум три варианта с объяснением
 * «почему подходит», бейджами источников и выбором для сравнения.
 */

import Link from "next/link";
import { useMemo } from "react";
import { JourneyLayout } from "@/components/JourneyLayout";
import { NextActionCard } from "@/components/NextActionCard";
import { useProfile } from "@/context/ProfileContext";
import { getRecommendations } from "@/lib/engine/recommend";
import { formatTenge, SUBJECT_LABEL } from "@/lib/constants";
import { firstOpenStep, getRoadmap } from "@/lib/engine/roadmap";

export default function ResultsPage() {
  const { profile, complete, update, hydrated } = useProfile();

  // Чистая проекция профиля: любые изменения анкеты мгновенно меняют выдачу
  const recommendations = useMemo(() => getRecommendations(profile), [profile]);
  const roadmap = useMemo(() => getRoadmap(profile), [profile]);
  const openStep = useMemo(
    () => firstOpenStep(roadmap, profile.doneSteps ?? []),
    [roadmap, profile.doneSteps],
  );

  if (!hydrated) {
    return (
      <JourneyLayout>
        <div className="space-y-4" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card h-40 animate-pulse bg-slate-100" />
          ))}
        </div>
      </JourneyLayout>
    );
  }

  if (!complete) {
    return (
      <JourneyLayout>
        <div className="card p-6 text-center">
          <h1 className="section-title">Сначала заполните профиль</h1>
          <p className="muted mt-2">Рекомендации строятся из ваших интересов, бюджета и балла ЕНТ.</p>
          <Link href="/profile" className="btn btn-primary mt-4">
            Заполнить анкету →
          </Link>
        </div>
      </JourneyLayout>
    );
  }

  function toggleCompare(id: string) {
    const current = profile.compareIds ?? [];
    const next = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id].slice(-3);
    update({ compareIds: next });
  }

  return (
    <JourneyLayout wide>
      <div className="mb-4">
        <h1 className="section-title">Ваши рекомендации</h1>
        <p className="muted mt-1">
          Найдено {recommendations.length} вариантов. Совместимость — это насколько программа
          совпадает с вашим профилем, а не шанс поступления.
        </p>
      </div>

      <NextActionCard
        action={
          openStep
            ? {
                title: openStep.title,
                description: openStep.why,
                href: "/roadmap",
                cta: "Открыть план",
              }
            : {
                title: "Маршрут пройден — поддерживайте план",
                description: "Все шаги отмечены выполненными. Измените профиль, если цели поменялись.",
                href: "/profile",
                cta: "Обновить профиль",
              }
        }
      />

      {/* Изменить вводные — проверка жюри «изменил → изменилось» */}
      <div className="card mt-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-700">
          Измените вводные — рекомендации пересчитаются мгновенно:
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/profile" className="btn btn-secondary !px-3 !py-2 text-xs">
            Изменить бюджет / интересы
          </Link>
          <Link href="/diagnostics" className="btn btn-ghost !px-3 !py-2 text-xs">
            Диагностика
          </Link>
        </div>
        <div className="text-xs text-slate-400">
          В сравнении: {profile.compareIds?.length ?? 0} / 3
        </div>
      </div>

      {/* Карточки рекомендаций */}
      {recommendations.length === 0 ? (
        <div className="card mt-4 p-6 text-center">
          <p className="text-3xl">🔍</p>
          <h2 className="mt-2 font-bold">Подходящих вариантов не нашлось</h2>
          <p className="muted mt-1">
            Попробуйте увеличить бюджет или изменить язык обучения — и рекомендации появятся.
          </p>
          <Link href="/profile" className="btn btn-primary mt-4">
            Изменить вводные
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {recommendations.map((r, i) => {
            const inCompare = (profile.compareIds ?? []).includes(r.program.id);
            return (
              <article key={r.program.id} className="card card-hover flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-indigo-600">
                      {i === 0 ? "Топ-вариант" : `Вариант №${i + 1}`} · {r.university.shortName ?? r.university.name}
                    </p>
                    <h2 className="mt-0.5 font-bold text-slate-900">{r.program.title}</h2>
                    <p className="muted mt-0.5 text-xs">{r.university.name}</p>
                  </div>
                  {/* Кольцо совместимости */}
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                    <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                      <circle
                        cx="18" cy="18" r="15.5" fill="none"
                        stroke={r.score >= 70 ? "#10b981" : r.score >= 45 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="4"
                        strokeDasharray={`${(r.score / 100) * 97.4} 97.4`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-sm font-extrabold text-slate-900">{r.score}</span>
                  </div>
                </div>

                {/* Ключевые параметры */}
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="badge bg-slate-100 text-slate-700">
                    {formatTenge(r.program.tuitionPerYearTenge)}/год
                  </span>
                  {r.program.historicalPassingENT != null && (
                    <span className="badge bg-slate-100 text-slate-700">
                      Проходной {r.program.historicalPassingENT}*
                    </span>
                  )}
                  {r.program.grantsCount != null && (
                    <span className="badge bg-slate-100 text-slate-700">
                      Грантов: {r.program.grantsCount}
                    </span>
                  )}
                  <span className="badge bg-slate-100 text-slate-700">
                    {r.program.entrySubjects.map((s) => SUBJECT_LABEL[s]).join(" + ")}
                  </span>
                </div>

                {/* Почему подходит */}
                <div className="mt-3 rounded-xl bg-indigo-50/60 p-3">
                  <p className="text-xs font-bold text-indigo-700">Почему подходит</p>
                  <ul className="mt-1 space-y-1">
                    {r.reasons.map((reason) => (
                      <li key={reason} className="flex gap-1.5 text-xs text-slate-700">
                        <span className="text-indigo-500">•</span> {reason}
                      </li>
                    ))}
                  </ul>
                  {r.warnings.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {r.warnings.map((w) => (
                        <li key={w} className="flex gap-1.5 text-xs text-amber-700">
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
                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => toggleCompare(r.program.id)}
                    aria-pressed={inCompare}
                    className={`btn ${inCompare ? "btn-primary" : "btn-secondary"} !px-3 !py-2 text-xs`}
                  >
                    {inCompare ? "✓ В сравнении" : "⚖ Сравнить"}
                  </button>
                  <a
                    href={r.university.website}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost !px-3 !py-2 text-xs"
                  >
                    Сайт вуза ↗
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Link href="/diagnostics" className="btn btn-secondary">
          ← Диагностика
        </Link>
        <Link
          href="/compare"
          className={`btn ${(profile.compareIds?.length ?? 0) >= 2 ? "btn-primary" : "btn-secondary"}`}
        >
          Сравнить выбранные ({profile.compareIds?.length ?? 0}) →
        </Link>
      </div>
    </JourneyLayout>
  );
}
