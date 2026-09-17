"use client";

/**
 * LanguageContext — язык интерфейса (RU/KK/EN) с сохранением в localStorage.
 * Дефолт — русский (рабочий язык кейса), переключение мгновенное.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { DICT, type Dict, type Lang } from "@/i18n/dictionaries";

const LANG_KEY = "qadam.lang.v1";

type Action = { type: "hydrate"; lang: Lang } | { type: "set"; lang: Lang };

function reducer(_state: Lang, action: Action): Lang {
  return action.lang;
}

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, dispatch] = useReducer(reducer, "ru" as Lang);

  // Восстановление выбора языка после монтирования (SSR-безопасно)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LANG_KEY);
      if (raw === "ru" || raw === "kk" || raw === "en") {
        dispatch({ type: "hydrate", lang: raw });
        document.documentElement.lang = raw;
      }
    } catch {
      /* приватный режим — игнорируем */
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    dispatch({ type: "set", lang: l });
    try {
      window.localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l;
  }, []);

  const value = useMemo<LangContextValue>(
    () => ({ lang, setLang, t: DICT[lang] as unknown as Dict }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
