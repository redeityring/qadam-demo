"use client";

/**
 * LanguageSwitcher — компактный выбор RU / KZ / EN в шапке.
 * Мгновенно переключает язык интерфейса и сохраняет выбор.
 */

import { LANGS } from "@/i18n/dictionaries";
import { useLang } from "@/i18n/LanguageContext";

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div
      role="group"
      aria-label="Language / Тіл / Язык"
      className="flex items-center rounded-full bg-white/70 p-0.5 outline outline-1 outline-pine/20"
    >
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          onClick={() => setLang(l.id)}
          aria-pressed={lang === l.id}
          title={l.label}
          className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
            lang === l.id ? "bg-pine text-paper" : "text-ink/60 hover:text-pine"
          }`}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
