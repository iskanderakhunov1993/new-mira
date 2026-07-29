"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Bot, FileHeart, HeartPulse, LockKeyhole, MessageCircleQuestion, ShieldAlert, Sparkles } from "lucide-react";
import { AppTabBar } from "@/components/AppTabBar";
import { getProfile, type MiraProfile } from "@/lib/demo-session";
import { buildAssistantGuidance } from "@/lib/domain/assistant-guidance";

const topics = [
  { title: "Разобрать мою отметку", description: "Что видно из сохранённых фактов", href: "/insights", icon: Sparkles },
  { title: "Подготовиться к врачу", description: "Собрать понятную сводку", href: "/analytics/report", icon: FileHeart },
  { title: "Мне сейчас плохо", description: "Проверить тревожные признаки", href: "/concerns", icon: ShieldAlert },
];

export default function AssistantPage() {
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  useEffect(() => { void getProfile().then(setProfile).catch(() => setProfile(null)); }, []);
  const today = new Date().toISOString().slice(0, 10);
  const guidance = useMemo(() => buildAssistantGuidance(profile?.entries ?? [], today), [profile, today]);
  const firstName = profile?.name?.trim().split(/\s+/)[0];

  return <main className="assistant-page"><div className="assistant-shell">
    <header className="assistant-top"><Link href="/profile" aria-label="Вернуться в профиль"><ArrowLeft /></Link><div><small>Mira</small><h1>Ассистент</h1></div><span><Bot /></span></header>

    <section className="assistant-intro"><div className="assistant-avatar"><HeartPulse /></div><div><small>Личный помощник по вашим записям</small><h2>{firstName ? `${firstName}, давайте разберёмся спокойно` : "Давайте разберёмся спокойно"}</h2><p>Я не ставлю диагнозы и не назначаю лечение.</p></div></section>

    <section className={`assistant-dialogue ${guidance.tone}`}>
      <div className="assistant-bubble"><span><Bot /></span><p><small>{guidance.eyebrow}</small><strong>{guidance.title}</strong>{guidance.message}</p></div>
      <Link href={guidance.href}>{guidance.actionLabel}<ArrowRight /></Link>
    </section>

    <section className="assistant-topics"><header><h2>Чем помочь?</h2><p>Выберите безопасный сценарий</p></header>{topics.map(({ title, description, href, icon: Icon }) => <Link href={href} key={title}><i><Icon /></i><span><strong>{title}</strong><small>{description}</small></span><ArrowRight /></Link>)}</section>

    <section className="assistant-privacy"><LockKeyhole /><p><strong>Под контролем пользователя</strong><span>Ассистент использует записи вашего аккаунта внутри Mira. Интимные данные не анализируются без отдельного согласия.</span></p></section>

    <Link className="assistant-question" href="/diary?section=notes"><MessageCircleQuestion /><span><strong>Записать свой вопрос</strong><small>Сохранится как личная заметка</small></span><ArrowRight /></Link>
  </div><AppTabBar active="insights" /></main>;
}
