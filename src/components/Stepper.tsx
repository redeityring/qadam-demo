"use client";

/**
 * Stepper — постоянная навигация по 7 обязательным этапам кейса.
 * Пользователь всегда видит: где находится, что уже сделал, что будет дальше.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STEP_INDEX, STEPS } from "@/lib/constants";
import { useProfile } from "@/context/ProfileContext";
import { useLang } from "@/i18n/LanguageContext";

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
  if (clean.startsWith("/favorites") || clean.startsWith("/calendar") || clean.startsWith("/scholarships"))
    return "compare" as const;
  return "entry" as const;
}

export function Stepper() {
  const pathname = usePathname();
  const { complete } = useProfile();
  const { lang, t } = useLang();
  const current = stepIdForPathname(pathname);
  const currentIdx = STEP_INDEX[current];

  // Этапы до текущего считаем пройденными; результаты/план требуют заполненного профиля
  const isDone = (idx: number, id: string) =>
    idx < currentIdx || (complete && (id === "diagnostics" || id === "results"));

  return (
    <nav aria-label="Journey steps" className="w-full">
      {/* Десктоп: полный степпер */}
      <ol className="hidden items-center gap-1 md:flex">
        {STEPS.map((step, idx) => {
          const state = idx === currentIdx ? "current" : isDone(idx, step.id) ? "done" : "todo";
          const clickable = idx <= currentIdx || complete;
          const label = step.label[lang];
          const href = step.id === "next" ? "/roadmap#next-action" : step.path;
          return (
            <li key={step.id} className="flex flex-1 items-center gap-1 last:flex-none">
              {clickable ? (
                <Link
                  href={href}
                  aria-current={state === "current" ? "step" : undefined}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    state === "current"
                      ? "bg-pine text-paper"
                      : state === "done"
                        ? "text-pine hover:bg-pine/10"
                        : "text-ink/40 hover:bg-ink/5"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      state === "current"
                        ? "bg-paper text-pine"
                        : state === "done"
                          ? "bg-moss/30 text-pine"
                          : "bg-ink/8 text-ink/40"
                    }`}
                  >
                    {state === "done" ? "✓" : idx + 1}
                  </span>
                  {label}
                </Link>
              ) : (
                <span className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-ink/40">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink/8 text-[10px] font-bold text-ink/40">
                    {idx + 1}
                  </span>
                  {label}
                </span>
              )}
              {idx < STEPS.length - 1 && <span className="h-px flex-1 bg-ink/10" />}
            </li>
          );
        })}
      </ol>

      {/* Мобильный: компактная полоса прогресса + ссылка на «Следующий шаг» */}
      <div className="md:hidden">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
          <span className="text-pine">
            {t.headerSteps} {currentIdx + 1} {t.headerOf} {STEPS.length}: {STEPS[currentIdx].label[lang]}
          </span>
          <span className="text-ink/40">
            {Math.round(((currentIdx + 1) / STEPS.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
          <div
            className="anim-progress h-full rounded-full bg-pine"
            style={{ width: `${((currentIdx + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <Link
          href="/roadmap#next-action"
          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-clay hover:underline"
        >
          7 → {STEPS[6].label[lang]}
        </Link>
      </div>
    </nav>
  );
}
