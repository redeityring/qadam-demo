import { ImageResponse } from "next/og";

/** Favicon: буква Q на хвойном фоне — генерируется на билде */
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
          color: "#f5f1e8",
          fontSize: 40,
          fontWeight: 800,
          fontFamily: "sans-serif",
        }}
      >
        Q
      </div>
    ),
    { width: size, height: size },
  );
}
