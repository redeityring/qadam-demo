"use client";

/**
 * Этапы 6–7 кейса: Roadmap и «Следующее действие».
 * Персональный план из 4 разделов с чекбоксами и общим прогрессом.
 */

import Link from "next/link";
import { useMemo } from "react";
import { JourneyLayout } from "@/components/JourneyLayout";
import { useProfile } from "@/context/ProfileContext";
import { firstOpenStep, getRoadmap, ROADMAP_SECTIONS } from "@/lib/engine/roadmap";
import { NextActionCard } from "@/components/NextActionCard";

export default function RoadmapPage() {
  const { profile, complete, update } = useProfile();

  const steps = useMemo(() => getRoadmap(profile), [profile]);
  const done = useMemo(() => profile.doneSteps ?? [], [profile.doneSteps]);
  const doneCount = steps.filter((s) => done.includes(s.id)).length;
  const open = useMemo(() => firstOpenStep(steps, done), [steps, done]);
  const progress = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;

  function toggleDone(id: string) {
    const nextDone = done.includes(id) ? done.filter((d) => d !== id) : [...done, id];
    update({ doneSteps: nextDone });
    // Синхронизация «следующего шага» с отметкой пунктов плана
    const step = steps.find((s) => s.id === id);
    if (step) update({ nextActionDoneAt: nextDone.includes(id) ? step.title : null });
  }

  if (!complete) {
    return (
      <JourneyLayout>
        <div className="card p-6 text-center">
          <h1 className="section-title">Сначала заполните профиль</h1>
          <Link href="/profile" className="btn btn-primary mt-4">
            Заполнить анкету →
          </Link>
        </div>
      </JourneyLayout>
    );
  }

  return (
    <JourneyLayout wide>
      <div className="mb-4">
        <h1 className="section-title">Мой план поступления</h1>
        <p className="muted mt-1">
          Персональный маршрут: экзамены, документы, академические шаги и активности. Отмечайте
          выполненное — прогресс сохраняется.
        </p>
      </div>

      {/* Прогресс */}
      <div className="card mb-4 p-5">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span className="text-slate-700">Прогресс маршрута</span>
          <span className={doneCount === steps.length && steps.length > 0 ? "text-emerald-600" : "text-indigo-600"}>
            {doneCount === steps.length && steps.length > 0
              ? "🎉 Маршрут пройден!"
              : `${doneCount} из ${steps.length} · ${progress}%`}
          </span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <NextActionCard
        action={
          open
            ? {
                title: open.title,
                description: `${open.why} Период: ${open.period}.`,
                href: "/roadmap",
                cta: "Открыть план",
              }
            : {
                title: "Маршрут пройден — поддерживайте план",
                description:
                  "Все шаги отмечены выполненными. Измените профиль, если цели или бюджет изменились.",
                href: "/profile",
                cta: "Обновить профиль",
              }
        }
      />

      {/* Разделы плана */}
      <div className="mt-4 space-y-6">
        {ROADMAP_SECTIONS.map((section) => {
          const sectionSteps = steps.filter((s) => s.section === section.id);
          if (sectionSteps.length === 0) return null;
          const sectionDone = sectionSteps.filter((s) => done.includes(s.id)).length;
          return (
            <section key={section.id} aria-label={section.title}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl">{section.emoji}</span>
                <h2 className="font-bold text-slate-900">{section.title}</h2>
                <span className="badge bg-slate-100 text-slate-500">
                  {sectionDone}/{sectionSteps.length}
                </span>
              </div>
              <p className="muted mb-3 -mt-1 text-xs">{section.description}</p>
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
                          aria-label={`Отметить: ${s.title}`}
                          onClick={() => toggleDone(s.id)}
                          className={`mt-0.5 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 transition ${
                            isDone
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-slate-300 bg-white hover:border-indigo-500"
                          }`}
                        >
                          {isDone && "✓"}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-semibold ${
                              isDone ? "text-slate-400 line-through" : "text-slate-900"
                            }`}
                          >
                            {s.title}
                          </p>
                          <p className="muted mt-0.5 text-xs">{s.why}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="badge bg-slate-100 text-slate-600">🕒 {s.period}</span>
                            {s.source.url ? (
                              <a
                                href={s.source.url}
                                target="_blank"
                                rel="noreferrer"
                                className="badge badge-source hover:underline"
                              >
                                ↗ {s.source.label}
                              </a>
                            ) : (
                              <span className="badge badge-demo">{s.source.label}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Link href="/compare" className="btn btn-secondary">
          ← Сравнение
        </Link>
        <Link href="/profile" className="btn btn-secondary">
          Изменить профиль (план пересчитается)
        </Link>
      </div>
    </JourneyLayout>
  );
}
