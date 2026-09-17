"use client";

/**
 * ProfileContext — единственный источник правды профиля абитуриента.
 * Персистентность: localStorage. Все экраны-результаты — чистые проекции профиля.
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
import type { MajorId, Profile, SubjectId } from "@/types";

const STORAGE_KEY = "qadam.profile.v1";

export const DEFAULT_PROFILE: Profile = {
  grade: 11,
  city: "almaty",
  interests: [],
  strengths: {},
  desiredMajors: [],
  studyLanguage: "ru",
  budgetPerYearTenge: 1_000_000,
  budgetAny: false,
  needsDorm: false,
  countries: "kz",
  plannedExams: ["ent"],
  entEstimate: null,
  ieltsEstimate: null,
  satEstimate: null,
  targetYear: new Date().getFullYear() + 1,
  nextActionDoneAt: null,
  doneSteps: [],
  compareIds: [],
  favoriteIds: [],
  priority: ["cost", "proximity", "ranking", "dorm"],
};

export function isProfileComplete(p: Profile): boolean {
  return p.interests.length > 0 && p.entEstimate !== null;
}

/** Валидация профиля: возвращает ошибки по полям (ru — язык админки по умолчанию) */
export function validateProfile(p: Profile): Partial<Record<keyof Profile, string>> {
  const errors: Partial<Record<keyof Profile, string>> = {};
  if (p.interests.length === 0) errors.interests = "Выберите хотя бы один интерес";
  if (p.interests.length > 4) errors.interests = "Максимум 4 интереса";
  if ((p.desiredMajors?.length ?? 0) > 5) errors.desiredMajors = "Максимум 5 специальностей";
  if (p.entEstimate !== null && (p.entEstimate < 50 || p.entEstimate > 140))
    errors.entEstimate = "Балл должен быть от 50 до 140";
  if (p.budgetPerYearTenge < 0) errors.budgetPerYearTenge = "Бюджет не может быть отрицательным";
  return errors;
}

type Action =
  | { type: "hydrate"; profile: Profile }
  | { type: "patch"; patch: Partial<Profile> }
  | { type: "toggleInterest"; subject: SubjectId }
  | { type: "setStrength"; subject: SubjectId; value: number }
  | { type: "toggleMajor"; major: MajorId }
  | { type: "toggleExam"; exam: "ent" | "ielts" | "sat" }
  | { type: "reset" };

function reducer(state: Profile, action: Action): Profile {
  switch (action.type) {
    case "hydrate":
      return action.profile;
    case "patch":
      return { ...state, ...action.patch };
    case "toggleInterest": {
      const has = state.interests.includes(action.subject);
      if (has) {
        // Разрешаем снимать даже последний интерес — анкета валидируется
        // на шаге навигации (появится ошибка, если продолжить без интересов).
        const interests = state.interests.filter((s) => s !== action.subject);
        const strengths = { ...state.strengths };
        delete strengths[action.subject];
        return { ...state, interests, strengths };
      }
      if (state.interests.length >= 4) return state; // лимит 4
      return {
        ...state,
        interests: [...state.interests, action.subject],
        // у нового интереса сила по умолчанию 3
        strengths: state.strengths[action.subject]
          ? state.strengths
          : { ...state.strengths, [action.subject]: 3 },
      };
    }
    case "setStrength":
      return { ...state, strengths: { ...state.strengths, [action.subject]: action.value } };
    case "toggleMajor": {
      const cur = state.desiredMajors ?? [];
      const has = cur.includes(action.major);
      if (has) return { ...state, desiredMajors: cur.filter((m) => m !== action.major) };
      if (cur.length >= 5) return state; // лимит 5
      return { ...state, desiredMajors: [...cur, action.major] };
    }
    case "toggleExam": {
      const has = state.plannedExams.includes(action.exam);
      if (has && state.plannedExams.length === 1) return state; // хотя бы один экзамен
      return {
        ...state,
        plannedExams: has
          ? state.plannedExams.filter((e) => e !== action.exam)
          : [...state.plannedExams, action.exam],
      };
    }
    case "reset":
      return { ...DEFAULT_PROFILE };
    default:
      return state;
  }
}

interface ProfileContextValue {
  profile: Profile;
  /** true, пока профиль восстанавливается из localStorage (защита от hydration-мигания) */
  hydrated: boolean;
  update: (patch: Partial<Profile>) => void;
  toggleInterest: (subject: SubjectId) => void;
  setStrength: (subject: SubjectId, value: number) => void;
  toggleMajor: (major: MajorId) => void;
  toggleExam: (exam: "ent" | "ielts" | "sat") => void;
  reset: () => void;
  complete: boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, dispatch] = useReducer(reducer, DEFAULT_PROFILE);
  const [hydrated, setHydrated] = useReducer(() => true, false);

  // Восстановление профиля из localStorage после монтирования
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Profile;
        // Мягкая валидация: merges с дефолтом, чтобы старые версии данных не ломали UI
        dispatch({
          type: "hydrate",
          profile: {
            ...DEFAULT_PROFILE,
            ...parsed,
            strengths: parsed.strengths ?? {},
            desiredMajors: parsed.desiredMajors ?? [],
          },
        });
      }
    } catch {
      // повреждённые данные игнорируем — начинаем с дефолта
    }
    setHydrated();
  }, []);

  // Сохранение при каждом изменении
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // переполнение/приватный режим — не критично
    }
  }, [profile, hydrated]);

  const update = useCallback((patch: Partial<Profile>) => dispatch({ type: "patch", patch }), []);
  const toggleInterest = useCallback(
    (subject: SubjectId) => dispatch({ type: "toggleInterest", subject }),
    [],
  );
  const setStrength = useCallback(
    (subject: SubjectId, value: number) => dispatch({ type: "setStrength", subject, value }),
    [],
  );
  const toggleMajor = useCallback(
    (major: MajorId) => dispatch({ type: "toggleMajor", major }),
    [],
  );
  const toggleExam = useCallback(
    (exam: "ent" | "ielts" | "sat") => dispatch({ type: "toggleExam", exam }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  const value = useMemo(
    () => ({
      profile,
      hydrated,
      update,
      toggleInterest,
      setStrength,
      toggleMajor,
      toggleExam,
      reset,
      complete: isProfileComplete(profile),
    }),
    [profile, hydrated, update, toggleInterest, setStrength, toggleMajor, toggleExam, reset],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
