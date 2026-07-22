"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, LoaderCircle, MoonStar, Sparkles } from "lucide-react";
import { getProfile, saveProfile } from "@/lib/demo-session";
import { buildPeriodForecast } from "@/lib/cycle-analytics";

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [lastPeriod, setLastPeriod] = useState("");
  const [dateUnknown, setDateUnknown] = useState(false);
  const [cycleLength, setCycleLength] = useState(28);
  const [cyclePattern, setCyclePattern] = useState<"regular" | "irregular" | "unknown">("regular");
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
      setCyclePattern(profile.cyclePattern ?? "regular");
      setStep(Math.min(TOTAL_STEPS, Math.max(1, profile.onboardingStep ?? 1)));
      setIsLoading(false);
    }).catch(() => router.replace("/login"));
  }, [router]);

  const forecast = useMemo(() => {
    if (!lastPeriod || dateUnknown || cyclePattern !== "regular") return null;
    return buildPeriodForecast({ entries: [], lastPeriod, cycleLength, periodLength: 5 });
  }, [cycleLength, cyclePattern, dateUnknown, lastPeriod]);

  async function next(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (step === 2 && !lastPeriod && !dateUnknown) return setError("Выберите дату или нажмите «Не помню точно»");

    setIsSaving(true);
    try {
      if (step === 1) {
        await saveProfile({ onboardingStep: 2 });
        setStep(2);
      } else if (step === 2) {
        await saveProfile({ ...(dateUnknown ? {} : { lastPeriod }), onboardingStep: 3 });
        setStep(3);
      } else if (step === 3) {
        await saveProfile({ cycleLength, cyclePattern, onboardingStep: 4 });
        setStep(4);
      } else {
        await saveProfile({
          onboardingComplete: true,
          onboardingStep: 4,
          consents: { healthData: true, privacyPolicy: true },
        });
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

  const minForecast = forecast ? Math.max(0, forecast.daysUntil - forecast.uncertaintyDays) : 0;
  const maxForecast = forecast ? Math.max(0, forecast.daysUntil + forecast.uncertaintyDays) : 0;

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
            <small>Настройка завершена</small>
            <h1>{forecast ? "Ваш первый прогноз готов" : "Mira готова к первой отметке"}</h1>
            {forecast ? <div className="forecast-result"><p>Сегодня примерно <strong>{forecast.cycleDay}-й день цикла</strong>.</p><p>Следующие месячные могут начаться через <strong>{minForecast}–{maxForecast} дней</strong>.</p></div> : <div className="forecast-result"><p>Отметьте начало месячных, когда будете готовы.</p><p>Mira построит первый ориентировочный прогноз по фактической дате.</p></div>}
            <p className="forecast-disclaimer">Первые прогнозы ориентировочные. Со временем Mira лучше поймёт особенности вашего цикла.</p>
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
