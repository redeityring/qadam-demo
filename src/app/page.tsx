"use client";

/**
 * Этап 1 кейса: Вход. Короткое и понятное объяснение ценности сервиса
 * и ожидаемого результата + CTA к анкете.
 */

import Link from "next/link";
import { JourneyLayout } from "@/components/JourneyLayout";
import { useProfile } from "@/context/ProfileContext";
import { useLang } from "@/i18n/LanguageContext";
import { STEPS } from "@/lib/constants";

export default function LandingPage() {
  const { complete } = useProfile();
  const { t, lang } = useLang();

  const features = [
    { emoji: "🎯", title: t.feature1T, text: t.feature1D },
    { emoji: "⚖️", title: t.feature2T, text: t.feature2D },
    { emoji: "🗺️", title: t.feature3T, text: t.feature3D },
    { emoji: "📅", title: t.feature4T, text: t.feature4D },
    { emoji: "💸", title: t.feature5T, text: t.feature5D },
    { emoji: "🤖", title: t.feature6T, text: t.feature6D },
  ];

  return (
    <JourneyLayout>
      <section className="py-6 text-center sm:py-10">
        <h1 className="anim-rise mx-auto max-w-2xl text-3xl leading-tight font-extrabold tracking-tight text-ink sm:text-5xl">
          {t.landingTitleA}{" "}
          <span className="text-clay">{t.landingTitleB}</span>
        </h1>
        <p className="anim-rise anim-rise-1 muted mx-auto mt-4 max-w-xl text-base sm:text-lg">
          {t.landingSub}
        </p>
        <div className="anim-rise anim-rise-2 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/profile" className="btn btn-primary w-full sm:w-auto">
            {complete ? t.landingContinue : t.landingCta} →
          </Link>
          {complete && (
            <Link href="/results" className="btn btn-secondary w-full sm:w-auto">
              {t.landingMyResults}
            </Link>
          )}
        </div>
        <p className="anim-rise anim-rise-3 muted mt-3 text-xs">{t.noSignup}</p>
      </section>

      {/* Что вы получите */}
      <section className="mt-6">
        <h2 className="section-title anim-rise anim-rise-2 mb-4 text-center">{t.whatYouGet}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`card card-hover anim-rise anim-rise-${Math.min(i + 1, 5)} p-5`}
            >
              <div className="text-3xl">{f.emoji}</div>
              <h3 className="mt-3 font-bold text-ink">{f.title}</h3>
              <p className="muted mt-1">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Как это работает: этапы */}
      <section className="mt-10">
        <h2 className="section-title anim-rise mb-4 text-center">{t.howItWorks}</h2>
        <ol className="grid gap-3 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li
              key={s.id}
              className="card anim-rise anim-rise-3 flex items-center gap-3 p-4"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pine/10 text-sm font-bold text-pine">
                {i + 1}
              </span>
              <span className="text-sm font-semibold text-ink/80">{s.label[lang]}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Честность */}
      <section className="card anim-rise anim-rise-4 mt-10 border-l-4 border-l-success p-5">
        <h2 className="font-bold text-ink">{t.dataHonestyTitle}</h2>
        <p className="muted mt-1">{t.dataHonestyText}</p>
      </section>
    </JourneyLayout>
  );
}
