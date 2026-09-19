"use client";

/**
 * Глобальная граница ошибок: срабатывает, если падает сам корневой layout
 * (или провайдеры). Должна содержать html/body — здесь нет родительского layout.
 * Три языка перечислены явно: контекст языка в этом случае может быть недоступен.
 */

import { useEffect } from "react";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[Qadam] Global error:", error);
  }, [error]);

  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f4ee",
          color: "#274943",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 520 }}>
          <p style={{ fontSize: 32, margin: 0 }}>🧭</p>
          <h1 style={{ fontSize: 20, margin: "12px 0 8px" }}>
            Что-то сломалось · Бірдеңе сынды · Something broke
          </h1>
          <p style={{ fontSize: 14, opacity: 0.7, margin: 0 }}>
            Перезагрузите страницу. Данные анкеты сохранены в браузере и не потеряются.
            <br />
            Бетті қайта жүктеңіз. Сауалнама деректері браузерде сақталған.
            <br />
            Reload the page. Your questionnaire is stored in the browser and is safe.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 20,
              padding: "10px 18px",
              borderRadius: 12,
              border: "none",
              background: "#274943",
              color: "#f7f4ee",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Перезагрузить · Жаңарту · Reload
          </button>
        </div>
      </body>
    </html>
  );
}
