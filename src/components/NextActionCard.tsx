"use client";

/**
 * NextActionCard — этап 7 кейса: один четко выделенный ближайший шаг
 * и возможность отметить прогресс. Показывается на всех экранах после профиля.
 */

import Link from "next/link";
import { useProfile } from "@/context/ProfileContext";
import { useLang } from "@/i18n/LanguageContext";

export interface NextAction {
  title: string;
  description: string;
  href: string;
  cta: string;
}

export function NextActionCard({ action }: { action: NextAction }) {
  const { profile, update } = useProfile();
  const { t } = useLang();
  const lastSeen = profile.nextActionDoneAt;
  const isDone = action.title === lastSeen;

  function markDone() {
    update({ nextActionDoneAt: isDone ? null : action.title });
  }

  return (
    <aside
      id="next-action"
      className={`card anim-glow scroll-mt-40 border-l-4 p-4 sm:p-5 ${
        isDone ? "border-l-success" : "border-l-clay"
      }`}
      aria-label={t.nextStep}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-wide text-clay uppercase">{t.nextStep}</p>
          <p className="mt-0.5 font-bold text-ink">{action.title}</p>
          <p className="muted mt-0.5">{action.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={markDone}
            className={`btn ${isDone ? "btn-secondary" : "btn-ghost"} !px-3 !py-2 text-xs`}
            aria-pressed={isDone}
          >
            {isDone ? `✓ ${t.marked}` : t.markDone}
          </button>
          <Link href={action.href} className="btn btn-primary !px-4 !py-2 text-xs">
            {action.cta}
          </Link>
        </div>
      </div>
    </aside>
  );
}
