import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Проект лежит внутри более крупной папки с чужим package-lock.json —
  // ограничиваем корень Turbopack этой папкой проекта.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
