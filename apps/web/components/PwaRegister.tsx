"use client";

import { useEffect } from "react";

export type PwaInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Window {
    __miraInstallPrompt?: PwaInstallPrompt;
  }
}

export function PwaRegister() {
  useEffect(() => {
    const rememberInstallPrompt = (event: Event) => {
      event.preventDefault();
      window.__miraInstallPrompt = event as PwaInstallPrompt;
      window.dispatchEvent(new Event("mira:pwa-install-ready"));
    };
    const markInstalled = () => {
      delete window.__miraInstallPrompt;
      window.dispatchEvent(new Event("mira:pwa-installed"));
    };

    window.addEventListener("beforeinstallprompt", rememberInstallPrompt);
    window.addEventListener("appinstalled", markInstalled);

    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", rememberInstallPrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);
  return null;
}
