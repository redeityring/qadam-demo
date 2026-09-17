"use client";

/**
 * GamificationContext — XP и уровни пути поступления.
 * XP начисляется за отмеченные шаги плана (+15) и первый вопрос ИИ за день (+10).
 * Всё хранится в localStorage рядом с профилем.
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
import type { Lang } from "@/i18n/dictionaries";

const XP_KEY = "qadam.gamification.v1";

export const XP_PER_ROADMAP_STEP = 15;
export const XP_FOR_FIRST_AI_QUESTION = 10;

export const LEVELS = [0, 60, 150, 280, 450] as const;

export function levelFor(xp: number): number {
  let lvl = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i]) lvl = i;
  return lvl; // 0..4
}

export function levelProgress(xp: number): { pct: number; nextAt: number | null } {
  const lvl = levelFor(xp);
  const base = LEVELS[lvl];
  const next = lvl + 1 < LEVELS.length ? LEVELS[lvl + 1] : null;
  if (next == null) return { pct: 100, nextAt: null };
  return { pct: Math.round(((xp - base) / (next - base)) * 100), nextAt: next };
}

export function levelName(lvl: number, lang: Lang): string {
  const names: Record<Lang, string[]> = {
    ru: ["Новичок", "Искатель", "Стратег", "Абитуриент", "Мастер поступления"],
    kk: ["Жаңаөспірім", "Ізденуші", "Стратег", "Абитуриент", "Түсу шебері"],
    en: ["Rookie", "Seeker", "Strategist", "Applicant", "Admission master"],
  };
  return names[lang][Math.min(lvl, names[lang].length - 1)];
}

interface State {
  xp: number;
  aiXpDate: string | null;
  hydrated: boolean;
}

type Action =
  | { type: "hydrate"; xp: number; aiXpDate: string | null }
  | { type: "addXp"; amount: number }
  | { type: "markAiQuestion"; today: string; amount: number };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { ...state, xp: action.xp, aiXpDate: action.aiXpDate, hydrated: true };
    case "addXp":
      return { ...state, xp: state.xp + action.amount };
    case "markAiQuestion": {
      if (state.aiXpDate === action.today) return state;
      return { ...state, xp: state.xp + action.amount, aiXpDate: action.today };
    }
    default:
      return state;
  }
}

interface GamificationValue {
  xp: number;
  addXp: (amount: number) => void;
  /** true, если сегодня ещё не начисляли XP за вопрос ИИ */
  canEarnAiXp: boolean;
  markAiQuestion: () => void;
  hydrated: boolean;
}

const GamificationContext = createContext<GamificationValue | null>(null);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    xp: 0,
    aiXpDate: null,
    hydrated: false,
  } as State);

  // Восстановление после монтирования (SSR-безопасно)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(XP_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Pick<State, "xp" | "aiXpDate">>;
        dispatch({ type: "hydrate", xp: parsed.xp ?? 0, aiXpDate: parsed.aiXpDate ?? null });
      } else {
        dispatch({ type: "hydrate", xp: 0, aiXpDate: null });
      }
    } catch {
      dispatch({ type: "hydrate", xp: 0, aiXpDate: null });
    }
  }, []);

  // Сохранение при каждом изменении
  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(XP_KEY, JSON.stringify({ xp: state.xp, aiXpDate: state.aiXpDate }));
    } catch {
      /* ignore */
    }
  }, [state]);

  const addXp = useCallback((amount: number) => dispatch({ type: "addXp", amount }), []);

  const canEarnAiXp = state.aiXpDate !== today();

  const markAiQuestion = useCallback(
    () => dispatch({ type: "markAiQuestion", today: today(), amount: XP_FOR_FIRST_AI_QUESTION }),
    [],
  );

  const value = useMemo<GamificationValue>(
    () => ({ xp: state.xp, addXp, canEarnAiXp, markAiQuestion, hydrated: state.hydrated }),
    [state.xp, state.hydrated, addXp, canEarnAiXp, markAiQuestion],
  );

  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
}

export function useGamification(): GamificationValue {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error("useGamification must be used within GamificationProvider");
  return ctx;
}
