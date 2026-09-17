"use client";

/**
 * Избранное — сохранённые программы. Чистая проекция профиля.
 */

import Link from "next/link";
import { useMemo } from "react";
import { JourneyLayout } from "@/components/JourneyLayout";
import { useProfile } from "@/context/ProfileContext";
import { useLang } from "@/i18n/LanguageContext";
import { SUBJECT_L } from "@/i18n/engine";
import { formatTenge } from "@/lib/constants";
import { getUniversity, PROGRAMS } from "@/lib/data";

export default function FavoritesPage() {
  const { profile, update } = useProfile();
  const { lang, t } = useLang();

  const favIds = useMemo(() => profile.favoriteIds ?? [], [profile.favoriteIds]);
  const favs = useMemo(
    () => PROGRAMS.filter((p) => favIds.includes(p.id)),
    [favIds],
  );

  function remove(id: string) {
    update({ favoriteIds: favIds.filter((f) => f !== id) });
  }

  return (
    <JourneyLayout>
      <div className="anim-rise mb-4">
        <h1 className="section-title">★ {t.favTitle}</h1>
        <p className="muted mt-1">
          {favIds.length} {t.favCount}
        </p>
      </div>

      {favs.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-3xl">☆</p>
          <p className="muted mt-2">{t.favEmpty}</p>
          <Link href="/results" className="btn btn-primary mt-4">
            ← {t.backToRecs}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {favs.map((p) => {
            const uni = getUniversity(p.universityId);
            return (
              <div key={p.id} className="card flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-bold text-ink">{p.title}</p>
                  <p className="muted text-xs">
                    {uni.shortName ?? uni.name} · {formatTenge(p.tuitionPerYearTenge, lang)} ·{" "}
                    {p.entrySubjects.map((s) => SUBJECT_L[s][lang]).join(" + ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="btn btn-ghost !px-3 !py-2 text-xs"
                  aria-label={t.favBtnOn}
                >
                  ✕
                </button>
              </div>
            );
          })}
          <div className="mt-4 flex justify-between">
            <Link href="/results" className="btn btn-secondary">
              ← {t.backToRecs}
            </Link>
            <Link href="/compare" className="btn btn-primary">
              {t.toCompare} →
            </Link>
          </div>
        </div>
      )}
    </JourneyLayout>
  );
}
