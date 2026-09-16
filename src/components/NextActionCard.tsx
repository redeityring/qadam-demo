"use client";

/**
 * NextActionCard — этап 7 кейса: один четко выделенный ближайший шаг
 * и возможность отметить прогресс. Показывается на всех экранах после профиля.
 */

import Link from "next/link";
import { useProfile } from "@/context/ProfileContext";

export interface NextAction {
  title: string;
  description: string;
  href: string;
  cta: string;
}

/** Ближайшее действие по состоянию пути (позже дополняется пунктами roadmap) */
export function computeNextAction(args: {
  complete: boolean;
  doneCount: number;
  totalSteps: number;
  allDone: boolean;
}): NextAction {
  const { complete, doneCount, totalSteps, allDone } = args;
  if (!complete) {
    return {
      title: "Завершите профиль",
      description:
        "Осталось указать интересы и прогноз балла ЕНТ — это откроет рекомендации и план.",
      href: "/profile",
      cta: "Заполнить анкету",
    };
  }
  if (allDone) {
    return {
      title: "Маршрут пройден — поддерживайте план",
      description:
        "Все шаги отмечены выполненными. Вернитесь к анкете, если изменились цели или бюджет.",
      href: "/profile",
      cta: "Обновить профиль",
    };
  }
  return {
    title: `Шаг ${doneCount + 1} из ${totalSteps}`,
    description: "Отметьте выполненные пункты в плане — маршрут пересчитается автоматически.",
    href: "/roadmap",
    cta: "Открыть план",
  };
}

export function NextActionCard({ action }: { action: NextAction }) {
  const { profile, update } = useProfile();
  const lastSeen = profile.nextActionDoneAt;
  const isDone = action.title === lastSeen;

  function markDone() {
    update({ nextActionDoneAt: isDone ? null : action.title });
  }

  return (
    <aside
      className={`card border-l-4 p-4 sm:p-5 ${
        isDone ? "border-l-emerald-500" : "border-l-amber-500"
      }`}
      aria-label="Следующее действие"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-wide text-amber-600 uppercase">
            Следующий шаг
          </p>
          <p className="mt-0.5 font-bold text-slate-900">{action.title}</p>
          <p className="muted mt-0.5">{action.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={markDone}
            className={`btn ${isDone ? "btn-secondary" : "btn-ghost"} !px-3 !py-2 text-xs`}
            aria-pressed={isDone}
          >
            {isDone ? "✓ Отмечено" : "Отметить"}
          </button>
          <Link href={action.href} className="btn btn-primary !px-4 !py-2 text-xs">
            {action.cta}
          </Link>
        </div>
      </div>
    </aside>
  );
}
