import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { GamificationProvider } from "@/i18n/GamificationContext";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { ProfileProvider } from "@/context/ProfileContext";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://qadam.edu.kz"),
  title: "Qadam — твой шаг к университету",
  description:
    "Ответьте на несколько вопросов и получите персональный маршрут поступления: куда поступать, почему подходит и что делать следующим шагом. Қазақша, русский, English.",
};

export const viewport: Viewport = {
  themeColor: "#274943",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <GamificationProvider>
            <ProfileProvider>{children}</ProfileProvider>
          </GamificationProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
