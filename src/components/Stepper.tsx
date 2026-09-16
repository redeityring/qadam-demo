"use client";

/**
 * Stepper — постоянная навигация по 7 обязательным этапам кейса.
 * Пользователь всегда видит: где находится, что уже сделал, что будет дальше.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STEP_INDEX, STEPS } from "@/lib/constants";
import { useProfile } from "@/context/ProfileContext";

/** Путь → id этапа (для подсветки текущего шага) */
function stepIdForPathname(pathname: string) {
  const clean = pathname.split("?")[0];
  const found = STEPS.find((s) => s.path === clean);
  if (found) return found.id;
  if (clean.startsWith("/profile")) return "profile" as const;
  if (clean.startsWith("/diagnostics")) return "diagnostics" as const;
  if (clean.startsWith("/results")) return "results" as const;
  if (clean.startsWith("/compare")) return "compare" as const;
  if (clean.startsWith("/roadmap")) return "roadmap" as const;
  return "entry" as const;
}

export function Stepper() {
  const pathname = usePathname();
  const { complete } = useProfile();
  const current = stepIdForPathname(pathname);
  const currentIdx = STEP_INDEX[current];

  // Этапы до текущего считаем пройденными; результаты/план требуют заполненного профиля
  const isDone = (idx: number, id: string) =>
    idx < currentIdx || (complete && (id === "diagnostics" || id === "results"));

  return (
    <nav aria-label="Этапы пути" className="w-full">
      {/* Десктоп: полный степпер */}
      <ol className="hidden items-center gap-1 md:flex">
        {STEPS.map((step, idx) => {
          const state = idx === currentIdx ? "current" : isDone(idx, step.id) ? "done" : "todo";
          const clickable = idx <= currentIdx || complete;
          return (
            <li key={step.id} className="flex flex-1 items-center gap-1 last:flex-none">
              {clickable ? (
                <Link
                  href={step.path}
                  aria-current={state === "current" ? "step" : undefined}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    state === "current"
                      ? "bg-indigo-600 text-white"
                      : state === "done"
                        ? "text-indigo-700 hover:bg-indigo-50"
                        : "text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      state === "current"
                        ? "bg-white text-indigo-700"
                        : state === "done"
                          ? "bg-indigo-100"
                          : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {state === "done" ? "✓" : idx + 1}
                  </span>
                  {step.label}
                </Link>
              ) : (
                <span className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-400">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-400">
                    {idx + 1}
                  </span>
                  {step.label}
                </span>
              )}
              {idx < STEPS.length - 1 && <span className="h-px flex-1 bg-slate-200" />}
            </li>
          );
        })}
      </ol>

      {/* Мобильный: компактная полоса прогресса */}
      <div className="md:hidden">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
          <span className="text-indigo-700">
            Шаг {currentIdx + 1} из {STEPS.length}: {STEPS[currentIdx].label}
          </span>
          <span className="text-slate-400">
            {Math.round(((currentIdx + 1) / STEPS.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{ width: `${((currentIdx + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </nav>
  );
}
