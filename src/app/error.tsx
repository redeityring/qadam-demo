"use client";

/**
 * Границы ошибок маршрута.
 *
 * Зачем: если в клиентском компоненте что-то падает, без этого файла Next
 * покажет пустой экран, и интерфейс выглядит «мёртвым» — кнопки не работают,
 * потому что React не смонтировал дерево. Здесь мы всегда даём пользователю
 * понятный выход: перезагрузка сегмента и возврат к анкете.
 */

import Link from "next/link";
import { useEffect } from "react";
import { useLang } from "@/i18n/LanguageContext";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const { t } = useLang();

  useEffect(() => {
    // В консоль — для отладки на защите; пользователю показываем человеческий текст
    console.error("[Qadam] Client error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center px-4 py-10">
      <div className="card p-6 text-center">
        <p className="text-3xl">🧭</p>
        <h1 className="section-title mt-2">{t.errorTitle}</h1>
        <p className="muted mt-2">{t.errorText}</p>
        {error.digest && (
          <p className="mt-1 text-[11px] text-ink/35">
            {t.errorCode}: {error.digest}
          </p>
        )}
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <button type="button" onClick={() => retry()} className="btn btn-primary">
            {t.errorRetry}
          </button>
          <Link href="/profile" className="btn btn-secondary">
            {t.recalcHint}
          </Link>
        </div>
      </div>
    </div>
  );
}
