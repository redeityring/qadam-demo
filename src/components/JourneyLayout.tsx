"use client";

/**
 * JourneyLayout — общая оболочка экранов пути: шапка с прогрессом, XP-счётчик,
 * переключатель языка и футер. Дочерние маршруты рендерятся между ними.
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Stepper } from "@/components/Stepper";
import { levelFor, levelName, levelProgress, useGamification } from "@/i18n/GamificationContext";
import { useLang } from "@/i18n/LanguageContext";

function XpChip() {
  const { xp, hydrated } = useGamification();
  const { lang, t } = useLang();
  const [pop, setPop] = useState(false);
  const prev = useRef(xp);

  useEffect(() => {
    if (xp > prev.current) {
      setPop(true);
      const id = setTimeout(() => setPop(false), 500);
      prev.current = xp;
      return () => clearTimeout(id);
    }
    prev.current = xp;
  }, [xp]);

  if (!hydrated) return null;
  const lvl = levelFor(xp);
  const prog = levelProgress(xp);

  return (
    <div
      className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 outline outline-1 outline-clay/25"
      title={`${t.level} ${lvl + 1} · ${xp} ${t.xp}`}
    >
      <span className={`text-xs font-extrabold text-clay ${pop ? "anim-pop" : ""}`}>{xp} XP</span>
      <span className="hidden text-[11px] font-semibold text-ink/50 sm:inline">
        {t.level} {lvl + 1} · {levelName(lvl, lang)}
      </span>
      <span className="relative hidden h-1.5 w-16 overflow-hidden rounded-full bg-ink/10 sm:block">
        <span
          className="anim-progress absolute inset-y-0 left-0 rounded-full bg-clay"
          style={{ width: `${prog.pct}%` }}
        />
      </span>
    </div>
  );
}

export function JourneyLayout({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  const { t } = useLang();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-ink/8 bg-paper/90 backdrop-blur">
        <div className={`mx-auto w-full px-4 py-3 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <Link href="/" className="group flex items-center gap-2 font-extrabold tracking-tight">
              <span className="anim-breathe flex h-7 w-7 items-center justify-center rounded-lg bg-pine text-sm text-paper">
                Q
              </span>
              <span className="text-ink">
                Qadam<span className="text-pine">.kz</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <XpChip />
              <LanguageSwitcher />
            </div>
          </div>
          <Stepper />
        </div>
      </header>

      <main className={`mx-auto w-full flex-1 px-4 py-6 sm:py-8 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
        {children}
      </main>

      <footer className="border-t border-ink/8 bg-paper-dark/50">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-ink/45">
          {t.footerNote}
        </div>
      </footer>
    </div>
  );
}
