"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarDays, ChevronRight, CircleUserRound, Droplet, GlassWater, Package, Pill, Plus, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { getProfile, MiraProfile } from "@/lib/demo-session";
import { AppTabBar } from "@/components/AppTabBar";
import { CycleTrendCard } from "@/components/CycleTrendCard";
import { Spotlight } from "@/components/Spotlight";
import { SymptomPatternCard } from "@/components/SymptomPatternCard";
import { buildCycleHistorySummary, buildCycles, formatCycleDate } from "@/lib/cycle-analytics";
import { buildPersonalization } from "@/lib/personalization";
import { calculateCycle } from "@/lib/domain/cycle-engine";
import { cyclePhaseForDate } from "@/lib/domain/cycle-phase";
import { buildTodayCards, type TodayCard } from "@/lib/domain/today-cards";
import { buildDailyRecommendations } from "@/lib/domain/daily-recommendations";

const monthNames = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

function dayWord(value: number) {
  const lastTwo = value % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return "дней";
  if (value % 10 === 1) return "день";
  if (value % 10 >= 2 && value % 10 <= 4) return "дня";
  return "дней";
}

function cycleWord(value: number) {
  const lastTwo = value % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return "циклов";
  if (value % 10 === 1) return "цикл";
  if (value % 10 >= 2 && value % 10 <= 4) return "цикла";
  return "циклов";
}

export default function TodayPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const previewCards = process.env.NODE_ENV === "development";
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
    const forecast = calculateCycle({ entries: profile?.entries ?? [], lastPeriod: profile?.lastPeriod, cycleLength: profile?.cycleLength, periodLength: profile?.periodLength, cyclePattern: profile?.cyclePattern, today: todayKey });
    return { ...forecast, day: forecast.cycleDay ?? 1, until: forecast.daysUntil ?? 0, active, periodDay, hasCycleStart };
  }, [profile]);

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const dates = Array.from({ length: 7 }, (_, index) => { const date = new Date(today); date.setDate(today.getDate() + index - 3); return date; });
  const personalization = useMemo(() => buildPersonalization(profile?.entries ?? []), [profile]);
  const cycleHistory = useMemo(() => buildCycleHistorySummary(profile?.entries ?? []), [profile]);
  const cycleRecords = buildCycles(profile?.entries ?? [], todayKey);
  const visibleCycles = cycleRecords.slice(-3).reverse();
  const completedCycles = cycleRecords.filter((item) => item.completed);
  const nextPattern = personalization.completed.length >= 3 ? personalization.patterns.find((pattern) => pattern.typicalDay >= cycle.day && pattern.typicalDay <= cycle.day + 7) : undefined;
  const todayPhase = cyclePhaseForDate({ entries: profile?.entries ?? [], lastPeriod: profile?.lastPeriod, cycleLength: profile?.cycleLength, periodLength: profile?.periodLength, date: todayKey });
  const actualTodayCards = buildTodayCards({ entries: profile?.entries ?? [], today: todayKey, hasCycleData: cycle.hasCycleStart, cycleDay: cycle.day, phase: todayPhase, delayed: cycle.until < -cycle.uncertaintyDays, expectedStart: cycle.expectedStart, uncertaintyDays: cycle.uncertaintyDays, periodActive: cycle.active, periodDay: cycle.periodDay });
  const dailyRecommendations = buildDailyRecommendations({ entries: profile?.entries ?? [], today: todayKey, weightKg: profile?.weightKg });
  const todayCards: TodayCard[] = previewCards ? [
    actualTodayCards.find((card) => card.kind === "cycle")!,
    actualTodayCards.find((card) => card.kind === "observation") ?? { kind: "observation", eyebrow: "Последние 7 дней", title: "Усталость — 3 раза", description: "Тестовый пример наблюдения.", href: "/insights", tone: "pink" },
    actualTodayCards.find((card) => card.kind === "action") ?? { kind: "action", eyebrow: "Важно проверить", title: "Важно проверить!", description: "Тестовый пример важной проверки.", href: "/concerns/pain", tone: "dark" },
    actualTodayCards.find((card) => card.kind === "article")!,
  ] : actualTodayCards;

  return (
    <main className="app-page flo-inspired-page">
      <div className="app-shell">
        <header className="app-top"><Link className="app-top-action" href="/profile" aria-label="Профиль"><CircleUserRound /></Link><h1>{today.getDate()} {monthNames[today.getMonth()]}</h1><Link className="app-top-action" href="/calendar" aria-label="Календарь"><CalendarDays /></Link></header>
        <section className="app-week" aria-label="Дни недели">{dates.map((date, index) => { const key = date.toISOString().slice(0, 10); const hasPeriod = profile?.entries?.some((entry) => entry.date === key && entry.period); const phase = cyclePhaseForDate({ entries: profile?.entries ?? [], lastPeriod: profile?.lastPeriod, cycleLength: profile?.cycleLength, periodLength: profile?.periodLength, date: key }); return <Link aria-label={`Открыть ${date.getDate()} ${monthNames[date.getMonth()]} в календаре`} className={`${index === 3 ? "active" : ""} ${hasPeriod ? "has-period" : ""} ${phase ? `phase-${phase}` : ""}`} href={`/calendar?date=${key}`} key={key}><small>{["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"][date.getDay()]}</small><span>{date.getDate()}</span></Link>; })}</section>
        <section className="flo-cycle-hero"><div className="flo-orb flo-orb-one" /><div className="flo-orb flo-orb-two" /><p>{!cycle.hasCycleStart ? "Первый прогноз" : cycle.active ? "Месячные идут" : cycle.until < 0 ? "Предполагаемая задержка" : cycle.until === 0 ? "Возможное начало месячных" : "Месячные примерно через"}</p><h2>{!cycle.hasCycleStart ? <>пока <span>без дат</span></> : cycle.active ? <>{cycle.periodDay} <span>{dayWord(cycle.periodDay)}</span></> : cycle.until < 0 ? <>{Math.abs(cycle.until)} <span>{dayWord(Math.abs(cycle.until))}</span></> : cycle.until === 0 ? "сегодня" : <>{cycle.until} <span>{dayWord(cycle.until)}</span></>}</h2><div className="fertility-copy"><strong>{!cycle.hasCycleStart ? "Отметьте первый день месячных" : cycle.active ? "Фактическая продолжительность" : cycle.expectedStart ? `Ожидаемое начало: ${new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(`${cycle.expectedStart}T12:00:00`))}` : "Отметьте начало месячных"}</strong><span>{!cycle.hasCycleStart ? "После первой отметки Mira рассчитает ориентировочные даты" : cycle.active ? `${cycle.day}-й день цикла` : `${cycle.day}-й день цикла · прогноз ±${cycle.uncertaintyDays} ${dayWord(cycle.uncertaintyDays)}`}</span></div></section>
        {personalization.completed.length >= 3 && <section className="today-personalization" aria-label="Персональные наблюдения">
          {nextPattern ? <Link className="today-pattern" href={`/insights/symptoms/${encodeURIComponent(nextPattern.name)}`}><Sparkles /><div><small>Ближайшие 7 дней · наблюдение</small><h2>Раньше вы отмечали: {nextPattern.name}</h2><p>В {nextPattern.matchedCycles} из {nextPattern.evaluatedCycles} циклов примерно на {nextPattern.dayRange.min}–{nextPattern.dayRange.max}-й день.</p></div><ChevronRight /></Link> : <Link className="today-pattern quiet" href="/insights"><Sparkles /><div><small>Ближайшие 7 дней</small><h2>Нет повторяющихся симптомов</h2><p>Продолжайте отмечать самочувствие — прогноз станет точнее.</p></div><ChevronRight /></Link>}
          {personalization.currentComparison && <Link className={`today-comparison ${personalization.currentComparison.tone}`} href="/insights"><TrendingUp /><div><small>Текущий и типичный цикл</small><h2>{personalization.currentComparison.label}</h2><p>{personalization.currentComparison.text}</p></div><ChevronRight /></Link>}
        </section>}
        <section className="today-quick-actions flo-actions" aria-label="Быстрые отметки"><Link className="primary" href="/calendar?action=period"><span><Droplet /></span><strong>Отметить<br />месячные</strong></Link><Link href="/diary?section=symptoms"><span><Plus /></span><strong>Симптомы</strong></Link><Link href="/concerns"><span><ShieldAlert /></span><strong>Мне<br />плохо</strong></Link></section>
        <section className="today-safety-links" aria-label="Что вас беспокоит"><h2>Что вас беспокоит?</h2><div>{cycle.until < -cycle.uncertaintyDays && <Link href="/concerns/delay">Месячные не начались</Link>}<Link href="/concerns/pain">Сильная боль</Link><Link href="/concerns/heavy-flow">Обильные месячные</Link></div></section>
        <section className="daily-advice"><div className="daily-advice-heading"><h2>Полезное сегодня</h2><Link href="/knowledge">Все материалы</Link></div><div className="daily-advice-scroll">{todayCards.map((card, index) => { const accessiblePrefix = card.kind === "cycle" ? "Прогноз" : card.kind === "observation" ? "Наблюдение недели" : card.eyebrow; return <Link aria-label={`${accessiblePrefix}: ${card.title}`} className={`advice-card advice-${card.tone} advice-card-minimal`} href={card.href} key={`${card.kind}-${index}`}><h3>{card.title}</h3></Link>; })}</div></section>
        <section className="daily-recommendations" aria-labelledby="daily-recommendations-title"><div className="daily-advice-heading"><div><small>По вашим отметкам</small><h2 id="daily-recommendations-title">Рекомендации дня</h2></div><span>Не назначения</span></div><div className="daily-recommendations-scroll">{dailyRecommendations.map((item) => { const Icon = item.kind === "water" ? GlassWater : item.kind === "movement" ? Activity : item.kind === "kit" ? Package : Pill; return <Link className={`daily-recommendation recommendation-${item.tone}`} href={item.href} key={item.kind}><span><Icon /></span><small>{item.eyebrow}</small><h3>{item.title}</h3><p>{item.description}</p><b>Открыть <ChevronRight /></b></Link>; })}</div></section>
        <section className="today-cycles-summary" aria-labelledby="today-cycles-title">
          <div className="today-cycles-heading"><h2 id="today-cycles-title">Мои циклы</h2><Link href="/analytics">Подробнее <ChevronRight /></Link></div>
          {cycleHistory.latestCompleted ? <Link className="today-cycles-card" href="/analytics" aria-label="Открыть историю и динамику циклов">
            <div><span>Длина предыдущего цикла</span><strong>{cycleHistory.latestCompleted.length} {dayWord(cycleHistory.latestCompleted.length)}</strong></div>
            <div><span>Месячные в предыдущем цикле</span><strong>{cycleHistory.latestCompleted.periodDays} {dayWord(cycleHistory.latestCompleted.periodDays)}</strong></div>
            <div><span>Диапазон длины цикла</span>{cycleHistory.recentRange ? <><strong>{cycleHistory.recentRange.min}–{cycleHistory.recentRange.max} {dayWord(cycleHistory.recentRange.max)}</strong><small>Последние 3 завершённых цикла</small></> : <><strong>Ещё {cycleHistory.remainingForRange} {cycleWord(cycleHistory.remainingForRange)}</strong><small>Диапазон появится после 3 завершённых циклов</small></>}</div>
          </Link> : <div className="today-cycles-empty"><strong>История пока собирается</strong><p>Отметьте начало следующих месячных, чтобы появился первый завершённый цикл.</p><Link href="/calendar?action=period">Отметить месячные</Link></div>}
        </section>
        <section className="today-cycle-history" aria-labelledby="today-cycle-history-title">
          <div className="today-cycle-panel-heading">
            <h2 id="today-cycle-history-title">История циклов</h2>
            <Link href="/analytics/cycles">Смотреть все <ChevronRight /></Link>
          </div>
          {visibleCycles.length ? <div className="today-cycle-history-list">
            {visibleCycles.map((item) => {
              const shownDays = Math.min(item.length, 32);
              return <Link className="today-cycle-history-row" href={`/analytics/cycles/${item.start}`} key={item.start}>
                <div>
                  <strong>{item.current ? `Текущий цикл: ${item.length} ${dayWord(item.length)}` : `${item.length} ${dayWord(item.length)}`}</strong>
                  <span>{item.current ? `Начался ${formatCycleDate(item.start)}` : `${formatCycleDate(item.start)} — ${formatCycleDate(item.end)}`}</span>
                  <div className="today-cycle-dots" aria-label={`${item.periodDays} ${dayWord(item.periodDays)} месячных из ${item.length}`}>
                    {Array.from({ length: shownDays }, (_, index) => <i className={index < item.periodDays ? "period" : item.current && index === item.length - 1 ? "today" : ""} key={index} />)}
                    {item.length > shownDays && <small>+{item.length - shownDays}</small>}
                  </div>
                </div>
                <ChevronRight aria-hidden="true" />
              </Link>;
            })}
          </div> : <div className="today-cycle-panel-empty"><strong>Здесь появятся ваши циклы</strong><p>Для истории нужна хотя бы одна отметка начала месячных.</p><Link href="/calendar?action=period">Добавить отметку</Link></div>}
        </section>
        <CycleTrendCard className="today-cycle-trend" cycles={completedCycles} />
        <section className="today-patterns-block" aria-labelledby="today-patterns-title">
          <div className="today-patterns-heading">
            <div><small>По вашим отметкам</small><h2 id="today-patterns-title">Мои закономерности</h2></div>
            <Link href="/insights">Смотреть все <ChevronRight /></Link>
          </div>
          {personalization.patterns[0]
            ? <SymptomPatternCard pattern={personalization.patterns[0]} />
            : <div className="today-patterns-empty"><strong>Закономерности пока собираются</strong><p>Отмечайте симптомы в течение нескольких циклов — Mira покажет только подтверждённые повторения.</p><Link href="/diary?section=symptoms">Отметить симптомы</Link></div>}
        </section>
      </div>
      <AppTabBar active="today" />
      {showSpotlight && <Spotlight onClose={() => setShowSpotlight(false)} />}
    </main>
  );
}
