import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Проект лежит внутри более крупной папки с чужими package-lock.json и проектами.
  // Next по умолчанию поднимается вверх по дереву в поисках «корня workspace» —
  // и тогда часть клиентских чанков отдаётся по неверным путям: страница
  // отрисовывается, но React не гидрируется, поэтому кнопки «не работают».
  //
  // turbopack.root чинит это для Turbopack (режим по умолчанию),
  // outputFileTracingRoot — та же граница для webpack (next dev/build --webpack).
  // Обе настройки должны быть заданы, иначе поведение зависит от бандлера.
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
