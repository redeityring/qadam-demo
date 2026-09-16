"use client";

/**
 * Этап 5 кейса: Сравнение. Минимум два выбранных варианта по параметрам,
 * важным для пользователя: стоимость, проходной, гранты, предметы, город, язык.
 */

import Link from "next/link";
import { useMemo } from "react";
import { JourneyLayout } from "@/components/JourneyLayout";
import { useProfile } from "@/context/ProfileContext";
import { getRecommendations, scoreProgram } from "@/lib/engine/recommend";
import { formatTenge, SUBJECT_LABEL } from "@/lib/constants";

export default function ComparePage() {
  const { profile, complete, update } = useProfile();

  const recommendations = useMemo(() => getRecommendations(profile, 20), [profile]);

  const selected = useMemo(() => {
    const ids = profile.compareIds ?? [];
    const inResults = recommendations.filter((r) => ids.includes(r.program.id));
    return inResults;
  }, [recommendations, profile.compareIds]);

  // Если пользователь ничего не выбрал — предлагаем топ-2 рекомендации
  function autoSelect() {
    const top2 = recommendations.slice(0, 2).map((r) => r.program.id);
    update({ compareIds: top2 });
  }

  if (!complete) {
    return (
      <JourneyLayout>
        <div className="card p-6 text-center">
          <h1 className="section-title">Сначала заполните профиль</h1>
          <Link href="/profile" className="btn btn-primary mt-4">
            Заполнить анкету →
          </Link>
        </div>
      </JourneyLayout>
    );
  }

  return (
    <JourneyLayout wide>
      <div className="mb-4">
        <h1 className="section-title">Сравнение вариантов</h1>
        <p className="muted mt-1">
          Выберите 2–3 варианта на экране рекомендаций — и сравните их по параметрам, которые важны
          для вас.
        </p>
      </div>

      {selected.length < 2 ? (
        <div className="card p-6 text-center">
          <p className="text-3xl">⚖️</p>
          <h2 className="mt-2 font-bold">Выберите минимум два варианта</h2>
          <p className="muted mt-1">
            Отметьте программы кнопкой «Сравнить» на экране рекомендаций — или сравните два топовых
            варианта автоматически.
          </p>
          <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
            <button type="button" onClick={autoSelect} className="btn btn-primary">
              Сравнить топ-2 автоматически
            </button>
            <Link href="/results" className="btn btn-secondary">
              ← К рекомендациям
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Десктоп: таблица */}
          <div className="card hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="p-4 font-semibold text-slate-400">Параметр</th>
                  {selected.map((r) => (
                    <th key={r.program.id} className="p-4">
                      <p className="font-bold text-slate-900">{r.program.title}</p>
                      <p className="muted text-xs">{r.university.shortName ?? r.university.name}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <Row label="Совместимость с профилем">
                  {selected.map((r) => {
                    const { score } = scoreProgram(profile, r.program);
                    return (
                      <td key={r.program.id} className="p-4">
                        <span
                          className={`badge ${
                            score >= 70
                              ? "bg-emerald-50 text-emerald-700"
                              : score >= 45
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                          }`}
                        >
                          {score}/100
                        </span>
                      </td>
                    );
                  })}
                </Row>
                <Row label="Стоимость в год">
                  {selected.map((r) => (
                    <td key={r.program.id} className="p-4 font-semibold">
                      {formatTenge(r.program.tuitionPerYearTenge)}
                    </td>
                  ))}
                </Row>
                <Row label="Проходной ЕНТ (2025, демо)">
                  {selected.map((r) => (
                    <td key={r.program.id} className="p-4">
                      {r.program.historicalPassingENT ?? "—"}
                      {r.program.historicalPassingENT != null && profile.entEstimate != null && (
                        <span
                          className={`ml-1 text-xs font-semibold ${
                            profile.entEstimate >= r.program.historicalPassingENT
                              ? "text-emerald-600"
                              : "text-red-500"
                          }`}
                        >
                          ({profile.entEstimate >= r.program.historicalPassingENT ? "вы проходите*" : "ниже*"})
                        </span>
                      )}
                    </td>
                  ))}
                </Row>
                <Row label="Грантов в прошлом году (демо)">
                  {selected.map((r) => (
                    <td key={r.program.id} className="p-4">
                      {r.program.grantsCount ?? "—"}
                    </td>
                  ))}
                </Row>
                <Row label="Предметы поступления">
                  {selected.map((r) => (
                    <td key={r.program.id} className="p-4">
                      {r.program.entrySubjects.map((s) => SUBJECT_LABEL[s]).join(" + ")}
                    </td>
                  ))}
                </Row>
                <Row label="Языки обучения">
                  {selected.map((r) => (
                    <td key={r.program.id} className="p-4">
                      {r.program.languages.map((l) => l.toUpperCase()).join(", ")}
                    </td>
                  ))}
                </Row>
                <Row label="Город">
                  {selected.map((r) => (
                    <td key={r.program.id} className="p-4">
                      {r.program.city === "almaty" ? "Алматы" : r.program.city === "astana" ? "Астана" : "—"}
                    </td>
                  ))}
                </Row>
                <Row label="Общежитие">
                  {selected.map((r) => (
                    <td key={r.program.id} className="p-4">
                      {r.program.dorm ? "✓ Есть" : "— нет"}
                    </td>
                  ))}
                </Row>
              </tbody>
            </table>
          </div>

          {/* Мобильный: карточки-столбцы */}
          <div className="grid gap-4 md:hidden">
            {selected.map((r) => {
              const { score } = scoreProgram(profile, r.program);
              return (
                <div key={r.program.id} className="card p-5">
                  <h2 className="font-bold text-slate-900">{r.program.title}</h2>
                  <p className="muted text-xs">{r.university.shortName ?? r.university.name}</p>
                  <dl className="mt-3 space-y-2 text-sm">
                    {[
                      ["Совместимость", `${score}/100`],
                      ["Стоимость/год", formatTenge(r.program.tuitionPerYearTenge)],
                      ["Проходной (демо)", r.program.historicalPassingENT ?? "—"],
                      ["Гранты (демо)", r.program.grantsCount ?? "—"],
                      ["Предметы", r.program.entrySubjects.map((s) => SUBJECT_LABEL[s]).join(" + ")],
                      ["Языки", r.program.languages.map((l) => l.toUpperCase()).join(", ")],
                      ["Общежитие", r.program.dorm ? "есть" : "нет"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                        <dt className="text-slate-400">{k}</dt>
                        <dd className="text-right font-semibold text-slate-900">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <a
                    href={r.university.website}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary mt-3 w-full !py-2 text-xs"
                  >
                    Сайт вуза ↗
                  </a>
                </div>
              );
            })}
          </div>

          <p className="muted mt-4 text-xs">
            * Проходные баллы и количество грантов — демонстрационные данные 2025 года для прототипа.
            Проверяйте актуальные значения на сайтах вузов и entec.gov.kz.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Link href="/results" className="btn btn-secondary">
              ← Рекомендации
            </Link>
            <Link href="/roadmap" className="btn btn-primary">
              Мой план поступления →
            </Link>
          </div>
        </>
      )}
    </JourneyLayout>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td className="p-4 font-semibold text-slate-500">{label}</td>
      {children}
    </tr>
  );
}
