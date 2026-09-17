import { ImageResponse } from "next/og";

/** Favicon: знак Qadam — раскрытая книга с восходящей лестницей шагов */
export const size = 64;
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#274943",
          borderRadius: 14,
          position: "relative",
        }}
      >
        {/* Лестница-шаги */}
        <div
          style={{
            position: "absolute",
            width: 30,
            height: 15,
            top: 14,
            left: 17,
            background:
              "linear-gradient(to top right, transparent calc(50% - 1.8px), #b0592f calc(50% - 1.8px), #b0592f calc(50% + 1.8px), transparent calc(50% + 1.8px))",
          }}
        />
        {/* Книга — две страницы */}
        <div style={{ position: "absolute", bottom: 12, left: 13, display: "flex", gap: 2 }}>
          <div style={{ width: 17, height: 23, borderRadius: 3, background: "#f5f1e8", opacity: 0.4 }} />
          <div style={{ width: 17, height: 23, borderRadius: 3, background: "#f5f1e8", opacity: 0.22 }} />
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
