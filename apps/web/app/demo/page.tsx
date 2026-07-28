"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  Droplets,
  HeartPulse,
  MoonStar,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { sendPublicEvent } from "@/components/PublicProductAnalytics";

const goals = [
  { id: "understand", icon: MoonStar, title: "Понимать цикл", text: "Даты, прогноз и личная динамика" },
  { id: "pain", icon: HeartPulse, title: "Наблюдать боль", text: "Сила, влияние и повторения" },
  { id: "heavy_flow", icon: Droplets, title: "Следить за кровотечением", text: "Интенсивность и длительность" },
  { id: "medication", icon: Pill, title: "Оценивать лекарства", text: "Приём, эффект и побочные реакции" },
  { id: "doctor", icon: Stethoscope, title: "Подготовиться к врачу", text: "Факты и вопросы за выбранный период" },
  { id: "pms", icon: Activity, title: "Наблюдать ПМС", text: "Настроение, энергия и симптомы" },
] as const;

const quickMarks = [
  { id: "calm", label: "Спокойное настроение" },
  { id: "low-energy", label: "Мало энергии" },
  { id: "pain", label: "Есть боль" },
] as const;

export default function DemoPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [goal, setGoal] = useState<(typeof goals)[number]["id"]>("understand");
  const [marks, setMarks] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    sendPublicEvent("demo_started", "/demo");
  }, []);

  function continueDemo() {
    if (step === 1) {
      sendPublicEvent("demo_step_completed", "/demo");
      setStep(2);
      return;
    }
    if (step === 2) {
      sendPublicEvent("demo_completed", "/demo");
      setStep(3);
    }
  }

  function toggleMark(id: string) {
    setMarks((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedGoal = goals.find((item) => item.id === goal)!;

  return (
    <main className="product-demo-page">
      <header className="product-demo-header">
        <Link href="/" aria-label="Вернуться на главную"><ArrowLeft /></Link>
        <Link className="product-demo-logo" href="/"><span><MoonStar /></span><strong>Mira</strong></Link>
        <span>{step} из 3</span>
      </header>
      <div className="product-demo-progress"><span style={{ width: `${step / 3 * 100}%` }} /></div>

      <section className="product-demo-card">
        {step === 1 && <>
          <small>Ваш первый результат</small>
          <h1>Что сейчас важнее?</h1>
          <p>Выберите одну цель. В настоящем аккаунте её можно изменить в любой момент.</p>
          <div className="product-demo-goals">
            {goals.map(({ id, icon: Icon, title, text }) => <button className={goal === id ? "selected" : ""} type="button" onClick={() => setGoal(id)} key={id}><span><Icon /></span><div><strong>{title}</strong><small>{text}</small></div>{goal === id && <Check />}</button>)}
          </div>
        </>}

        {step === 2 && <>
          <small>Демо-отметка · данные не сохраняются</small>
          <h1>Как вы себя чувствуете сегодня?</h1>
          <p>Можно выбрать только то, что актуально. Для примера достаточно одной отметки.</p>
          <div className="product-demo-marks">
            {quickMarks.map((item) => <button aria-pressed={marks.has(item.id)} className={marks.has(item.id) ? "selected" : ""} type="button" onClick={() => toggleMark(item.id)} key={item.id}><span>{marks.has(item.id) ? <Check /> : <Sparkles />}</span><strong>{item.label}</strong></button>)}
          </div>
          <aside className="product-demo-privacy"><ShieldCheck /><span><strong>Это безопасная демонстрация</strong><small>Выбранные ответы не отправляются на сервер и не сохраняются.</small></span></aside>
        </>}

        {step === 3 && <>
          <span className="product-demo-result-icon"><ClipboardList /></span>
          <small>Пример персонального результата</small>
          <h1>Первое наблюдение готово</h1>
          <div className="product-demo-result">
            <span>Ваша цель</span>
            <strong>{selectedGoal.title}</strong>
            <p>{marks.size ? `Сегодня отмечено: ${marks.size}. После нескольких дней Mira сможет показать только подтверждённые повторения.` : "После нескольких коротких отметок Mira сможет показать осторожные повторения."}</p>
          </div>
          <p className="product-demo-result-note">Mira не определяет причины симптомов и не ставит диагноз. Вы решаете, какие данные сохранять и включать в отчёт врачу.</p>
          <Link className="button product-demo-register" href="/register" onClick={() => sendPublicEvent("register_clicked", "/demo")}>Создать аккаунт и продолжить <ArrowRight /></Link>
          <Link className="product-demo-login" href="/login">Уже есть аккаунт? Войти</Link>
        </>}

        {step < 3 && <button className="button product-demo-next" type="button" disabled={step === 2 && marks.size === 0} onClick={continueDemo}>{step === 1 ? "Попробовать отметку" : "Показать результат"} <ArrowRight /></button>}
      </section>
    </main>
  );
}
