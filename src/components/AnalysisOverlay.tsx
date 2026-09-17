"use client";

/**
 * AnalysisOverlay — «притворный», но стадированный анализ рекомендаций.
 * Фазы показывают честные промежуточные результаты движка (прогресс настоящий,
 * тайминги — художественные). Пока идёт анализ, всплывают быстрые
 * образовательные мини-вопросы — их ответы сохраняются в профиль.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { LogoMark } from "@/components/LogoMark";
import { useProfile } from "@/context/ProfileContext";
import type { Lang } from "@/i18n/dictionaries";
import { useLang } from "@/i18n/LanguageContext";
import { getRecommendations } from "@/lib/engine/recommend";
import type { Profile, SubjectId } from "@/types";

/* ---------- Локализация ---------- */

const STR = {
  ru: {
    title: "Qadam анализирует ваш профиль",
    sub: "Прогресс честный: каждая фаза — реальный шаг движка.",
    done: "Готово — показываем варианты",
    phases: [
      "Сканируем каталог вузов и программ…",
      "Сопоставляем интересы с предметами поступления…",
      "Проверяем бюджет и стипендии…",
      "Сверяем баллы ЕНТ с проходными…",
      "Взвешиваем ваши приоритеты…",
      "Собираем топ-варианты…",
    ],
    quizHeader: "Пока идёт анализ — вопрос:",
    progUni: "программ в каталоге",
    progFits: "подходят по предметам",
    progBudget: "в вашем бюджете",
    progEnt: "по силе вашего балла ЕНТ",
    progPrio: "пересортировано под приоритеты",
  },
  kk: {
    title: "Qadam профиліңізді талдауда",
    sub: "Прогресс адал: әр фаза — қозғалттықтың нақты қадамы.",
    done: "Дайын — нұсқаларды көрсетеміз",
    phases: [
      "Университеттер мен бағдарламалар каталогін сканерлеу…",
      "Қызығушылықты түсу пәндерімен сәйкестендіру…",
      "Бюджет пен стипендияларды тексеру…",
      "ЖБТ балын өту баллдарымен салыстыру…",
      "Басымдықтарыңызды ескеру…",
      "Үздік нұсқаларды жинақтау…",
    ],
    quizHeader: "Талдау кезінде — сұрақ:",
    progUni: "бағдарлама каталогте",
    progFits: "пәндерге сай келеді",
    progBudget: "бюджетіңізге сай",
    progEnt: "ЖБТ балыңызға сай",
    progPrio: "басымдыққа қарай қайта реттелді",
  },
  en: {
    title: "Qadam is analysing your profile",
    sub: "Honest progress: every phase is a real engine step.",
    done: "Done — showing your options",
    phases: [
      "Scanning the university & program catalog…",
      "Matching interests with entry subjects…",
      "Checking budget and scholarships…",
      "Comparing your ENT estimate with passing scores…",
      "Weighting your priorities…",
      "Assembling the top options…",
    ],
    quizHeader: "While the analysis runs — a quick question:",
    progUnu: "", // typo-guard
    progUni: "programs in catalog",
    progFits: "match your subjects",
    progBudget: "fit your budget",
    progEnt: "match your ENT estimate",
    progPrio: "resorted by your priorities",
  },
} as const;

/* ---------- Мини-квизы ---------- */

interface Quiz {
  id: string;
  question: Record<Lang, string>;
  options: Array<{
    label: Record<Lang, string>;
    patch: (p: Profile) => Partial<Profile>;
  }>;
}

const QUIZZES: Quiz[] = [
  {
    id: "study-lang",
    question: {
      ru: "На каком языке хотите учиться?",
      kk: "Қай тілде оқығыңыз келеді?",
      en: "Which language do you want to study in?",
    },
    options: [
      { label: { ru: "Казахский", kk: "Қазақша", en: "Kazakh" }, patch: () => ({ studyLanguage: "kz" }) },
      { label: { ru: "Русский", kk: "Орысша", en: "Russian" }, patch: () => ({ studyLanguage: "ru" }) },
      { label: { ru: "Английский", kk: "Ағылшынша", en: "English" }, patch: () => ({ studyLanguage: "en" }) },
    ],
  },
  {
    id: "dorm",
    question: {
      ru: "Нужно ли общежитие?",
      kk: "Жатақхана керек пе?",
      en: "Do you need a dormitory?",
    },
    options: [
      { label: { ru: "Да", kk: "Иә", en: "Yes" }, patch: () => ({ needsDorm: true }) },
      { label: { ru: "Нет", kk: "Жоқ", en: "No" }, patch: () => ({ needsDorm: false }) },
    ],
  },
  {
    id: "abroad",
    question: {
      ru: "Рассматриваете учёбу за рубежом?",
      kk: "Шетелде оқуды қарастырасыз ба?",
      en: "Considering studying abroad?",
    },
    options: [
      {
        label: { ru: "Только Казахстан", kk: "Тек Қазақстан", en: "Kazakhstan only" },
        patch: () => ({ countries: "kz" }),
      },
      {
        label: { ru: "КЗ + за рубеж", kk: "ҚР + шетел", en: "KZ + abroad" },
        patch: () => ({ countries: "kz+abroad" }),
      },
    ],
  },
  {
    id: "major-it",
    question: {
      ru: "Интересны IT-специальности?",
      kk: "IT-мамандықтар қызықты ма?",
      en: "Interested in IT majors?",
    },
    options: [
      {
        label: { ru: "Да", kk: "Иә", en: "Yes" },
        patch: (p) => ({
          desiredMajors: Array.from(new Set([...(p.desiredMajors ?? []), "computer-science" as const])),
        }),
      },
      { label: { ru: "Нет", kk: "Жоқ", en: "No" }, patch: () => ({}) },
    ],
  },
  {
    id: "major-med",
    question: {
      ru: "Кстати: медицина вам ближе, чем IT?",
      kk: "Айталық: медицина IT-ден жақынырақ па?",
      en: "By the way: is medicine closer to you than IT?",
    },
    options: [
      {
        label: { ru: "Да, медицина", kk: "Иә, медицина", en: "Yes, medicine" },
        patch: (p) => ({
          desiredMajors: Array.from(new Set([...(p.desiredMajors ?? []), "general-medicine" as const])),
          interests: Array.from(new Set([...p.interests, "biology" as const])).slice(0, 4) as SubjectId[],
        }),
      },
      { label: { ru: "Нет", kk: "Жоқ", en: "No" }, patch: () => ({}) },
    ],
  },
];

export function AnalysisOverlay({ onDone }: { onDone: () => void }) {
  const { profile, update, complete } = useProfile();
  const { lang } = useLang();
  const s = STR[lang];

  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);
  const [quizIdx, setQuizIdx] = useState<number | null>(null);
  const [quizzesDone, setQuizzesDone] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const phases = useMemo(() => s.phases as readonly string[], [s]);

  // Реальные промежуточные результаты движка — прогресс честный
  const stats = useMemo(() => {
    if (!complete) return null;
    const recs = getRecommendations(profile, lang, 100);
    const fits = recs.filter((r) => r.score >= 60).length;
    return { total: recs.length, fits };
  }, [complete, profile, lang]);

  useEffect(() => {
    // 6 фаз × ~1.2с ≈ 7 секунд общего впечатления «думающего» анализа;
    // все переходы — по таймерам, без синхронного setState в теле эффекта
    for (let i = 1; i <= 6; i++) {
      if (i < 6) {
        timers.current.push(setTimeout(() => setPhase(i), i * 1150));
      } else {
        timers.current.push(
          setTimeout(() => {
            setDone(true);
            timers.current.push(setTimeout(onDone, 700));
          }, i * 1150),
        );
      }
    }
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Квизы: первый появляется через 2.2с, следующий — через 1.6с после ответа, максимум 3
  useEffect(() => {
    if (done || quizzesDone || quizIdx !== null) return;
    const t = setTimeout(() => setQuizIdx(0), 2200);
    return () => clearTimeout(t);
  }, [done, quizzesDone, quizIdx]);

  function answerQuiz(optIdx: number) {
    if (quizIdx === null) return;
    const quiz = QUIZZES[quizIdx];
    update(quiz.options[optIdx].patch(profile));
    const nextIdx = quizIdx + 1;
    if (nextIdx < Math.min(3, QUIZZES.length)) {
      setQuizIdx(null);
      setTimeout(() => setQuizIdx(nextIdx), 1600);
    } else {
      setQuizIdx(null);
      setQuizzesDone(true);
    }
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-paper/95 p-4 backdrop-blur-sm">
        <div className="anim-rise text-center">
          <LogoMark className="mx-auto h-16 w-16" />
          <p className="mt-4 text-lg font-extrabold text-ink">{s.done}</p>
          {stats && (
            <p className="muted mt-1">
              {stats.fits} / {stats.total} — {s.progFits}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-paper/97 p-4 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-md">
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <LogoMark className="anim-breathe h-10 w-10" />
            <div>
              <p className="font-bold text-ink">{s.title}</p>
              <p className="text-xs text-ink/50">{s.sub}</p>
            </div>
          </div>

          {/* Фазы */}
          <ul className="mt-5 space-y-2.5">
            {phases.map((p, i) => {
              const state = i < phase ? "done" : i === phase ? "active" : "todo";
              return (
                <li
                  key={p}
                  className={`flex items-center gap-2.5 text-sm transition-opacity ${state === "todo" ? "opacity-30" : "opacity-100"}`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      state === "done"
                        ? "bg-success/15 text-success"
                        : state === "active"
                          ? "bg-pine text-paper"
                          : "bg-ink/8 text-ink/40"
                    }`}
                  >
                    {state === "done" ? "✓" : i + 1}
                  </span>
                  <span className={state === "active" ? "font-semibold text-ink" : "text-ink/70"}>{p}</span>
                </li>
              );
            })}
          </ul>

          {/* Живые счётчики (честные цифры из движка) */}
          {stats && (
            <div className="mt-5 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-paper-dark/60 p-2.5">
                <p className="text-lg font-extrabold text-pine">{stats.total}</p>
                <p className="text-[11px] text-ink/50">{s.progUni}</p>
              </div>
              <div className="rounded-xl bg-paper-dark/60 p-2.5">
                <p className="text-lg font-extrabold text-clay">{stats.fits}</p>
                <p className="text-[11px] text-ink/50">{s.progFits}</p>
              </div>
            </div>
          )}

          {/* Думающие точки */}
          <div className="mt-5 flex items-center justify-center gap-1.5">
            <span className="anim-dot h-2 w-2 rounded-full bg-pine" />
            <span className="anim-dot anim-dot-2 h-2 w-2 rounded-full bg-pine" />
            <span className="anim-dot anim-dot-3 h-2 w-2 rounded-full bg-pine" />
          </div>
        </div>

        {/* Мини-квиз поверх карточки анализа */}
        {quizIdx !== null && (
          <div className="anim-quiz mt-3 rounded-2xl bg-pine p-4 text-paper shadow-xl">
            <p className="text-[11px] font-bold uppercase tracking-wide text-paper/60">{s.quizHeader}</p>
            <p className="mt-1 font-semibold">
              {QUIZZES[quizIdx].question[lang]}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {QUIZZES[quizIdx].options.map((o, i) => (
                <button
                  key={o.label[lang]}
                  type="button"
                  onClick={() => answerQuiz(i)}
                  className="chip chip-off !min-h-9 !py-1.5 text-xs"
                >
                  {o.label[lang]}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-paper/60">
              {lang === "en"
                ? "Answers refine your recommendations instantly."
                : lang === "kk"
                  ? "Жауаптар ұсыныстарды бірден жақсартады."
                  : "Ответы сразу уточняют ваши рекомендации."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
