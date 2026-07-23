"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type State = "connecting" | "outside" | "consent" | "error";

export default function TelegramPage() {
  const [state, setState] = useState<State>("connecting");
  const [message, setMessage] = useState("Подключаем Mira к вашему Telegram…");
  const [initData, setInitData] = useState("");
  const [termsConsent, setTermsConsent] = useState(false);
  const [healthDataConsent, setHealthDataConsent] = useState(false);

  useEffect(() => {
    let attempts = 0;
    const connect = async () => {
      const initData = window.Telegram?.WebApp.initData;
      if (!initData) {
        attempts += 1;
        if (attempts < 20) return window.setTimeout(connect, 100);
        setState("outside");
        return;
      }
      setInitData(initData);
      await authorize(initData);
    };
    void connect();
  }, []);

  async function authorize(telegramInitData: string, consents?: { termsConsent: true; healthDataConsent: true }) {
      try {
        const response = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData: telegramInitData, ...consents }),
        });
        const result = await response.json() as { error?: string; next?: string; requiresConsent?: boolean };
        if (response.status === 428 && result.requiresConsent) {
          setState("consent");
          return;
        }
        if (!response.ok || !result.next) throw new Error(result.error || "Не удалось войти");
        window.location.replace(result.next);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Не удалось войти");
        setState("error");
      }
  }

  function register() {
    if (!termsConsent || !healthDataConsent) {
      setMessage("Подтвердите оба согласия, чтобы создать профиль.");
      return;
    }
    setState("connecting");
    setMessage("Создаём защищённый профиль…");
    void authorize(initData, { termsConsent: true, healthDataConsent: true });
  }

  return (
    <main className="telegram-entry">
      <div className="telegram-entry-orb" aria-hidden="true" />
      <section>
        <span className="telegram-entry-mark">Mira</span>
        <h1>{state === "outside" ? "Откройте Mira в Telegram" : state === "error" ? "Не получилось подключиться" : state === "consent" ? "Создать профиль" : "Понимай себя"}</h1>
        <p>{state === "outside" ? "Эта страница предназначена для запуска из бота Mira. В обычном браузере продолжайте пользоваться веб-версией." : state === "consent" ? "Почта и пароль не нужны. Подтвердите условия — Telegram станет вашим способом входа." : message}</p>
        {state === "consent" && <div className="telegram-consents">
          <label><input type="checkbox" checked={termsConsent} onChange={(event) => setTermsConsent(event.target.checked)} /><span>Мне исполнилось 18 лет, я принимаю <Link href="/terms" target="_blank">условия</Link> и ознакомилась с <Link href="/privacy" target="_blank">политикой конфиденциальности</Link>.</span></label>
          <label><input type="checkbox" checked={healthDataConsent} onChange={(event) => setHealthDataConsent(event.target.checked)} /><span>Я соглашаюсь на обработку чувствительных данных о цикле и самочувствии для работы Mira.</span></label>
        </div>}
        <div className="telegram-entry-trust"><ShieldCheck /><span>Данные о здоровье не отправляются в чат и остаются в защищённой базе Mira.</span></div>
        {state === "consent" && <button type="button" onClick={register}>Создать профиль через Telegram</button>}
        {state === "outside" && <a href="/today">Открыть веб-версию</a>}
        {state === "error" && <button type="button" onClick={() => window.location.reload()}>Попробовать ещё раз</button>}
      </section>
    </main>
  );
}
