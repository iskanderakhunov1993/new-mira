import type { Metadata, Viewport } from "next";
import { Manrope, Onest } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";

const manrope = Manrope({ subsets: ["cyrillic", "latin"], variable: "--font-manrope" });
const onest = Onest({ subsets: ["cyrillic", "latin"], variable: "--font-onest" });

export const metadata: Metadata = {
  title: "Mira — трекер цикла без тревоги",
  description: "Отмечайте цикл и самочувствие, замечайте закономерности и храните данные приватно.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Mira" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fbf8fc" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className={`${manrope.variable} ${onest.variable}`}><PwaRegister />{children}</body>
    </html>
  );
}
