"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, HeartPulse, MoonStar, ShieldCheck } from "lucide-react";
import { getProfile, saveProfile } from "@/lib/demo-session";

const goals = [
  ["cycle", "Понимать свой цикл", "Даты, фазы и регулярность"],
  ["symptoms", "Следить за самочувствием", "Симптомы, боль и настроение"],
  ["doctor", "Подготовить данные для врача", "Понятная история наблюдений"],
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [goal, setGoal] = useState("cycle");
  const [healthConsent, setHealthConsent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void getProfile().then((profile) => {
      if (!profile?.email) router.replace("/register");
      if (profile?.name) setName(profile.name);
      setHealthConsent(profile?.consents?.healthData ?? false);
    }).catch(() => router.replace("/login"));
  }, [router]);

  async function next(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (step === 1 && name.trim().length < 2) return setError("Расскажите, как к вам обращаться");
    if (step === 2 && !lastPeriod) return setError("Выберите первый день последних месячных");
    if (step < 3) return setStep(step + 1);
    if (!healthConsent) return setError("Подтвердите согласие на хранение данных здоровья");
    try {
      await saveProfile({ name: name.trim(), lastPeriod, cycleLength, periodLength, goal, onboardingComplete: true, consents: { healthData: true, privacyPolicy: true } });
      router.push("/today");
    } catch {
      setError("Не удалось сохранить данные. Проверьте соединение и повторите попытку.");
    }
  }

  return (
    <main className="onboarding-page">
      <header className="onboarding-header">
        <Link className="logo" href="/"><span className="logo-mark"><MoonStar /></span><span>Mira</span></Link>
        <span className="onboarding-safe"><ShieldCheck /> Данные защищены вашим аккаунтом</span>
      </header>
      <div className="onboarding-progress"><span style={{ width: `${step / 3 * 100}%` }} /></div>
      <section className="onboarding-card">
        <div className="step-count">Шаг {step} из 3</div>
        <form onSubmit={next}>
          {step === 1 && <div className="onboarding-step">
            <span className="step-icon"><HeartPulse /></span>
            <h1>Давайте познакомимся</h1>
            <p>Mira будет обращаться к вам по имени. Остальное можно настроить позже.</p>
            <label className="large-field"><span>Как вас зовут?</span><input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="Ваше имя" maxLength={40} /></label>
          </div>}
          {step === 2 && <div className="onboarding-step">
            <span className="step-icon"><CalendarDays /></span>
            <h1>Расскажите о цикле</h1>
            <p>Эти данные нужны только для первого ориентировочного прогноза.</p>
            <label className="large-field"><span>Первый день последних месячных</span><input type="date" value={lastPeriod} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setLastPeriod(e.target.value)} /></label>
            <div className="number-fields">
              <label><span>Обычная длина цикла</span><div><button type="button" onClick={() => setCycleLength(Math.max(15, cycleLength - 1))}>−</button><strong>{cycleLength}<small> дней</small></strong><button type="button" onClick={() => setCycleLength(Math.min(60, cycleLength + 1))}>+</button></div></label>
              <label><span>Месячные обычно идут</span><div><button type="button" onClick={() => setPeriodLength(Math.max(1, periodLength - 1))}>−</button><strong>{periodLength}<small> дней</small></strong><button type="button" onClick={() => setPeriodLength(Math.min(14, periodLength + 1))}>+</button></div></label>
            </div>
            <p className="estimate-note">Не помните точно? Оставьте средние значения — их можно изменить позже.</p>
          </div>}
          {step === 3 && <div className="onboarding-step">
            <span className="step-icon"><Check /></span>
            <h1>Что сейчас важнее?</h1>
            <p>Мы настроим первый экран под вашу главную задачу.</p>
            <div className="goal-list">{goals.map(([value, title, description]) => <button className={goal === value ? "selected" : ""} type="button" onClick={() => setGoal(value)} key={value}><span className="goal-radio"><i /></span><span><strong>{title}</strong><small>{description}</small></span></button>)}</div>
            <label className="consent"><input type="checkbox" checked={healthConsent} onChange={(event) => setHealthConsent(event.target.checked)} /><span className="custom-check"><Check /></span><span>Я согласна хранить мои данные о цикле и самочувствии в защищённой базе Mira</span></label>
          </div>}
          {error && <p className="form-error onboarding-error" role="alert">{error}</p>}
          <div className="onboarding-actions">{step > 1 && <button className="back-button" type="button" onClick={() => setStep(step - 1)}><ArrowLeft /> Назад</button>}<button className="button" type="submit">{step === 3 ? "Открыть Mira" : "Продолжить"}<ArrowRight /></button></div>
        </form>
      </section>
      <p className="onboarding-footnote">Mira не ставит диагнозы и не заменяет консультацию врача.</p>
    </main>
  );
}
