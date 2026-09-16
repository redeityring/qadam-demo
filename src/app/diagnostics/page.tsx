"use client";

/**
 * Этап 3 кейса: Диагностика. Краткое резюме профиля: сильные стороны,
 * ограничения и образовательная цель + быстрый переход к правкам.
 */

import Link from "next/link";
import { JourneyLayout } from "@/components/JourneyLayout";
import { useProfile } from "@/context/ProfileContext";
import { getDiagnostics } from "@/lib/engine/diagnostics";
import { CITIES, formatTenge } from "@/lib/constants";

export default function DiagnosticsPage() {
  const { profile, complete } = useProfile();
  const d = getDiagnostics(profile);

  if (!complete) {
    return (
      <JourneyLayout>
        <div className="card p-6 text-center">
          <h1 className="section-title">Профиль не заполнен</h1>
          <p className="muted mt-2">
            Чтобы увидеть диагностику, укажите интересы и прогноз балла ЕНТ.
          </p>
          <Link href="/profile" className="btn btn-primary mt-4">
            Заполнить анкету →
          </Link>
        </div>
      </JourneyLayout>
    );
  }

  const cityLabel = CITIES.find((c) => c.id === profile.city)?.label ?? "—";

  return (
    <JourneyLayout>
      <div className="mb-6">
        <h1 className="section-title">Диагностика профиля</h1>
        <p className="muted mt-1">
          Краткое резюме: кто вы, что у вас хорошо, что ограничивает выбор.
        </p>
      </div>

      {/* Цель */}
      <section className="card border-l-4 border-l-indigo-600 p-5">
        <h2 className="text-xs font-bold tracking-wide text-indigo-600 uppercase">Ваша цель</h2>
        <p className="mt-2 font-semibold text-slate-900">{d.goal}</p>
      </section>

      {/* Сильные стороны и ограничения */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <section className="card p-5">
          <h2 className="text-xs font-bold tracking-wide text-emerald-600 uppercase">
            Сильные стороны
          </h2>
          <ul className="mt-2 space-y-1.5">
            {d.strengths.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-slate-700">
                <span className="text-emerald-500">✓</span> {s}
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-5">
          <h2 className="text-xs font-bold tracking-wide text-amber-600 uppercase">Ограничения</h2>
          <ul className="mt-2 space-y-1.5">
            {d.constraints.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-slate-700">
                <span className="text-amber-500">•</span> {s}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Резюме */}
      <section className="card mt-4 p-5">
        <h2 className="text-xs font-bold tracking-wide text-slate-500 uppercase">Резюме</h2>
        <p className="mt-2 text-sm text-slate-700">{d.summary}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[
            ["Класс", `${profile.grade}`],
            ["Город", cityLabel],
            ["Бюджет", formatTenge(profile.budgetPerYearTenge)],
            ["Прогноз ЕНТ", profile.entEstimate ?? "—"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs text-slate-400">{k}</dt>
              <dd className="font-bold text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Навигация */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Link href="/profile" className="btn btn-secondary">
          ← Изменить ответы
        </Link>
        <Link href="/results" className="btn btn-primary">
          Показать рекомендации →
        </Link>
      </div>
    </JourneyLayout>
  );
}
