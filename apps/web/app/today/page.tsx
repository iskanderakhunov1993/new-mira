"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarDays, ChevronRight, CircleUserRound, Droplet, Heart, HeartPulse, MoonStar, Plus, Sparkles, TrendingUp } from "lucide-react";
import { getProfile, MiraProfile } from "@/lib/demo-session";
import { AppTabBar } from "@/components/AppTabBar";
import { Spotlight } from "@/components/Spotlight";
import { buildPeriodForecast } from "@/lib/cycle-analytics";
import { buildPersonalization } from "@/lib/personalization";
import { cyclePhaseForDate } from "@/lib/domain/cycle-phase";
import { buildTodayCards } from "@/lib/domain/today-cards";

const monthNames = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const adviceIcons = { cycle: HeartPulse, observation: HeartPulse, action: MoonStar, article: BookOpen };

function dayWord(value: number) {
  const lastTwo = value % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return "дней";
  if (value % 10 === 1) return "день";
  if (value % 10 >= 2 && value % 10 <= 4) return "дня";
  return "дней";
}

export default function TodayPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  const [showSpotlight, setShowSpotlight] = useState(false);
  useEffect(() => {
    void getProfile().then((current) => {
      if (current && !current.onboardingComplete) return router.replace("/onboarding");
      setProfile(current);
      setShowSpotlight(Boolean(current?.onboardingComplete && (current.spotlightStatus === "pending" || current.spotlightStatus === "shown")));
    }).catch(() => setProfile(null));
  }, [router]);

  const cycle = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const periodDates = new Set(profile?.entries?.filter((entry) => entry.period).map((entry) => entry.date) ?? []);
    const hasCycleStart = Boolean(profile?.lastPeriod || periodDates.size > 0);
    const active = periodDates.has(todayKey);
    let periodDay = 0;
    if (active) {
      const cursor = new Date(`${todayKey}T12:00:00`);
      while (periodDates.has(cursor.toISOString().slice(0, 10))) {
        periodDay += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
    }
    const forecast = buildPeriodForecast({ entries: profile?.entries ?? [], lastPeriod: profile?.lastPeriod, cycleLength: profile?.cycleLength, periodLength: profile?.periodLength, today: todayKey });
    return { ...forecast, day: forecast.cycleDay, until: forecast.daysUntil, active, periodDay, hasCycleStart };
  }, [profile]);

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, index) => { const date = new Date(today); date.setDate(today.getDate() + index - 3); return date; });
  const personalization = useMemo(() => buildPersonalization(profile?.entries ?? []), [profile]);
  const nextPattern = personalization.completed.length >= 3 ? personalization.patterns.find((pattern) => pattern.typicalDay >= cycle.day && pattern.typicalDay <= cycle.day + 7) : undefined;
  const todayKey = today.toISOString().slice(0, 10);
  const todayPhase = cyclePhaseForDate({ entries: profile?.entries ?? [], lastPeriod: profile?.lastPeriod, cycleLength: profile?.cycleLength, periodLength: profile?.periodLength, date: todayKey });
  const todayCards = buildTodayCards({ entries: profile?.entries ?? [], today: todayKey, hasCycleData: cycle.hasCycleStart, cycleDay: cycle.day, phase: todayPhase, delayed: cycle.until < -cycle.uncertaintyDays });

  return (
    <main className="app-page flo-inspired-page">
      <div className="app-shell">
        <header className="app-top"><Link className="app-top-action" href="/profile" aria-label="Профиль"><CircleUserRound /></Link><h1>{today.getDate()} {monthNames[today.getMonth()]}</h1><Link className="app-top-action" href="/calendar" aria-label="Календарь"><CalendarDays /></Link></header>
        <section className="app-week" aria-label="Дни недели">{dates.map((date, index) => { const key = date.toISOString().slice(0, 10); const hasPeriod = profile?.entries?.some((entry) => entry.date === key && entry.period); const phase = cyclePhaseForDate({ entries: profile?.entries ?? [], lastPeriod: profile?.lastPeriod, cycleLength: profile?.cycleLength, periodLength: profile?.periodLength, date: key }); return <Link aria-label={`Открыть ${date.getDate()} ${monthNames[date.getMonth()]} в календаре`} className={`${index === 3 ? "active" : ""} ${hasPeriod ? "has-period" : ""} ${phase ? `phase-${phase}` : ""}`} href={`/calendar?date=${key}`} key={key}><small>{["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"][date.getDay()]}</small><span>{date.getDate()}</span></Link>; })}</section>
        <section className="flo-cycle-hero"><div className="flo-orb flo-orb-one" /><div className="flo-orb flo-orb-two" /><p>{!cycle.hasCycleStart ? "Первый прогноз" : cycle.active ? "Месячные идут" : cycle.until < 0 ? "Предполагаемая задержка" : cycle.until === 0 ? "Возможное начало месячных" : "Месячные примерно через"}</p><h2>{!cycle.hasCycleStart ? <>пока <span>без дат</span></> : cycle.active ? <>{cycle.periodDay} <span>{dayWord(cycle.periodDay)}</span></> : cycle.until < 0 ? <>{Math.abs(cycle.until)} <span>{dayWord(Math.abs(cycle.until))}</span></> : cycle.until === 0 ? "сегодня" : <>{cycle.until} <span>{dayWord(cycle.until)}</span></>}</h2><div className="fertility-copy"><strong>{!cycle.hasCycleStart ? "Отметьте первый день месячных" : cycle.active ? "Фактическая продолжительность" : cycle.expectedStart ? `Ожидаемое начало: ${new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(`${cycle.expectedStart}T12:00:00`))}` : "Отметьте начало месячных"}</strong><span>{!cycle.hasCycleStart ? "После первой отметки Mira рассчитает ориентировочные даты" : cycle.active ? `${cycle.day}-й день цикла` : `${cycle.day}-й день цикла · прогноз ±${cycle.uncertaintyDays} ${dayWord(cycle.uncertaintyDays)}`}</span></div></section>
        {personalization.completed.length >= 3 && <section className="today-personalization" aria-label="Персональные наблюдения">
          {nextPattern ? <Link className="today-pattern" href={`/insights/symptoms/${encodeURIComponent(nextPattern.name)}`}><Sparkles /><div><small>Ближайшие 7 дней · наблюдение</small><h2>Возможен симптом: {nextPattern.name}</h2><p>Он повторялся в {nextPattern.matchedCycles} из 3 циклов примерно на {nextPattern.typicalDay}-й день.</p></div><ChevronRight /></Link> : <Link className="today-pattern quiet" href="/insights"><Sparkles /><div><small>Ближайшие 7 дней</small><h2>Нет повторяющихся симптомов</h2><p>Продолжайте отмечать самочувствие — прогноз станет точнее.</p></div><ChevronRight /></Link>}
          {personalization.currentComparison && <Link className={`today-comparison ${personalization.currentComparison.tone}`} href="/insights"><TrendingUp /><div><small>Текущий и типичный цикл</small><h2>{personalization.currentComparison.label}</h2><p>{personalization.currentComparison.text}</p></div><ChevronRight /></Link>}
        </section>}
        <section className="today-quick-actions flo-actions" aria-label="Быстрые отметки"><Link className="primary" href="/calendar?action=period"><span><Droplet /></span><strong>Отметить<br />месячные</strong></Link><Link href="/diary?section=symptoms"><span><Plus /></span><strong>Симптомы</strong></Link><Link href="/diary?section=intimacy"><span><Heart /></span><strong>Секс</strong></Link></section>
        <section className="today-safety-links" aria-label="Что вас беспокоит"><h2>Что вас беспокоит?</h2><div>{cycle.until < -cycle.uncertaintyDays && <Link href="/concerns/delay">Месячные не начались</Link>}<Link href="/concerns/pain">Сильная боль</Link><Link href="/concerns/heavy-flow">Обильные месячные</Link></div></section>
        <section className="daily-advice"><div className="daily-advice-heading"><h2>Полезное сегодня</h2><Link href="/knowledge">Все материалы</Link></div><div className="daily-advice-scroll">{todayCards.map((card) => { const Icon = adviceIcons[card.kind]; return <Link aria-label={`${card.eyebrow}: ${card.title}`} className={`advice-card advice-${card.tone}`} href={card.href} key={card.kind}><span><Icon /></span><small>{card.eyebrow}</small><h3>{card.title}</h3><p>{card.description}</p></Link>; })}</div></section>
      </div>
      <AppTabBar active="today" />
      {showSpotlight && <Spotlight onClose={() => setShowSpotlight(false)} />}
    </main>
  );
}
