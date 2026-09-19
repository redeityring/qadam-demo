"use client";

/**
 * AskAiPanel — блок «Спроси ИИ».
 *
 * Что важно с точки зрения приватности и стабильности:
 *   1. Профиль уходит в модель только после явного согласия пользователя
 *      (гейт ниже). Согласие хранится с версией текста: при изменении состава
 *      передаваемых данных версия меняется, и согласие запрашивается заново.
 *   2. Лимит обращений к ИИ — 5 в сутки. Счётчик приходит с сервера (это
 *      единственный источник правды); после лимита отвечает встроенный
 *      офлайн-консультант, а панель честно об этом сообщает.
 *   3. Тексты ошибок сервера не показываются как есть — интерфейс объясняет
 *      состояние человеческим языком на выбранном языке.
 */

import { useEffect, useReducer, useState } from "react";
import { useProfile } from "@/context/ProfileContext";
import { useGamification, XP_FOR_FIRST_AI_QUESTION } from "@/i18n/GamificationContext";
import { useLang } from "@/i18n/LanguageContext";
import { AI_CONSENT_VERSION } from "@/lib/aiPolicy";

type Status = "idle" | "loading" | "error";

interface QuotaState {
  limit: number;
  used: number;
  remaining: number;
  resetsAt: string;
  exhausted: boolean;
}

interface AskResponse {
  answer?: string;
  model?: string;
  notice?: string | null;
  quota?: QuotaState;
  error?: string;
}

const CONSENT_KEY = "qadam.ai.consent.v1";

export function AskAiPanel() {
  const { profile, complete } = useProfile();
  const { lang, t } = useLang();
  const { addXp, canEarnAiXp, markAiQuestion, hydrated } = useGamification();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [quota, setQuota] = useState<QuotaState | null>(null);
  // useReducer + dispatch в эффекте — SSR-безопасное чтение localStorage
  const [consent, setConsent] = useReducer((_state: boolean, next: boolean) => next, false);
  const [consentReady, markConsentReady] = useReducer(() => true, false);

  useEffect(() => {
    try {
      setConsent(window.localStorage.getItem(CONSENT_KEY) === AI_CONSENT_VERSION);
    } catch {
      /* приватный режим — согласие останется неданным до явного действия */
    }
    markConsentReady();
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/api/ask", { method: "GET" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AskResponse | null) => {
        if (!alive || !data?.quota) return;
        setQuota(data.quota);
      })
      .catch(() => {
        /* счётчик не критичен: сервер всё равно проверит лимит */
      });
    return () => {
      alive = false;
    };
  }, []);

  function acceptConsent() {
    try {
      window.localStorage.setItem(CONSENT_KEY, AI_CONSENT_VERSION);
    } catch {
      /* ignore */
    }
    setConsent(true);
  }

  function revokeConsent() {
    try {
      window.localStorage.removeItem(CONSENT_KEY);
    } catch {
      /* ignore */
    }
    setConsent(false);
    setAnswer(null);
  }

  async function ask(q: string) {
    const text = q.trim();
    if (!text || status === "loading" || !consent) return;
    setStatus("loading");
    setAnswer(null);
    setModel(null);
    setNotice(null);
    setErrorText(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          lang,
          consent: { granted: true, version: AI_CONSENT_VERSION },
          profile,
        }),
      });

      if (res.status === 403) {
        revokeConsent();
        setStatus("error");
        setErrorText(t.askConsentRequired);
        return;
      }
      if (res.status === 429) {
        setStatus("error");
        setErrorText(t.askRateLimited);
        return;
      }

      const data = (await res.json().catch(() => null)) as AskResponse | null;
      if (!res.ok || !data?.answer) throw new Error(data?.error ?? `HTTP ${res.status}`);

      setAnswer(data.answer);
      setModel(data.model ?? null);
      setNotice(data.notice ?? null);
      if (data.quota) setQuota(data.quota);
      setStatus("idle");
      if (hydrated && canEarnAiXp) {
        markAiQuestion();
        addXp(XP_FOR_FIRST_AI_QUESTION);
      }
    } catch {
      setStatus("error");
      setErrorText(t.askError);
    }
  }

  if (!complete) return null;

  const sugg = [t.askSugg1, t.askSugg2, t.askSugg3, t.askSugg4];
  const remaining = quota?.remaining ?? null;
  const limit = quota?.limit ?? 5;
  const exhausted = quota ? quota.exhausted : false;
  const resetTime = quota?.resetsAt
    ? new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Almaty",
      }).format(new Date(quota.resetsAt))
    : null;

  return (
    <section className="card anim-rise mt-4 p-5" aria-label={t.askTitle}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-bold text-ink">🤖 {t.askTitle}</h2>
          <p className="muted mt-0.5 text-xs">{t.askSub}</p>
        </div>
        <div className="shrink-0 text-right">
          {remaining !== null && (
            <span
              className={`badge ${exhausted ? "badge-demo" : "bg-pine/10 text-pine"}`}
              title={t.askQuotaTitle}
            >
              {t.askQuotaUsed} {limit - remaining}/{limit}
            </span>
          )}
          {hydrated && canEarnAiXp && !exhausted && (
            <span className="badge badge-demo mt-1 block">{t.askFirstTime}</span>
          )}
        </div>
      </div>

      {/* --- Гейт согласия: без него профиль в модель не уходит --- */}
      {consentReady && !consent ? (
        <div className="anim-rise mt-3 rounded-xl bg-pine/5 p-4">
          <p className="text-sm font-bold text-ink">{t.askConsentTitle}</p>
          <p className="muted mt-1 text-xs">{t.askConsentLead}</p>
          <ul className="mt-2 space-y-1">
            {t.askConsentItems.map((item: string) => (
              <li key={item} className="flex gap-1.5 text-xs text-ink/80">
                <span aria-hidden className="text-moss">
                  •
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p className="muted mt-2 text-[11px]">{t.askConsentNote}</p>
          {/* Полная прозрачность: показываем ровно то, что уходит на сервер */}
          <details className="mt-3 rounded-lg bg-white/70 p-3">
            <summary className="cursor-pointer text-xs font-semibold text-pine">
              {t.askConsentDetails}
            </summary>
            <pre className="mt-2 overflow-x-auto text-[10px] leading-relaxed text-ink/60">{`POST /api/ask
{
  "question": "…",
  "lang": "${lang}",
  "consent": { "granted": true, "version": "${AI_CONSENT_VERSION}" },
  "profile": {
    "grade", "city", "interests", "strengths", "desiredMajors",
    "studyLanguage", "budgetPerYearTenge", "budgetAny", "needsDorm",
    "countries", "plannedExams", "entEstimate", "ieltsEstimate",
    "satEstimate", "targetYear", "priority"
  }
}`}</pre>
            <p className="muted mt-2 text-[11px]">
              {t.askConsentDetailsNote.replace("{limit}", String(limit))}
            </p>
          </details>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={acceptConsent}
              className="btn btn-primary !px-4 !py-2 text-xs"
            >
              {t.askConsentAccept}
            </button>
          </div>
        </div>
      ) : (
        <>
          {exhausted && (
            <div className="anim-rise mt-3 rounded-xl bg-clay/10 p-3">
              <p className="text-xs font-semibold text-clay-deep">
                {t.askQuotaExhausted.replaceAll("{limit}", String(limit))}
              </p>
              <p className="muted mt-0.5 text-[11px]">
                {t.askQuotaResets.replace("{time}", resetTime ?? "00:00")}
              </p>
            </div>
          )}

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
              aria-label={t.askPlaceholder}
            />
            <button
              type="submit"
              disabled={status === "loading" || !question.trim()}
              title={!question.trim() ? t.askTypeHint : undefined}
              className="btn btn-primary sm:w-32"
            >
              {status === "loading" ? t.askThinking : t.askSend}
            </button>
          </form>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {sugg.map((s: string) => (
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
        </>
      )}

      {status === "error" && <p className="field-error mt-3">{errorText ?? t.askError}</p>}

      {answer && (
        <div className="anim-rise mt-3 rounded-xl bg-pine/5 p-4">
          <p className="text-sm whitespace-pre-line text-ink/85">{answer}</p>

          {model === "qadam-builtin" && (
            <p className="mt-2 text-[11px] text-ink/40">
              🧩 {t.askBuiltin}
              {notice === "quota_exhausted" && ` · ${t.askQuotaExhaustedShort}`}
            </p>
          )}
          {model && model !== "qadam-builtin" && (
            <p className="mt-2 text-[11px] text-ink/40">✨ {t.askModelLabel}: {model}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-ink/40">{t.askDisclaimer}</p>
            <button
              type="button"
              onClick={revokeConsent}
              className="text-[11px] text-ink/40 underline underline-offset-2 hover:text-clay"
            >
              {t.askConsentRevoke}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
