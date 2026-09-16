import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { ProfileProvider } from "@/context/ProfileContext";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Траектория — персональный маршрут поступления",
  description:
    "Ответьте на несколько вопросов и получите персональный маршрут поступления: куда поступать, почему подходит и что делать следующим шагом.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ProfileProvider>{children}</ProfileProvider>
      </body>
    </html>
  );
}
