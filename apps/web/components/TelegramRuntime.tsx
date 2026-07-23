"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
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
      webApp.setHeaderColor?.("#eefafa");
      webApp.setBackgroundColor?.("#eefafa");
      webApp.expand();
      webApp.ready();
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
