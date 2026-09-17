"use client";

/**
 * Этап 2 кейса: Профиль. Пошаговая анкета (7 подшагов) с валидацией.
 * Mobile-first: радиокнопки-карточки, ЕДИНЫЙ ПОИСК интересов (предметы + специальности),
 * слайдеры бюджета/ЕНТ/IELTS/SAT, приоритизация и финальная проверка ответов.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { JourneyLayout } from "@/components/JourneyLayout";
import { useProfile } from "@/context/ProfileContext";
import { useLang } from "@/i18n/LanguageContext";
import { CITY_L, MAJOR_L, searchMajors, searchSubjects, SUBJECT_L } from "@/i18n/engine";
import {
  BUDGET_STEP,
  CITIES,
  EXAMS,
  formatTenge,
  LANGUAGES,
  MAX_BUDGET,
  MAX_ENT,
  MAX_IELTS,
  MAX_SAT,
  MIN_BUDGET,
  MIN_ENT,
  MIN_IELTS,
  MIN_SAT,
  STEP_IELTS,
  STEP_SAT,
} from "@/lib/constants";
import type { SubjectId } from "@/types";

type SubStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const PRIORITIES = [
  { id: "cost", emoji: "💸", label: { ru: "Стоимость", kk: "Құны", en: "Cost" } },
  { id: "proximity", emoji: "📍", label: { ru: "Близость к дому", kk: "Үйге жақындық", en: "Close to home" } },
  { id: "ranking", emoji: "🏆", label: { ru: "Сильная программа", kk: "Күшті бағдарлама", en: "Strong program" } },
  { id: "dorm", emoji: "🏠", label: { ru: "Общежитие", kk: "Жатақхана", en: "Dormitory" } },
] as const;

type PriorityId = (typeof PRIORITIES)[number]["id"];

const PRIORITY_TITLES: Record<PriorityId, Record<"ru" | "kk" | "en", string>> = {
  cost: { ru: "Стоимость обучения", kk: "Оқу құны", en: "Tuition cost" },
  proximity: { ru: "Близость к дому", kk: "Үйге жақындық", en: "Proximity to home" },
  ranking: { ru: "Сила программы", kk: "Бағдарламаның күші", en: "Program strength" },
  dorm: { ru: "Общежитие", kk: "Жатақхана", en: "Dormitory" },
};

export default function ProfilePage() {
  const router = useRouter();
  const { profile, update, toggleInterest, setStrength, toggleMajor, toggleExam } = useProfile();
  const { lang, t } = useLang();
  const [step, setStep] = useState<SubStep>(0);
  const [touched, setTouched] = useState(false);
  const [query, setQuery] = useState("");

  const interestsError = touched && profile.interests.length === 0;
  const canFinish = profile.interests.length > 0 && profile.entEstimate !== null;
  const priority = (profile.priority ?? ["cost", "proximity", "ranking", "dorm"]) as PriorityId[];

  const progress = useMemo(() => (step / 6) * 100, [step]);

  // Результаты единого поиска: предметы + желаемые специальности
  const foundSubjects = useMemo(() => searchSubjects(query), [query]);
  const foundMajors = useMemo(() => searchMajors(query), [query]);
  const hasQuery = query.trim().length > 0;

  const EXAM_SCORE_HINTS: Record<"ent" | "ielts" | "sat", Record<"ru" | "kk" | "en", string>> = {
    ent: {
      ru: "Оцените, сколько примерно наберёте (50–140). Не знаете точно — ставьте честную приблизительную оценку.",
      kk: "Шамамен қанша жинайтыныңызды бағалаңыз (50–140). Нақты білмесеңіз — адал болжам қойыңыз.",
      en: "Estimate the score you'd likely get (50–140). Not sure? Give an honest guess.",
    },
    ielts: {
      ru: "Какой балл IELTS вы получили или ожидаете? (4.0–9.0)",
      kk: "IELTS балыңыз қандай немесе қандай болады деп күтесіз? (4.0–9.0)",
      en: "What IELTS band did you get or expect? (4.0–9.0)",
    },
    sat: {
      ru: "Ваш балл или ожидание по SAT (400–1600). Для NU и зарубежных вузов обычно нужно 1200+.",
      kk: "SAT балыңыз немесе күтім (400–1600). NU мен шетел университеттеріне әдетте 1200+ керек.",
      en: "Your SAT score or expectation (400–1600). NU and universities abroad usually need 1200+.",
    },
  };

  function next() {
    if (step === 1 && profile.interests.length === 0) {
      setTouched(true);
      return;
    }
    setTouched(false);
    setStep((s) => Math.min(s + 1, 6) as SubStep);
  }
  function back() {
    setTouched(false);
    setStep((s) => Math.max(s - 1, 0) as SubStep);
  }
  function finish() {
    if (!canFinish) {
      setTouched(true);
      return;
    }
    router.push("/diagnostics");
  }

  function movePriority(id: PriorityId, dir: -1 | 1) {
    const arr = [...priority];
    const i = arr.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    update({ priority: arr });
  }

  const substepLabels = t.substeps;

  return (
    <JourneyLayout>
      <div className="mb-6">
        <h1 className="section-title">{t.profileTitle}</h1>
        <p className="muted mt-1">
          {t.profileStep} {step + 1} {t.headerOf} {substepLabels.length}: {substepLabels[step]}
        </p>
      </div>

      {/* Прогресс подшагов анкеты */}
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className="anim-progress h-full rounded-full bg-pine"
          style={{ width: `${Math.max(8, progress)}%` }}
        />
      </div>

      <div className="card anim-rise p-5 sm:p-6">
        {/* --- Шаг 0: О вас --- */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <span className="label">
                {lang === "en" ? "What grade are you in?" : lang === "kk" ? "Сіз қайсы сыныпта оқисыз?" : "В каком классе вы учитесь?"}
              </span>
              <div className="flex flex-wrap gap-2">
                {([9, 10, 11] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() =>
                      update({ grade: g, targetYear: new Date().getFullYear() + (12 - g) })
                    }
                    className={`chip ${profile.grade === g ? "chip-on" : "chip-off"}`}
                  >
                    {g} {lang === "en" ? "grade" : lang === "kk" ? "сынып" : "класс"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="label">
                {lang === "en" ? "Your city" : lang === "kk" ? "Сіздің қалаңыз" : "Ваш город"}
              </span>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => update({ city: c.id })}
                    className={`chip ${profile.city === c.id ? "chip-on" : "chip-off"}`}
                  >
                    {c.label[lang]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- Шаг 1: Интересы — единый поиск предметов и специальностей --- */}
        {step === 1 && (
          <div>
            <span className="label">
              {lang === "en"
                ? "What do you want to study? Search subjects or majors (1–4 subjects, up to 5 majors)"
                : lang === "kk"
                  ? "Не оқығыңыз келеді? Пән немесе мамандық іздеңіз (1–4 пән, 5 мамандыққа дейін)"
                  : "Что хотите изучать? Найдите предметы или специальности (1–4 предмета, до 5 специальностей)"}
            </span>
            {interestsError && (
              <p className="field-error mb-2">
                {lang === "en"
                  ? "Pick at least one subject to continue."
                  : lang === "kk"
                    ? "Жалғастыру үшін кемінде бір пән таңдаңыз."
                    : "Выберите хотя бы один предмет, чтобы продолжить."}
              </p>
            )}

            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                lang === "en"
                  ? "Try “math”, “IT”, “medicine”, “law”…"
                  : lang === "kk"
                    ? "Мысалы: «математика», «IT», «медицина», «құқық»…"
                    : "Например: «математика», «IT», «медицина», «право»…"
              }
              className="input"
              aria-label={lang === "en" ? "Search subjects and majors" : lang === "kk" ? "Пән мен мамандық іздеу" : "Поиск предметов и специальностей"}
            />

            {/* Выбранное */}
            {(profile.interests.length > 0 || (profile.desiredMajors?.length ?? 0) > 0) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.interests.map((id) => (
                  <button
                    key={`s-${id}`}
                    type="button"
                    onClick={() => toggleInterest(id)}
                    className="chip chip-on"
                    aria-pressed
                    title={lang === "en" ? "Remove" : lang === "kk" ? "Өшіру" : "Убрать"}
                  >
                    {SUBJECTS_EMOJI[id]} {SUBJECT_L[id][lang]} ✕
                  </button>
                ))}
                {profile.desiredMajors?.map((id) => (
                  <button
                    key={`m-${id}`}
                    type="button"
                    onClick={() => toggleMajor(id)}
                    className="chip !bg-moss !text-white outline-moss"
                    aria-pressed
                    title={lang === "en" ? "Remove" : lang === "kk" ? "Өшіру" : "Убрать"}
                  >
                    🎓 {MAJOR_L[id][lang]} ✕
                  </button>
                ))}
              </div>
            )}

            {/* Подсказки, когда поле пустое */}
            {!hasQuery && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-ink/50">
                  {lang === "en" ? "Popular:" : lang === "kk" ? "Танымал:" : "Популярное:"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["math", "cs", "biology", "history", "english", "economics"] as SubjectId[]).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleInterest(id)}
                      className={`chip ${profile.interests.includes(id) ? "chip-on" : "chip-off"}`}
                    >
                      {SUBJECTS_EMOJI[id]} {SUBJECT_L[id][lang]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Результаты поиска */}
            {hasQuery && (
              <div className="mt-4 space-y-4">
                {foundSubjects.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-ink/50">
                      {lang === "en" ? "Subjects" : lang === "kk" ? "Пәндер" : "Предметы"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {foundSubjects.map(({ id }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleInterest(id)}
                          className={`chip ${profile.interests.includes(id) ? "chip-on" : "chip-off"}`}
                        >
                          {SUBJECTS_EMOJI[id]} {SUBJECT_L[id][lang]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {foundMajors.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-ink/50">
                      {lang === "en" ? "Majors" : lang === "kk" ? "Мамандықтар" : "Специальности"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {foundMajors.map(({ id }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleMajor(id)}
                          className={`chip ${(profile.desiredMajors ?? []).includes(id) ? "!bg-moss !text-white outline-moss" : "chip-off"}`}
                        >
                          🎓 {MAJOR_L[id][lang]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {foundSubjects.length === 0 && foundMajors.length === 0 && (
                  <p className="muted text-sm">
                    {lang === "en"
                      ? "Nothing found. Try a broader query — e.g. “science” or “engineering”."
                      : lang === "kk"
                        ? "Ештеңе табылмады. Кеңірек сұрақ жазыңыз — мысалы «ғылым»."
                        : "Ничего не найдено. Попробуйте более широкий запрос — например «наука»."}
                  </p>
                )}
              </div>
            )}

            <p className="muted mt-3">
              {lang === "en" ? "Selected:" : lang === "kk" ? "Таңдалды:" : "Выбрано:"}{" "}
              {profile.interests.length} {t.headerOf} 4
              {(profile.desiredMajors?.length ?? 0) > 0 && ` · ${profile.desiredMajors!.length} ${lang === "en" ? "majors" : lang === "kk" ? "мамандық" : "спец."}`}
            </p>
          </div>
        )}

        {/* --- Шаг 2: Успеваемость --- */}
        {step === 2 && (
          <div className="space-y-5">
            <span className="label">
              {lang === "en"
                ? "Rate your strength in the selected subjects"
                : lang === "kk"
                  ? "Таңдалған пәндердегі күшіңізді бағалаңыз"
                  : "Оцените свои силы по выбранным предметам"}
            </span>
            {profile.interests.map((id) => {
              const value = profile.strengths[id] ?? 3;
              return (
                <div key={id}>
                  <div className="mb-1 flex items-center justify-between text-sm font-semibold text-ink/80">
                    <span>
                      {SUBJECTS_EMOJI[id]} {SUBJECT_L[id][lang]}
                    </span>
                    <span className="text-pine">{value}/5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={value}
                    onChange={(e) => setStrength(id, Number(e.target.value))}
                    className="w-full"
                    aria-label={SUBJECT_L[id][lang]}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* --- Шаг 3: Бюджет и формат --- */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="label !mb-0">
                  {lang === "en" ? "Yearly budget" : lang === "kk" ? "Жылдық бюджет" : "Бюджет на обучение (в год)"}
                </span>
                <span className="font-bold text-pine">
                  {profile.budgetAny
                    ? lang === "en"
                      ? "Not limited"
                      : lang === "kk"
                        ? "Шектеусіз"
                        : "Не ограничен"
                    : formatTenge(profile.budgetPerYearTenge, lang)}
                </span>
              </div>
              {!profile.budgetAny && (
                <>
                  <input
                    type="range"
                    min={MIN_BUDGET}
                    max={MAX_BUDGET}
                    step={BUDGET_STEP}
                    value={profile.budgetPerYearTenge}
                    onChange={(e) => update({ budgetPerYearTenge: Number(e.target.value) })}
                    className="w-full"
                    aria-label="Budget"
                  />
                  <div className="mt-1 flex justify-between text-xs text-ink/40">
                    <span>{formatTenge(MIN_BUDGET, lang)}</span>
                    <span>{formatTenge(MAX_BUDGET, lang)}</span>
                  </div>
                </>
              )}
              <button
                type="button"
                onClick={() => update({ budgetAny: !profile.budgetAny })}
                aria-pressed={profile.budgetAny}
                className={`chip mt-3 ${profile.budgetAny ? "chip-on" : "chip-off"}`}
              >
                {profile.budgetAny ? "✓ " : "♢ "}
                {lang === "en"
                  ? "Budget is not a constraint / aiming for a grant"
                  : lang === "kk"
                    ? "Бюджет шектеу емес / грантқа үміттенемін"
                    : "Бюджет не важен / нацелен на грант"}
              </button>
            </div>
            <div>
              <span className="label">
                {lang === "en" ? "Need a dormitory?" : lang === "kk" ? "Жатақхана керек пе?" : "Нужно общежитие?"}
              </span>
              <div className="flex gap-2">
                {[
                  { v: true, label: lang === "en" ? "Yes" : lang === "kk" ? "Иә" : "Да" },
                  { v: false, label: lang === "en" ? "No" : lang === "kk" ? "Жоқ" : "Нет" },
                ].map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => update({ needsDorm: o.v })}
                    className={`chip ${profile.needsDorm === o.v ? "chip-on" : "chip-off"}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="label">
                {lang === "en" ? "Study language" : lang === "kk" ? "Оқу тілі" : "Язык обучения"}
              </span>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => update({ studyLanguage: l.id })}
                    className={`chip ${profile.studyLanguage === l.id ? "chip-on" : "chip-off"}`}
                  >
                    {l.label[lang]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="label">
                {lang === "en" ? "Geography" : lang === "kk" ? "География" : "География"}
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "kz", label: { ru: "Только Казахстан", kk: "Тек Қазақстан", en: "Kazakhstan only" } },
                  { id: "kz+abroad", label: { ru: "Казахстан + за рубеж", kk: "Қазақстан + шетел", en: "Kazakhstan + abroad" } },
                ].map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => update({ countries: o.id as "kz" | "kz+abroad" })}
                    className={`chip ${profile.countries === o.id ? "chip-on" : "chip-off"}`}
                  >
                    {o.label[lang]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- Шаг 4: Экзамены (со слайдерами IELTS/SAT) --- */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <span className="label">
                {lang === "en" ? "Which exams are you taking?" : lang === "kk" ? "Қай емтихандарды тапсырасыз?" : "Какие экзамены планируете сдавать?"}
              </span>
              <div className="flex flex-wrap gap-2">
                {EXAMS.map((e) => {
                  const on = profile.plannedExams.includes(e.id);
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => toggleExam(e.id)}
                      title={e.hint[lang]}
                      className={`chip ${on ? "chip-on" : "chip-off"}`}
                    >
                      {e.label[lang]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ЕНТ */}
            {profile.plannedExams.includes("ent") && (
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="label !mb-0">
                    {lang === "en" ? "ENT score estimate (50–140)" : lang === "kk" ? "ЖБТ бал болжамы (50–140)" : "Прогноз балла ЕНТ (50–140)"}
                  </span>
                  <span className="font-bold text-pine">{profile.entEstimate ?? "—"}</span>
                </div>
                <input
                  type="range"
                  min={MIN_ENT}
                  max={MAX_ENT}
                  step={1}
                  value={profile.entEstimate ?? 90}
                  onChange={(e) => {
                    update({ entEstimate: Number(e.target.value) });
                    setTouched(false);
                  }}
                  className="w-full"
                  aria-label="ENT estimate"
                />
                <p className="muted mt-1 text-xs">{EXAM_SCORE_HINTS.ent[lang]}</p>
              </div>
            )}

            {/* IELTS */}
            {profile.plannedExams.includes("ielts") && (
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="label !mb-0">
                    {lang === "en" ? "IELTS band" : lang === "kk" ? "IELTS балы" : "Балл IELTS"}
                  </span>
                  <span className="font-bold text-pine">
                    {profile.ieltsEstimate ? profile.ieltsEstimate.toFixed(1) : "—"}
                  </span>
                </div>
                <input
                  type="range"
                  min={MIN_IELTS}
                  max={MAX_IELTS}
                  step={STEP_IELTS}
                  value={profile.ieltsEstimate ?? 6.5}
                  onChange={(e) => update({ ieltsEstimate: Number(e.target.value) })}
                  className="w-full"
                  aria-label="IELTS band"
                />
                <p className="muted mt-1 text-xs">{EXAM_SCORE_HINTS.ielts[lang]}</p>
              </div>
            )}

            {/* SAT */}
            {profile.plannedExams.includes("sat") && (
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="label !mb-0">SAT</span>
                  <span className="font-bold text-pine">{profile.satEstimate ?? "—"}</span>
                </div>
                <input
                  type="range"
                  min={MIN_SAT}
                  max={MAX_SAT}
                  step={STEP_SAT}
                  value={profile.satEstimate ?? 1200}
                  onChange={(e) => update({ satEstimate: Number(e.target.value) })}
                  className="w-full"
                  aria-label="SAT score"
                />
                <p className="muted mt-1 text-xs">{EXAM_SCORE_HINTS.sat[lang]}</p>
              </div>
            )}
          </div>
        )}

        {/* --- Шаг 5: Приоритеты --- */}
        {step === 5 && (
          <div>
            <span className="label">
              {lang === "en"
                ? "Rank what matters most (top = most important)"
                : lang === "kk"
                  ? "Не маңызды екенін реттеңіз (жоғарыда — маңыздырақ)"
                  : "Расставьте приоритеты (сверху — важнее)"}
            </span>
            <ol className="space-y-2">
              {priority.map((id, idx) => {
                const p = PRIORITIES.find((x) => x.id === id)!;
                return (
                  <li
                    key={id}
                    className="card flex items-center justify-between gap-3 p-3"
                    style={{ outlineColor: `color-mix(in srgb, var(--color-pine) ${20 - idx * 4}%, transparent)` }}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pine/10 text-xs font-bold text-pine">
                        {idx + 1}
                      </span>
                      {p.emoji} {p.label[lang]}
                    </span>
                    <span className="flex gap-1">
                      <button
                        type="button"
                        aria-label="up"
                        disabled={idx === 0}
                        onClick={() => movePriority(id, -1)}
                        className="btn btn-ghost !px-2 !py-1 text-xs disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        aria-label="down"
                        disabled={idx === priority.length - 1}
                        onClick={() => movePriority(id, 1)}
                        className="btn btn-ghost !px-2 !py-1 text-xs disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="muted mt-3 text-xs">
              {lang === "en"
                ? "This reorders recommendations: cost affects fit up to +10, proximity +6, program strength +6, dorm +2."
                : lang === "kk"
                  ? "Бұл ұсыныстардың ретін өзгертеді: құн +10, жақындық +6, бағдарлама күші +6, жатақхана +2."
                  : "Это меняет порядок рекомендаций: стоимость до +10, близость +6, сила программы +6, общежитие +2."}
            </p>
          </div>
        )}

        {/* --- Шаг 6: Проверка --- */}
        {step === 6 && (
          <div>
            <h2 className="font-bold text-ink">{t.reviewTitle}</h2>
            <p className="muted mt-1 text-sm">{t.reviewD}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {[
                [t.reviewGrade, `${profile.grade}`],
                [t.reviewCity, CITY_L[profile.city][lang]],
                [
                  t.reviewInterests,
                  profile.interests
                    .map((s) => SUBJECT_L[s][lang])
                    .join(", ") || "—",
                ],
                [
                  lang === "en" ? "Desired majors" : lang === "kk" ? "Қалаған мамандықтар" : "Желаемые специальности",
                  profile.desiredMajors?.map((m) => MAJOR_L[m][lang]).join(", ") || "—",
                ],
                [
                  t.reviewBudget,
                  profile.budgetAny
                    ? lang === "en"
                      ? "Not limited"
                      : lang === "kk"
                        ? "Шектеусіз"
                        : "Не ограничен"
                    : formatTenge(profile.budgetPerYearTenge, lang),
                ],
                [t.reviewENT, profile.entEstimate ?? "—"],
                ...(profile.plannedExams.includes("ielts") && profile.ieltsEstimate
                  ? [["IELTS", profile.ieltsEstimate.toFixed(1)] as [string, string]]
                  : []),
                ...(profile.plannedExams.includes("sat") && profile.satEstimate
                  ? [["SAT", String(profile.satEstimate)] as [string, string]]
                  : []),
                [
                  lang === "en" ? "Top priority" : lang === "kk" ? "Басты басымдық" : "Главный приоритет",
                  PRIORITY_TITLES[priority[0]][lang],
                ],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-paper-dark/60 p-3">
                  <dt className="text-xs text-ink/45">{k}</dt>
                  <dd className="font-bold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      {/* Навигация анкеты */}
      <div className="sticky bottom-4 mt-6 flex items-center justify-between gap-3 rounded-2xl bg-white/95 p-3 shadow-lg ring-1 ring-ink/10 backdrop-blur">
        <button type="button" onClick={back} disabled={step === 0} className="btn btn-ghost">
          ← {t.back}
        </button>
        {step < 6 ? (
          <button type="button" onClick={next} className="btn btn-primary flex-1 sm:flex-none">
            {t.next} →
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            disabled={!canFinish}
            title={canFinish ? undefined : lang === "en" ? "Specify interests and ENT estimate" : lang === "kk" ? "Қызығушылық пен ЖБТ болжамын көрсетіңіз" : "Укажите интересы и прогноз ЕНТ"}
            className="btn btn-accent flex-1 sm:flex-none"
          >
            {t.showRecs2} →
          </button>
        )}
      </div>
    </JourneyLayout>
  );
}

/** Эмодзи предметов (локально, чтобы не тянуть весь SUBJECTS-массив) */
const SUBJECTS_EMOJI: Record<string, string> = {
  math: "➗",
  physics: "🧲",
  cs: "💻",
  chemistry: "⚗️",
  biology: "🧬",
  geography: "🌍",
  history: "🏛️",
  worldHistory: "🌐",
  economics: "📈",
  law: "⚖️",
  kazakh: "📖",
  russian: "✍️",
  english: "🔤",
  german: "🥨",
  french: "🥐",
  art: "🎨",
  pe: "🏃",
};
