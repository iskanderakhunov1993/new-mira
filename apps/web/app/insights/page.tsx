"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BedDouble, BookOpenText, CalendarRange, ChevronRight, CircleCheck, Droplet, HeartPulse, Lightbulb, LockKeyhole, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { AppTabBar } from "@/components/AppTabBar";
import { getProfile, MiraProfile } from "@/lib/demo-session";
import { buildPersonalization } from "@/lib/personalization";
import { calculateCycle } from "@/lib/domain/cycle-engine";
import { buildCycleAttention } from "@/lib/domain/cycle-period-stats";
import { buildInsightFeed, type InsightFeedItem } from "@/lib/domain/insight-feed";
import { buildKnowledgeRecommendations } from "@/lib/domain/knowledge-recommendations";
import { knowledgeArticles } from "@/lib/knowledge-library";

type InsightsTab = "knowledge" | "patterns" | "screenings";

const tabs: Array<{ id: InsightsTab; label: string }> = [
  { id: "patterns", label: "Наблюдения" },
  { id: "screenings", label: "Проверить" },
  { id: "knowledge", label: "Материалы" },
];

function InsightCard({ item, read, onDismiss, onRead }: {
  item: InsightFeedItem;
  read: boolean;
  onDismiss: () => void;
  onRead: () => void;
}) {
  return <article className={`insight-feed-card ${item.tone} ${read ? "read" : ""}`}>
    <header><span>{item.tag}</span>{read && <small><CircleCheck />Прочитано</small>}</header>
    <h2>{item.title}</h2>
    <p>{item.description}</p>
    <details><summary>Основание и надёжность <ChevronRight /></summary><div className="insight-evidence"><p><strong>Основание</strong><span>{item.basis}</span></p><p><strong>Надёжность</strong><span>{item.confidence}</span></p><p><strong>Следующий шаг</strong><span>{item.nextStep}</span></p></div></details>
    <footer><Link href={item.href}>Подробнее <ArrowRight /></Link><button onClick={onRead} type="button">Понятно</button><button onClick={onDismiss} type="button">Не актуально</button></footer>
  </article>;
}

export default function InsightsPage() {
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  const [activeTab, setActiveTab] = useState<InsightsTab>("patterns");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  useEffect(() => { void getProfile().then(setProfile).catch(() => setProfile(null)); }, []);

  const entries = useMemo(() => profile?.entries ?? [], [profile?.entries]);
  const today = new Date().toISOString().slice(0, 10);
  const personalization = useMemo(() => buildPersonalization(entries), [entries]);
  const forecast = useMemo(() => calculateCycle({
    entries,
    lastPeriod: profile?.lastPeriod,
    cycleLength: profile?.cycleLength,
    periodLength: profile?.periodLength,
    cyclePattern: profile?.cyclePattern,
    today,
  }), [entries, profile, today]);
  const attention = useMemo(() => buildCycleAttention(personalization.completed), [personalization.completed]);
  const feed = useMemo(() => buildInsightFeed({
    completedCycles: personalization.completed.length,
    attention,
    pattern: personalization.patterns[0],
  }), [attention, personalization.completed.length, personalization.patterns]);
  const visibleFeed = feed.filter((item) => !dismissedIds.has(item.id));
  const unreadCount = visibleFeed.filter((item) => !readIds.has(item.id)).length;
  const trackedDays = entries.filter((entry) => entry.period || entry.symptoms?.length || entry.pain !== undefined || entry.mood || entry.energy || entry.sleepHours !== undefined || entry.medicationIntakes?.length).length;
  const ready = personalization.completed.length >= 3;
  const knowledge = useMemo(() => buildKnowledgeRecommendations({ entries, today, phase: forecast.phase }).map((item) => ({
    ...item,
    article: knowledgeArticles.find((article) => article.id === item.articleId),
  })).filter((item) => item.article), [entries, forecast.phase, today]);
  const privateInsightsEnabled = Boolean(profile?.preferences?.privateInsights && profile?.consents?.sensitiveInsights);

  const markAllRead = () => setReadIds(new Set(visibleFeed.map((item) => item.id)));
  const markRead = (id: string) => setReadIds((current) => new Set([...current, id]));
  const dismiss = (id: string) => setDismissedIds((current) => new Set([...current, id]));

  return <main className="insights-page"><div className="insights-shell">
    <header className="insights-header">
      <div><small>Только ваши записи</small><h1>Инсайты</h1><p>Что повторяется, изменилось или требует проверки.</p></div>
      <span><Lightbulb />{unreadCount > 0 && <b aria-label={`Новых инсайтов: ${unreadCount}`}>{unreadCount}</b>}</span>
    </header>

    <nav className="insights-tabs" aria-label="Разделы инсайтов">
      {tabs.map((tab) => <button aria-current={activeTab === tab.id ? "page" : undefined} className={activeTab === tab.id ? "active" : ""} key={tab.id} onClick={() => setActiveTab(tab.id)} type="button">{tab.label}</button>)}
    </nav>

    {activeTab === "patterns" && <section className="insights-tab-panel" aria-label="Личные наблюдения">
      <section className={`insights-hero fingerprint-hero ${ready ? "has-patterns" : ""}`}><span><Sparkles /></span><div><small>Личные наблюдения</small><h2>{ready ? `История из ${personalization.completed.length} циклов` : "Пока мало данных для выводов"}</h2><p>{ready ? "Здесь появляются только новые повторения и заметные изменения. Прогноз цикла остаётся в разделе «Мой цикл»." : `${Math.min(trackedDays, 7)} из 7 дней с отметками · ${personalization.completed.length} из 3 завершённых циклов.`}</p></div></section>

      {unreadCount > 0 && <div className="insights-feed-heading"><div><small>Персональная лента</small><h2>Что Mira заметила</h2></div><button onClick={markAllRead} type="button">Отметить всё прочитанным</button></div>}
      {visibleFeed.length ? <div className="insights-feed">{visibleFeed.map((item) => <InsightCard item={item} key={item.id} onDismiss={() => dismiss(item.id)} onRead={() => markRead(item.id)} read={readIds.has(item.id)} />)}</div> : <div className="insights-empty feed-empty"><Lightbulb /><h2>{trackedDays < 7 ? "Начинаем собирать вашу картину" : "Новых наблюдений пока нет"}</h2><p>{trackedDays < 7 ? "Отмечайте боль, настроение и энергию. Первые осторожные повторения появятся после нескольких дней и завершённых циклов." : "Продолжайте отмечать самочувствие — новые инсайты появятся только при достаточном количестве фактов."}</p><Link href="/diary?section=symptoms">Добавить отметку</Link></div>}

      {ready && <><section className="fingerprint-card"><header><div><small>Ваш обычный ритм</small><h2>Отпечаток цикла</h2></div><span>{personalization.completed.length} циклов</span></header><div>{personalization.fingerprint.slice(0, 4).map((item) => <article key={item.label}><small>{item.label}</small><strong>{item.value}</strong></article>)}</div></section><section className="personalization-grid"><article><BedDouble /><small>Сон и энергия</small><h2>{personalization.sleep.entries ? `${personalization.sleep.average.toFixed(1)} ч в среднем` : "Недостаточно записей"}</h2><p>{personalization.sleep.difference && personalization.sleep.entries >= 5 ? `В ваших отметках дни с усталостью связаны с более коротким сном на ${personalization.sleep.difference.toFixed(1)} ч.` : "Нужно минимум пять сопоставимых записей, чтобы показать осторожное наблюдение."}</p></article><article><HeartPulse /><small>Что облегчает</small><h2>{personalization.relief[0]?.label ?? "Пока нет сравнения"}</h2><p>{personalization.relief.length ? `Основано на ${personalization.relief[0].entries} отметках боли.` : "Нужно минимум две сопоставимые отметки боли."}</p></article></section></>}

      <section className="insights-coverage compact"><header><div><small>Прозрачность данных</small><h2>Что используется</h2></div><span>{trackedDays} дней</span></header><div><Link href="/analytics"><CalendarRange /><span><strong>{personalization.completed.length}</strong><small>завершённых циклов</small></span><ChevronRight /></Link><Link href="/diary?section=period"><Droplet /><span><strong>{entries.filter((entry) => entry.period).length}</strong><small>отметок месячных</small></span><ChevronRight /></Link><Link href="/diary?section=symptoms"><HeartPulse /><span><strong>{entries.reduce((sum, entry) => sum + (entry.symptoms?.length ?? 0), 0)}</strong><small>отметок симптомов</small></span><ChevronRight /></Link><Link href="/profile"><LockKeyhole /><span><strong>{privateInsightsEnabled ? "Вкл." : "Выкл."}</strong><small>приватные инсайты</small></span><ChevronRight /></Link></div><p>Интимные данные не анализируются и не попадают в отчёт без отдельного согласия.</p></section>
    </section>}

    {activeTab === "knowledge" && <section className="insights-tab-panel" aria-label="Знания">
      <div className="insights-section-intro"><BookOpenText /><div><small>30–60 секунд</small><h2>Рекомендуем почитать</h2><p>Подборка по текущему циклу и сегодняшним отметкам. Это образовательные материалы, а не медицинский вывод.</p></div></div>
      <div className="insights-knowledge-grid">{knowledge.map(({ article, reason }) => article && <Link href={`/knowledge/${article.id}`} key={article.id}><small>{reason}</small><h3>{article.title}</h3><span>{article.category} · {article.time}</span><b>Редакционный материал <ChevronRight /></b></Link>)}</div>
      <Link className="insights-wide-link" href="/knowledge">Открыть всю библиотеку <ArrowRight /></Link>
    </section>}

    {activeTab === "screenings" && <section className="insights-tab-panel" aria-label="Проверки самочувствия">
      <div className="insights-section-intro screenings"><Stethoscope /><div><small>Не диагноз</small><h2>Проверить симптомы</h2><p>Короткие маршруты помогают оценить срочность и подготовить факты для врача.</p></div></div>
      <div className="insights-screening-grid"><Link href="/concerns/pain"><HeartPulse /><div><small>1–2 минуты</small><h3>Сильная или повторяющаяся боль</h3><p>Оценить интенсивность и тревожные признаки.</p></div><ChevronRight /></Link><Link href="/concerns/heavy-flow"><Droplet /><div><small>1–2 минуты</small><h3>Обильное кровотечение</h3><p>Зафиксировать частоту смены средств и самочувствие.</p></div><ChevronRight /></Link><Link href="/concerns/delay"><CalendarRange /><div><small>Около минуты</small><h3>Задержка месячных</h3><p>Проверить контекст без автоматического вывода о беременности.</p></div><ChevronRight /></Link></div>
      <Link className="insights-doctor-link" href="/analytics/report"><Stethoscope /><span><strong>Подготовить отчёт для врача</strong><small>Вы сами выбираете, какие данные включить</small></span><ChevronRight /></Link>
      <p className="insights-disclaimer"><ShieldCheck /> Результат проверки не является диагнозом. При резком ухудшении самочувствия обращайтесь за медицинской помощью.</p>
    </section>}
  </div><AppTabBar active="insights" /></main>;
}
