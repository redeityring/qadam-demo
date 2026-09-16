"use client";

/**
 * Этап 1 кейса: Вход. Короткое и понятное объяснение ценности сервиса
 * и ожидаемого результата + CTA к анкете.
 */

import Link from "next/link";
import { JourneyLayout } from "@/components/JourneyLayout";
import { useProfile } from "@/context/ProfileContext";
import { STEPS } from "@/lib/constants";

export default function LandingPage() {
  const { complete } = useProfile();

  return (
    <JourneyLayout>
      <section className="py-6 text-center sm:py-10">
        <p className="badge badge-demo mx-auto mb-4">Демо-данные · LOCUS Hackathon 2026 · Кейс 02</p>
        <h1 className="mx-auto max-w-2xl text-3xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Персональный маршрут поступления —{" "}
          <span className="text-indigo-600">за 3 минуты</span>
        </h1>
        <p className="muted mx-auto mt-4 max-w-xl text-base sm:text-lg">
          Ответьте на несколько вопросов о классе, интересах и бюджете — и получите понятный план:
          куда поступать, почему эти варианты подходят и что делать следующим шагом.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/profile" className="btn btn-primary w-full sm:w-auto">
            {complete ? "Продолжить путь" : "Пройти анкету"} →
          </Link>
          {complete && (
            <Link href="/results" className="btn btn-secondary w-full sm:w-auto">
              Мои рекомендации
            </Link>
          )}
        </div>
        <p className="muted mt-3 text-xs">
          Без регистрации. Профиль сохраняется в вашем браузере.
        </p>
      </section>

      {/* Что вы получите */}
      <section className="mt-6">
        <h2 className="section-title mb-4 text-center">Что вы получите</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              emoji: "🎯",
              title: "Подходящие варианты",
              text: "Минимум три университета или программы с объяснением, почему они подходят именно вам.",
            },
            {
              emoji: "⚖️",
              title: "Честное сравнение",
              text: "Сравните варианты по стоимости, проходным баллам, грантам и языку обучения.",
            },
            {
              emoji: "🗺️",
              title: "План действий",
              text: "Экзамены, документы и дедлайны — персональный маршрут до зачисления.",
            },
          ].map((f) => (
            <div key={f.title} className="card card-hover p-5">
              <div className="text-3xl">{f.emoji}</div>
              <h3 className="mt-3 font-bold text-slate-900">{f.title}</h3>
              <p className="muted mt-1">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Как это работает: этапы */}
      <section className="mt-10">
        <h2 className="section-title mb-4 text-center">Как это работает</h2>
        <ol className="grid gap-3 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.id} className="card flex items-center gap-3 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {i + 1}
              </span>
              <span className="text-sm font-semibold text-slate-700">{s.label}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Честность */}
      <section className="card mt-10 border-l-4 border-l-emerald-500 p-5">
        <h2 className="font-bold text-slate-900">Честность данных</h2>
        <p className="muted mt-1">
          Названия вузов и программ — реальные; стоимость, проходные баллы и сроки снабжены
          пометками «источник» или «демо-данные». Мы не гарантируем поступление — мы показываем
          маршрут и объясняем логику каждой рекомендации.
        </p>
      </section>
    </JourneyLayout>
  );
}
