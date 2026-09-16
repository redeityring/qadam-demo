"use client";

/**
 * JourneyLayout — общая оболочка экранов пути: шапка с прогрессом, футер.
 * Дочерние маршруты рендерятся между ними.
 */

import Link from "next/link";
import { Stepper } from "@/components/Stepper";

export function JourneyLayout({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className={`mx-auto w-full px-4 py-3 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
          <div className="mb-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white">
                Т
              </span>
              <span className="text-slate-900">
                Траектория<span className="text-indigo-600">.kz</span>
              </span>
            </Link>
            <span className="badge badge-demo">Демо-данные</span>
          </div>
          <Stepper />
        </div>
      </header>

      <main className={`mx-auto w-full flex-1 px-4 py-6 sm:py-8 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-400">
          Траектория — учебный проект для LOCUS Startup Hackathon 2026, Кейс 02. Данные о вузах и
          дедлайнах приведены для демонстрации; проверяйте их на официальных сайтах вузов и
          e.gov.kz.
        </div>
      </footer>
    </div>
  );
}
