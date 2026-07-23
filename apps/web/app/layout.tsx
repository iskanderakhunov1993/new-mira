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

const telegramBootstrap = `
(() => {
  const params = new URLSearchParams(window.location.search);
  const rawHash = window.location.hash.replace(/^#/, "");
  const hashQuery = rawHash.includes("?") ? rawHash.slice(rawHash.indexOf("?") + 1) : rawHash;
  const hashParams = new URLSearchParams(hashQuery);
  const initData = params.get("tgWebAppData") || hashParams.get("tgWebAppData") || "";
  const postEvent = (eventType, eventData = "") => {
    if (window.TelegramWebviewProxy?.postEvent) {
      window.TelegramWebviewProxy.postEvent(eventType, JSON.stringify(eventData));
      return;
    }
    if (window.external && "notify" in window.external) {
      window.external.notify(JSON.stringify({ eventType, eventData }));
      return;
    }
    if (window.parent !== window) {
      window.parent.postMessage(JSON.stringify({ eventType, eventData }), "*");
    }
  };
  window.Telegram = window.Telegram || {};
  window.Telegram.WebApp = window.Telegram.WebApp || {
    initData,
    ready: () => postEvent("web_app_ready"),
    expand: () => postEvent("web_app_expand"),
    setHeaderColor: (color) => postEvent("web_app_set_header_color", { color }),
    setBackgroundColor: (color) => postEvent("web_app_set_background_color", { color }),
  };
  window.Telegram.WebApp.ready();
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{ __html: telegramBootstrap }} />
      </head>
      <body className={`${manrope.variable} ${onest.variable}`}>
        <PwaRegister /><AuthSessionRestorer /><TelegramRuntime />{children}
      </body>
    </html>
  );
}
