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
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js?61";
    script.async = true;
    script.onload = activate;
    document.head.appendChild(script);
    return () => script.remove();
  }, []);
  return null;
}
