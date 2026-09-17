"use client";

/**
 * /roadmap/print — версия плана для печати и экспорта в PDF (Ctrl+P / «Сохранить как PDF»).
 * Чистая типографская вёрстка без интерфейсной обвязки; чекбоксы можно отметить ручкой.
 */

import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";
import { useProfile } from "@/context/ProfileContext";
import { useLang } from "@/i18n/LanguageContext";
import { CITY_L, budgetLabel } from "@/i18n/engine";
import { firstOpenStep, getRoadmap, roadmapSectionLabel, ROADMAP_SECTIONS } from "@/lib/engine/roadmap";

export default function RoadmapPrintPage() {
  const { profile, complete, hydrated } = useProfile();
  const { lang, t } = useLang();

  const steps = hydrated && complete ? getRoadmap(profile, lang) : [];
  const open = hydrated && complete ? firstOpenStep(steps, profile.doneSteps ?? []) : null;

  return (
    <div className="print-page mx-auto max-w-2xl p-6 sm:p-10">
      {/* Панель действий — не печатается */}
      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-pine p-4 text-paper">
        <p className="text-sm font-semibold">
          {lang === "en"
            ? "Ready to export — use “Save as PDF” in the print dialog."
            : lang === "kk"
              ? "Экспортке дайын — басып шығару терезесінде «PDF ретінде сақтау» таңдаңыз."
              : "Готово к экспорту — в окне печати выберите «Сохранить как PDF»."}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => window.print()} className="btn btn-accent !min-h-10 !px-4 !py-2 text-xs">
            🖨 {lang === "en" ? "Print / PDF" : lang === "kk" ? "Басып шығару / PDF" : "Печать / PDF"}
          </button>
          <Link href="/roadmap" className="btn btn-secondary !min-h-10 !px-4 !py-2 text-xs">
            {t.back}
          </Link>
        </div>
      </div>

      {/* Шапка документа */}
      <header className="flex items-start justify-between gap-4 border-b-2 border-pine pb-4">
        <div className="flex items-center gap-3">
          <LogoMark className="h-12 w-12" />
          <div>
            <h1 className="text-xl font-extrabold text-ink">Qadam</h1>
            <p className="text-xs text-ink/60">{t.brandTagline}</p>
          </div>
        </div>
        <div className="text-right text-xs text-ink/60">
          <p>
            {t.profileStep} {profile.grade} · {CITY_L[profile.city]?.[lang] ?? ""}
          </p>
          <p>{budgetLabel(profile, lang)}</p>
          <p>
            {t.diagENT}: {profile.entEstimate ?? "—"}
          </p>
          <p>{new Date().toLocaleDateString(lang === "en" ? "en-US" : "ru-RU")}</p>
        </div>
      </header>

      <h2 className="mt-6 text-lg font-extrabold text-ink">{t.roadmapTitle}</h2>
      <p className="mt-1 text-sm text-ink/70">{d_sub(lang)}</p>

      {!complete ? (
        <p className="mt-6 text-sm text-ink/60">{t.calEmpty}</p>
      ) : (
        <>
          {/* Следующий шаг */}
          {open && (
            <div className="mt-4 rounded-xl border-2 border-clay bg-clay/5 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-clay-deep">{t.nextStep}</p>
              <p className="mt-1 font-bold text-ink">{open.title}</p>
              <p className="mt-0.5 text-sm text-ink/70">{open.why}</p>
            </div>
          )}

          {/* Разделы */}
          {ROADMAP_SECTIONS.map((section) => {
            const sectionSteps = steps.filter((s) => s.section === section.id);
            if (sectionSteps.length === 0) return null;
            const label = roadmapSectionLabel(section.id, lang);
            return (
              <section key={section.id} className="print-break mt-6">
                <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-pine">
                  <span>{section.emoji}</span> {label.title}
                </h3>
                <ol className="mt-2 space-y-3">
                  {sectionSteps.map((s) => {
                    const isDone = (profile.doneSteps ?? []).includes(s.id);
                    return (
                      <li key={s.id} className="flex gap-3">
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-[11px] font-bold ${
                            isDone ? "border-success bg-success text-white" : "border-ink/30 text-transparent"
                          }`}
                        >
                          ✓
                        </span>
                        <div>
                          <p className="text-sm font-bold text-ink">
                            {s.title}
                            <span className="ml-2 text-[11px] font-medium text-ink/50">🕒 {s.period[lang]}</span>
                          </p>
                          <p className="text-xs text-ink/70">{s.why}</p>
                          <p className="mt-0.5 text-[11px] text-ink/45">
                            {s.source.url ? (
                              <a href={s.source.url} className="underline">
                                {s.source.label}
                              </a>
                            ) : (
                              s.source.label
                            )}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}

          {/* Футер документа */}
          <footer className="mt-8 border-t border-ink/15 pt-3 text-[11px] text-ink/50">
            <p>{t.compareDemoNote}</p>
            <p className="mt-1">Qadam · {t.footerNote}</p>
          </footer>
        </>
      )}
    </div>
  );
}

function d_sub(lang: "ru" | "kk" | "en"): string {
  if (lang === "en") return "Personal admission route — print it and check off steps as you go.";
  if (lang === "kk") return "Жеке түсу маршруты — басып шығарып, орындалғанды белгілеңіз.";
  return "Персональный маршрут поступления — распечатайте и отмечайте выполненные шаги.";
}
