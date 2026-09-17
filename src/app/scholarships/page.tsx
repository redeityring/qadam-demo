"use client";

/**
 * Стипендии и гранты: подбор под бюджет, ЕНТ и направление.
 * Условия — демо-данные с честной пометкой; источники — официальные сайты фондов.
 */

import Link from "next/link";
import { useMemo } from "react";
import { JourneyLayout } from "@/components/JourneyLayout";
import { useProfile } from "@/context/ProfileContext";
import { useLang } from "@/i18n/LanguageContext";
import { SCHOLARSHIPS, scholarshipFits } from "@/i18n/engine";

export default function ScholarshipsPage() {
  const { profile, complete } = useProfile();
  const { lang, t } = useLang();

  const { fitting, others } = useMemo(() => {
    if (!complete) return { fitting: [], others: SCHOLARSHIPS };
    const f = SCHOLARSHIPS.filter((s) => scholarshipFits(s, profile));
    const o = SCHOLARSHIPS.filter((s) => !scholarshipFits(s, profile));
    return { fitting: f, others: o };
  }, [complete, profile]);

  function Card({ s, fits }: { s: (typeof SCHOLARSHIPS)[number]; fits: boolean }) {
    return (
      <article className={`card card-hover anim-rise p-5 ${fits ? "" : "opacity-65"}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-bold text-ink">{s.name[lang]}</h2>
            <p className="muted mt-0.5 text-xs">{s.provider}</p>
          </div>
          {fits && complete && <span className="badge badge-source shrink-0">{t.schFit}</span>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="badge bg-ink/5 text-ink/70">
            {t.schAmount}: {s.amount[lang]}
          </span>
          <span className="badge bg-ink/5 text-ink/70">
            {t.schDeadline}: {s.deadline}
          </span>
        </div>
        <p className="muted mt-2 text-sm">{s.note[lang]}</p>
        <div className="mt-3 flex items-center justify-between">
          <a
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="badge badge-source hover:underline"
          >
            ↗ {s.url.replace("https://", "")}
          </a>
          <span className="badge badge-demo">demo</span>
        </div>
      </article>
    );
  }

  return (
    <JourneyLayout>
      <div className="anim-rise mb-4">
        <h1 className="section-title">💸 {t.schTitle}</h1>
        <p className="muted mt-1">{t.schSub}</p>
      </div>

      {complete && (
        <div className="mb-4">
          <h2 className="text-xs font-bold tracking-wide text-success uppercase">{t.schFit}</h2>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            {fitting.length === 0 ? (
              <p className="muted">{t.noResultsD}</p>
            ) : (
              fitting.map((s) => <Card key={s.id} s={s} fits />)
            )}
          </div>
        </div>
      )}

      {complete && others.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold tracking-wide text-ink/45 uppercase">
            {lang === "en" ? "Other options" : lang === "kk" ? "Басқа нұсқалар" : "Другие варианты"}
          </h2>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            {others.map((s) => (
              <Card key={s.id} s={s} fits={false} />
            ))}
          </div>
        </div>
      )}

      {!complete && (
        <div className="grid gap-4 sm:grid-cols-2">
          {SCHOLARSHIPS.map((s) => (
            <Card key={s.id} s={s} fits={false} />
          ))}
        </div>
      )}

      <p className="muted mt-4 text-xs">{t.schNote}</p>

      <div className="mt-6 flex justify-between">
        <Link href="/results" className="btn btn-secondary">
          ← {t.backToRecs}
        </Link>
      </div>
    </JourneyLayout>
  );
}
