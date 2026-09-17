/**
 * LogoMark — фирменный знак Qadam.
 * Символ: раскрытая книга, из которой поднимается лестница-путь («қадам» = шаг).
 * Инлайн-SVG: масштабируется, красится в бренд-цвета, без бинарных ассетов.
 */

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="Qadam logo"
      className={className}
      fill="none"
    >
      {/* Скруглённый квадрат-подложка */}
      <rect width="48" height="48" rx="12" fill="#274943" />

      {/* Раскрытая книга (страницы) */}
      <path
        d="M10 34c4.5-2.2 9-2.2 13.5 0V17c-4.5-2.2-9-2.2-13.5 0v17Z"
        fill="#f5f1e8"
        fillOpacity="0.28"
      />
      <path
        d="M38 34c-4.5-2.2-9-2.2-13.5 0V17c4.5-2.2 9-2.2 13.5 0v17Z"
        fill="#f5f1e8"
        fillOpacity="0.16"
      />
      {/* Корешок */}
      <path d="M23.5 16.5v18" stroke="#f5f1e8" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" />

      {/* Лестница-шаги, восходящая над книгой */}
      <path
        d="M14 30h5.5v-4.5H25V21h5.5v-4.5H36"
        stroke="#b0592f"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
