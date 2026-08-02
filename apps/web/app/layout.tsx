import type { Metadata, Viewport } from "next";
import { Manrope, Onest } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";
import { AuthSessionRestorer } from "@/components/AuthSessionRestorer";
import { TelegramRuntime } from "@/components/TelegramRuntime";

const manrope = Manrope({ subsets: ["cyrillic", "latin"], variable: "--font-manrope" });
const onest = Onest({ subsets: ["cyrillic", "latin"], variable: "--font-onest" });

export const metadata: Metadata = {
  title: "Mira — трекер цикла без тревоги",
  description: "Полностью бесплатная Mira помогает отмечать цикл и самочувствие, замечать осторожные повторения и управлять своими данными.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Mira" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fbf8fc" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Served through Mira because some Telegram Desktop networks block telegram.org inside WebView. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/telegram-sdk.js" />
      </head>
      <body className={`${manrope.variable} ${onest.variable}`}>
        <PwaRegister /><AuthSessionRestorer /><TelegramRuntime />{children}
      </body>
    </html>
  );
}
