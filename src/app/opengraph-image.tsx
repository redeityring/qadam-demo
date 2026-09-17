import { ImageResponse } from "next/og";

/**
 * OpenGraph-картинка: «разные шаги — один маршрут».
 * Тёплая бумага, хвойный зелёный, глина — фирменная система Qadam.
 */
export const alt = "Qadam — персональный маршрут поступления";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function Steps({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        alignItems: "flex-end",
        gap: 14 * scale,
      }}
    >
      {[28, 44, 60, 76].map((h, i) => (
        <div
          key={h}
          style={{
            width: 34 * scale,
            height: h * scale,
            borderRadius: 8 * scale,
            background: i === 3 ? "#b0592f" : "#274943",
            opacity: 0.35 + i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f5f1e8",
          padding: 64,
          position: "relative",
        }}
      >
        {/* Шапка */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "#274943",
              color: "#f5f1e8",
              fontSize: 30,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Q
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#22251f", display: "flex" }}>
            Qadam
          </div>
        </div>

        {/* Центральный блок */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.05,
              fontWeight: 800,
              color: "#22251f",
              display: "flex",
              maxWidth: 950,
            }}
          >
            Твой путь в университет — за 3 минуты
          </div>
          <div style={{ fontSize: 26, color: "#5c6157", display: "flex" }}>
            Куда поступать · почему подходит · что делать следующим шагом
          </div>
        </div>

        {/* Лестница шагов */}
        <Steps x={64} y={430} scale={2.4} />

        {/* Мелкая подпись */}
        <div style={{ fontSize: 20, color: "#8a8d84", display: "flex" }}>
          Қазақша · Русский · English — LOCUS Startup Hackathon 2026
        </div>
      </div>
    ),
    size,
  );
}
