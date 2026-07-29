"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        isVersionAtLeast?: (version: string) => boolean;
        ready: () => void;
        expand: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
      };
    };
  }
}

export function TelegramRuntime() {
  useEffect(() => {
    const activate = () => {
      const webApp = window.Telegram?.WebApp;
      if (!webApp) return;
      document.documentElement.dataset.telegramMiniApp = "true";
      // Telegram keeps its native loading screen visible until ready() is called.
      // Call it before optional appearance APIs: older clients can throw on a
      // custom color and must not prevent the app from becoming visible.
      webApp.ready();
      try { webApp.expand(); } catch { /* Unsupported in some desktop clients. */ }
      if (webApp.isVersionAtLeast?.("6.1")) {
        try { webApp.setHeaderColor?.("#eefafa"); } catch { /* Keep Telegram defaults. */ }
        try { webApp.setBackgroundColor?.("#eefafa"); } catch { /* Keep Telegram defaults. */ }
      }
    };
    if (window.Telegram?.WebApp) return activate();
    const timer = window.setInterval(() => {
      if (!window.Telegram?.WebApp) return;
      window.clearInterval(timer);
      activate();
    }, 50);
    const timeout = window.setTimeout(() => window.clearInterval(timer), 5_000);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(timeout);
    };
  }, []);
  return null;
}
