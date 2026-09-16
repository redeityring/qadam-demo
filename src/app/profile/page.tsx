"use client";

/**
 * Этап 2 кейса: Профиль. Пошаговая анкета (5 шагов) с валидацией.
 * Mobile-first: радиокнопки-карточки, чипы интересов, слайдеры бюджета и ЕНТ.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { JourneyLayout } from "@/components/JourneyLayout";
import { useProfile } from "@/context/ProfileContext";
import {
  BUDGET_STEP,
  CITIES,
  EXAMS,
  formatTenge,
  LANGUAGES,
  MAX_BUDGET,
  MAX_ENT,
  MIN_BUDGET,
  MIN_ENT,
  SUBJECTS,
} from "@/lib/constants";

type SubStep = 0 | 1 | 2 | 3 | 4;

const SUBSTEPS = ["О вас", "Интересы", "Успеваемость", "Бюджет и формат", "Экзамены"];

export default function ProfilePage() {
  const router = useRouter();
  const { profile, update, toggleInterest, setStrength, toggleExam } = useProfile();
  const [step, setStep] = useState<SubStep>(0);
  const [touched, setTouched] = useState(false);

  const interestsError = touched && profile.interests.length === 0;
  const canFinish = profile.interests.length > 0 && profile.entEstimate !== null;

  const progress = useMemo(() => (step / (SUBSTEPS.length - 1)) * 100, [step]);

  function next() {
    if (step === 1 && profile.interests.length === 0) {
      setTouched(true);
      return;
    }
    setTouched(false);
    setStep((s) => Math.min(s + 1, SUBSTEPS.length - 1) as SubStep);
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

  return (
    <JourneyLayout>
      <div className="mb-6">
        <h1 className="section-title">Анкета абитуриента</h1>
        <p className="muted mt-1">
          Шаг {step + 1} из {SUBSTEPS.length}: {SUBSTEPS[step]}
        </p>
      </div>

      {/* Прогресс подшагов анкеты */}
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all"
          style={{ width: `${Math.max(8, progress)}%` }}
        />
      </div>

      <div className="card p-5 sm:p-6">
        {/* --- Шаг 0: О вас --- */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <span className="label">В каком классе вы учитесь?</span>
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
                    {g} класс
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="label">Ваш город</span>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => update({ city: c.id })}
                    className={`chip ${profile.city === c.id ? "chip-on" : "chip-off"}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- Шаг 1: Интересы --- */}
        {step === 1 && (
          <div>
            <span className="label">Какие предметы вам нравятся? (1–4)</span>
            {interestsError && (
              <p className="field-error mb-2">Выберите хотя бы один предмет, чтобы продолжить.</p>
            )}
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => {
                const on = profile.interests.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleInterest(s.id)}
                    aria-pressed={on}
                    className={`chip ${on ? "chip-on" : "chip-off"}`}
                  >
                    {s.emoji} {s.label}
                  </button>
                );
              })}
            </div>
            <p className="muted mt-3">Выбрано: {profile.interests.length} из 4</p>
          </div>
        )}

        {/* --- Шаг 2: Успеваемость --- */}
        {step === 2 && (
          <div className="space-y-5">
            <span className="label">Оцените свои силы по выбранным предметам</span>
            {profile.interests.map((id) => {
              const subject = SUBJECTS.find((s) => s.id === id)!;
              const value = profile.strengths[id] ?? 3;
              return (
                <div key={id}>
                  <div className="mb-1 flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>
                      {subject.emoji} {subject.label}
                    </span>
                    <span className="text-indigo-600">{value}/5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={value}
                    onChange={(e) => setStrength(id, Number(e.target.value))}
                    className="w-full accent-indigo-600"
                    aria-label={`Успеваемость по предмету ${subject.label}`}
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
                <span className="label !mb-0">Бюджет на обучение (в год)</span>
                <span className="font-bold text-indigo-600">
                  {formatTenge(profile.budgetPerYearTenge)}
                </span>
              </div>
              <input
                type="range"
                min={MIN_BUDGET}
                max={MAX_BUDGET}
                step={BUDGET_STEP}
                value={profile.budgetPerYearTenge}
                onChange={(e) => update({ budgetPerYearTenge: Number(e.target.value) })}
                className="w-full accent-indigo-600"
                aria-label="Бюджет на обучение в год, тенге"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>{formatTenge(MIN_BUDGET)}</span>
                <span>{formatTenge(MAX_BUDGET)}</span>
              </div>
            </div>
            <div>
              <span className="label">Нужно общежитие?</span>
              <div className="flex gap-2">
                {[
                  { v: true, label: "Да" },
                  { v: false, label: "Нет" },
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
              <span className="label">Язык обучения</span>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => update({ studyLanguage: l.id })}
                    className={`chip ${profile.studyLanguage === l.id ? "chip-on" : "chip-off"}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="label">География</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "kz", label: "Только Казахстан" },
                  { id: "kz+abroad", label: "Казахстан + за рубеж" },
                ].map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => update({ countries: o.id as "kz" | "kz+abroad" })}
                    className={`chip ${profile.countries === o.id ? "chip-on" : "chip-off"}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- Шаг 4: Экзамены --- */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <span className="label">Какие экзамены планируете сдавать?</span>
              <div className="flex flex-wrap gap-2">
                {EXAMS.map((e) => {
                  const on = profile.plannedExams.includes(e.id);
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => toggleExam(e.id)}
                      className={`chip ${on ? "chip-on" : "chip-off"}`}
                    >
                      {e.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="label !mb-0">Прогноз балла ЕНТ (50–140)</span>
                <span className="font-bold text-indigo-600">{profile.entEstimate ?? "—"}</span>
              </div>
              <input
                type="range"
                min={MIN_ENT}
                max={MAX_ENT}
                step={1}
                value={profile.entEstimate ?? 90}
                onChange={(e) => update({ entEstimate: Number(e.target.value) })}
                className="w-full accent-indigo-600"
                aria-label="Прогноз балла ЕНТ"
              />
              <p className="muted mt-1 text-xs">
                Не знаете свой балл? Двигайте ползунок до примерной оценки — её можно изменить в
                любой момент.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Навигация анкеты */}
      <div className="sticky bottom-4 mt-6 flex items-center justify-between gap-3 rounded-2xl bg-white/95 p-3 shadow-lg ring-1 ring-slate-200 backdrop-blur">
        <button type="button" onClick={back} disabled={step === 0} className="btn btn-ghost">
          ← Назад
        </button>
        {step < SUBSTEPS.length - 1 ? (
          <button type="button" onClick={next} className="btn btn-primary flex-1 sm:flex-none">
            Далее →
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            disabled={!canFinish}
            title={canFinish ? undefined : "Укажите интересы и прогноз ЕНТ"}
            className="btn btn-accent flex-1 sm:flex-none"
          >
            Показать мои рекомендации →
          </button>
        )}
      </div>
    </JourneyLayout>
  );
}
