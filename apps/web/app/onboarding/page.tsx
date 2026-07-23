"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, LoaderCircle, MoonStar, Sparkles } from "lucide-react";
import { getProfile, saveProfile, trackProductEvent } from "@/lib/demo-session";
import { calculateCycle } from "@/lib/domain/cycle-engine";

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [lastPeriod, setLastPeriod] = useState("");
  const [dateUnknown, setDateUnknown] = useState(false);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [cyclePattern, setCyclePattern] = useState<"regular" | "irregular" | "unknown">("regular");
  const [goal, setGoal] = useState("understand");
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void getProfile({ refresh: true }).then((profile) => {
      if (!profile?.email) return router.replace("/register");
      if (profile.onboardingComplete) return router.replace("/today");
      setLastPeriod(profile.lastPeriod ?? "");
      setDateUnknown((profile.onboardingStep ?? 1) >= 3 && !profile.lastPeriod);
      setCycleLength(profile.cycleLength ?? 28);
      setPeriodLength(profile.periodLength ?? 5);
      setCyclePattern(profile.cyclePattern ?? "regular");
      setGoal(profile.goal ?? "understand");
      setConsentConfirmed(profile.consents?.healthData === true && profile.consents?.privacyPolicy === true);
      setStep(Math.min(TOTAL_STEPS, Math.max(1, profile.onboardingStep ?? 1)));
      setIsLoading(false);
      if ((profile.onboardingStep ?? 1) === 1) void trackProductEvent("onboarding_started", "/onboarding");
    }).catch(() => router.replace("/login"));
  }, [router]);

  const forecast = useMemo(() => {
    if (!lastPeriod || dateUnknown || cyclePattern !== "regular") return null;
    return calculateCycle({ entries: [], lastPeriod, cycleLength, periodLength, cyclePattern, today: new Date().toISOString().slice(0, 10) });
  }, [cycleLength, cyclePattern, dateUnknown, lastPeriod, periodLength]);

  async function next(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (step === 2 && !lastPeriod && !dateUnknown) return setError("Выберите дату или нажмите «Не помню точно»");
    if (step === 4 && !consentConfirmed) return setError("Подтвердите согласие на обработку данных о цикле и здоровье");

    setIsSaving(true);
    try {
      if (step === 1) {
        await saveProfile({ onboardingStep: 2 });
        void trackProductEvent("onboarding_step_completed", "/onboarding");
        setStep(2);
      } else if (step === 2) {
        await saveProfile({ ...(dateUnknown ? { lastPeriod: undefined } : { lastPeriod }), periodLength, onboardingStep: 3 });
        void trackProductEvent("onboarding_step_completed", "/onboarding");
        setStep(3);
      } else if (step === 3) {
        await saveProfile({ cycleLength, cyclePattern, onboardingStep: 4 });
        void trackProductEvent("onboarding_step_completed", "/onboarding");
        setStep(4);
      } else {
        await saveProfile({
          onboardingComplete: true,
          onboardingStep: 4,
          goal,
          periodLength,
          consents: { healthData: true, privacyPolicy: true },
        });
        void trackProductEvent("onboarding_completed", "/onboarding");
        router.push("/today");
      }
    } catch {
      setError("Не удалось сохранить данные. Проверьте соединение и повторите попытку.");
    } finally {
      setIsSaving(false);
    }
  }

  async function goBack() {
    const previous = Math.max(1, step - 1);
    setError("");
    setStep(previous);
    try { await saveProfile({ onboardingStep: previous }); } catch { /* текущий экран всё равно доступен */ }
  }

  if (isLoading) return <main className="onboarding-page onboarding-loading"><LoaderCircle /><p>Загружаем…</p></main>;

  const formatDate = (date?: string) => date ? new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(`${date}T12:00:00`)) : "—";

  return (
    <main className="onboarding-page onboarding-minimal">
      <header className="onboarding-header"><Link className="logo" href="/"><span className="logo-mark"><MoonStar /></span><span>Mira</span></Link><span className="step-count">{step} из {TOTAL_STEPS}</span></header>
      <div className="onboarding-progress" aria-label={`Шаг ${step} из ${TOTAL_STEPS}`}><span style={{ width: `${step / TOTAL_STEPS * 100}%` }} /></div>

      <section className="onboarding-card">
        <form onSubmit={next}>
          {step === 1 && <div className="onboarding-step onboarding-welcome">
            <span className="welcome-orb"><Sparkles /></span>
            <small>Добро пожаловать в Mira</small>
            <h1>Понимай себя</h1>
            <p>Mira помогает следить за циклом, отмечать самочувствие и замечать личные закономерности.</p>
            <div className="welcome-preview"><span><CalendarDays /></span><div><small>Сегодня</small><strong>Ваш цикл и самочувствие<br />в одном спокойном месте</strong></div></div>
          </div>}

          {step === 2 && <div className="onboarding-step">
            <span className="step-icon"><CalendarDays /></span>
            <h1>Когда начались последние месячные?</h1>
            <p>Выберите первый день.</p>
            <label className={`large-field onboarding-date-field ${dateUnknown ? "field-disabled" : ""}`}><span>Первый день</span><input type="date" value={lastPeriod} disabled={dateUnknown} max={new Date().toISOString().slice(0, 10)} onChange={(event) => { setLastPeriod(event.target.value); setError(""); }} /></label>
            <button className={`unknown-date centered ${dateUnknown ? "selected" : ""}`} type="button" onClick={() => { setDateUnknown((value) => !value); setError(""); }}><span><Check /></span>Не помню точно</button>
            <div className="cycle-length-control compact"><button type="button" aria-label="Уменьшить длительность" onClick={() => setPeriodLength(Math.max(1, periodLength - 1))}>−</button><strong>{periodLength}<span>дней обычно</span></strong><button type="button" aria-label="Увеличить длительность" onClick={() => setPeriodLength(Math.min(14, periodLength + 1))}>+</button></div>
          </div>}

          {step === 3 && <div className="onboarding-step">
            <span className="step-icon"><CalendarDays /></span>
            <h1>Сколько дней обычно длится цикл?</h1>
            <p>Количество дней от начала одних месячных до начала следующих.</p>
            <div className="cycle-length-control"><button type="button" aria-label="Уменьшить" onClick={() => { setCycleLength(Math.max(15, cycleLength - 1)); setCyclePattern("regular"); }}>−</button><strong>{cycleLength}<span>дней</span></strong><button type="button" aria-label="Увеличить" onClick={() => { setCycleLength(Math.min(60, cycleLength + 1)); setCyclePattern("regular"); }}>+</button></div>
            <div className="cycle-pattern-options"><button className={cyclePattern === "irregular" ? "selected" : ""} type="button" onClick={() => setCyclePattern("irregular")}><span><Check /></span>Цикл нерегулярный</button><button className={cyclePattern === "unknown" ? "selected" : ""} type="button" onClick={() => setCyclePattern("unknown")}><span><Check /></span>Не знаю</button></div>
          </div>}

          {step === 4 && <div className="onboarding-step onboarding-ready">
            <span className="ready-check"><Check /></span>
            <small>Последний шаг</small>
            <h1>Что для вас важнее сейчас?</h1>
            <div className="cycle-pattern-options goal-options"><button className={goal === "understand" ? "selected" : ""} type="button" onClick={() => setGoal("understand")}><span><Check /></span>Понимать свой цикл</button><button className={goal === "wellbeing" ? "selected" : ""} type="button" onClick={() => setGoal("wellbeing")}><span><Check /></span>Следить за самочувствием</button><button className={goal === "pms" ? "selected" : ""} type="button" onClick={() => setGoal("pms")}><span><Check /></span>Наблюдать ПМС</button></div>
            {forecast ? <div className="forecast-result"><p>Сегодня примерно <strong>{forecast.cycleDay}-й день цикла</strong>.</p><p>Ориентировочный диапазон: <strong>{formatDate(forecast.rangeStart)} — {formatDate(forecast.rangeEnd)}</strong>.</p></div> : <div className="forecast-result"><p>Первый прогноз появится после отметки начала месячных.</p></div>}
            <p className="forecast-disclaimer">Прогноз не является гарантированной датой и уточняется по мере накопления данных.</p>
            <label className="consent onboarding-consent"><input type="checkbox" checked={consentConfirmed} onChange={(event) => setConsentConfirmed(event.target.checked)} /><span className="custom-check"><Check /></span><span>Я согласна на обработку данных о цикле и здоровье по <Link href="/privacy" target="_blank">политике конфиденциальности</Link>.</span></label>
          </div>}

          {error && <p className="form-error onboarding-error" role="alert">{error}</p>}
          <div className="onboarding-actions">
            {step > 1 && <button className="back-button" type="button" disabled={isSaving} onClick={goBack}><ArrowLeft /> Назад</button>}
            <button className="button" type="submit" disabled={isSaving} aria-busy={isSaving}>{isSaving ? <><LoaderCircle className="spin" /> Сохраняем</> : <>{step === 1 ? "Начать" : step === 4 ? "Перейти на главную" : "Продолжить"}<ArrowRight /></>}</button>
          </div>
        </form>
      </section>
    </main>
  );
}
