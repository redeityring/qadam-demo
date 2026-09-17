"use client";

/**
 * AskAiPanel — блок «Спроси ИИ»: отвечает на вопросы о ваших вариантах
 * и плане с учётом профиля. Запрос идёт через /api/ask (OpenRouter, free-модель).
 */

import { useState } from "react";
import { useProfile } from "@/context/ProfileContext";
import { useGamification, XP_FOR_FIRST_AI_QUESTION } from "@/i18n/GamificationContext";
import { useLang } from "@/i18n/LanguageContext";

type Status = "idle" | "loading" | "error";

export function AskAiPanel() {
  const { profile, complete } = useProfile();
  const { lang, t } = useLang();
  const { addXp, canEarnAiXp, markAiQuestion, hydrated } = useGamification();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  async function ask(q: string) {
    const text = q.trim();
    if (!text || status === "loading") return;
    setStatus("loading");
    setAnswer(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, lang, profile }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { answer?: string };
      if (!data.answer) throw new Error("empty answer");
      setAnswer(data.answer);
      setStatus("idle");
      if (hydrated && canEarnAiXp) {
        markAiQuestion();
        addXp(XP_FOR_FIRST_AI_QUESTION);
      }
    } catch {
      setStatus("error");
    }
  }

  if (!complete) return null;

  const sugg = [t.askSugg1, t.askSugg2, t.askSugg3, t.askSugg4];

  return (
    <section className="card anim-rise mt-4 p-5" aria-label={t.askTitle}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-bold text-ink">🤖 {t.askTitle}</h2>
          <p className="muted mt-0.5 text-xs">{t.askSub}</p>
        </div>
        {hydrated && canEarnAiXp && (
          <span className="badge badge-demo shrink-0">{t.askFirstTime}</span>
        )}
      </div>

      <form
        className="mt-3 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(question);
        }}
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t.askPlaceholder}
          className="input flex-1"
          maxLength={300}
        />
        <button type="submit" disabled={status === "loading" || !question.trim()} className="btn btn-primary sm:w-32">
          {status === "loading" ? t.askThinking : t.askSend}
        </button>
      </form>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {sugg.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setQuestion(s);
              void ask(s);
            }}
            className="chip chip-off !px-3 !py-1 text-xs"
          >
            {s}
          </button>
        ))}
      </div>

      {status === "error" && <p className="field-error mt-3">{t.askError}</p>}

      {answer && (
        <div className="anim-rise mt-3 rounded-xl bg-pine/5 p-4">
          <p className="text-sm whitespace-pre-line text-ink/85">{answer}</p>
          <p className="mt-2 text-[11px] text-ink/40">{t.askDisclaimer}</p>
        </div>
      )}
    </section>
  );
}
