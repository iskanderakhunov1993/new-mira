"use client";

import { Check, ChevronRight, Download, X } from "lucide-react";
import { useEffect, useState } from "react";

type InstallState = "available" | "instructions" | "installed" | null;

function runsStandalone() {
  if (typeof window === "undefined") return false;
  const iosNavigator = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || iosNavigator.standalone === true;
}

function installInstructions() {
  if (typeof navigator === "undefined") return "Откройте меню браузера и выберите «Установить приложение».";
  const agent = navigator.userAgent.toLowerCase();
  if (agent.includes("iphone") || agent.includes("ipad")) return "Нажмите «Поделиться», затем «На экран Домой».";
  if (agent.includes("safari") && !agent.includes("chrome")) return "В Safari откройте меню «Файл» и выберите «Добавить в Dock».";
  return "Нажмите значок установки в адресной строке или откройте меню браузера и выберите «Установить Mira».";
}

export function PwaInstallAction() {
  const [state, setState] = useState<InstallState>(null);

  useEffect(() => {
    const syncState = () => setState(runsStandalone() ? "installed" : window.__miraInstallPrompt ? "available" : null);
    const installed = () => setState("installed");
    syncState();
    window.addEventListener("mira:pwa-install-ready", syncState);
    window.addEventListener("mira:pwa-installed", installed);
    return () => {
      window.removeEventListener("mira:pwa-install-ready", syncState);
      window.removeEventListener("mira:pwa-installed", installed);
    };
  }, []);

  async function install() {
    if (runsStandalone() || state === "installed") {
      setState("installed");
      return;
    }

    const prompt = window.__miraInstallPrompt;
    if (!prompt) {
      setState((current) => current === "instructions" ? null : "instructions");
      return;
    }

    await prompt.prompt();
    const choice = await prompt.userChoice;
    delete window.__miraInstallPrompt;
    setState(choice.outcome === "accepted" ? "installed" : "instructions");
  }

  const isOpen = state === "instructions" || state === "installed";
  return <>
    <button type="button" aria-expanded={isOpen} onClick={() => void install()}>
      <i>{state === "installed" ? <Check /> : <Download />}</i>
      <span><strong>{state === "installed" ? "Mira установлена" : "Установить Mira"}</strong><small>{state === "installed" ? "Открывается как отдельное приложение" : "Добавить приложение на рабочий стол"}</small></span>
      <ChevronRight />
    </button>
    {isOpen && <aside className="profile-support-panel profile-install-panel" aria-live="polite">
      <button type="button" className="profile-support-close" aria-label="Закрыть" onClick={() => setState(null)}><X /></button>
      {state === "installed" ? <><strong>Mira уже установлена</strong><p>Приложение можно запускать с рабочего стола, из Dock или меню приложений.</p></> : <><strong>Установка через браузер</strong><p>{installInstructions()}</p><small>После установки Mira откроется в отдельном окне. Все данные по-прежнему сохраняются в вашем защищённом аккаунте.</small></>}
    </aside>}
  </>;
}
