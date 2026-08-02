"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronRight, Droplet, FileHeart, HeartPulse, ListFilter, Plus, Sparkles, TrendingUp } from "lucide-react";
import { AppTabBar } from "@/components/AppTabBar";
import { AppPageState } from "@/components/AppPageState";
import { CycleOverviewChart } from "@/components/CycleOverviewChart";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getProfile, MiraProfile } from "@/lib/demo-session";
import { buildCycleHistorySummary, CycleRecord, daysBetween, formatCycleDate } from "@/lib/cycle-analytics";
import { calculateCycle } from "@/lib/domain/cycle-engine";
import { buildCycleAttention, buildCyclePeriodStats, buildCycleReliability, type CyclePeriod } from "@/lib/domain/cycle-period-stats";
import { cn } from "@/lib/utils";
import styles from "./analytics.module.css";

const flowLabels = { spotting: "Мажущие", light: "Слабые", medium: "Средние", heavy: "Обильные" } as const;
const phaseLabels = {
  menstruation: "Менструальная фаза",
  follicular: "Фолликулярная фаза",
  "ovulation-window": "Предполагаемое окно овуляции",
  luteal: "Лютеиновая фаза",
} as const;

function formatDays(value: number) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  const word = mod10 === 1 && mod100 !== 11 ? "день" : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "дня" : "дней";
  return `${value} ${word}`;
}

function formatAverageDays(value?: number) {
  if (value === undefined) return "—";
  return `${value.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} ${value === 1 ? "день" : value > 1 && value < 5 ? "дня" : "дней"}`;
}

function formatShortDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`));
}

function formatPredictionRange(start?: string, end?: string) {
  if (!start || !end) return "Появится после первой отметки";
  return `${formatShortDate(start)} — ${formatShortDate(end)}`;
}

function getRhythmInsight(completed: CycleRecord[]) {
  if (completed.length < 3) {
    return {
      tone: "quiet",
      title: "Пока собираем историю",
      text: `Есть ${completed.length} из 3 завершённых циклов для первого сравнения.`,
      basis: "Незавершённый текущий цикл в расчёт не входит.",
    };
  }
  const recent = completed.slice(-3);
  const recentMin = Math.min(...recent.map((cycle) => cycle.length));
  const recentMax = Math.max(...recent.map((cycle) => cycle.length));
  if (completed.length === 3) {
    return {
      tone: "quiet",
      title: "Появился первый личный диапазон",
      text: `Последние 3 завершённых цикла длились от ${recentMin} до ${recentMax} дней.`,
      basis: "Это сравнение с вашей историей, а не медицинская оценка.",
    };
  }
  const latest = completed.at(-1)!;
  const baseline = completed.slice(-4, -1);
  const baselineMin = Math.min(...baseline.map((cycle) => cycle.length));
  const baselineMax = Math.max(...baseline.map((cycle) => cycle.length));
  if (latest.length >= baselineMin && latest.length <= baselineMax) {
    return {
      tone: "good",
      title: "Последний цикл близок к вашей обычной картине",
      text: `${latest.length} дней — в диапазоне предыдущих циклов: ${baselineMin}–${baselineMax}.`,
      basis: `Основано на ${baseline.length + 1} последних завершённых циклах.`,
    };
  }
  const difference = latest.length < baselineMin ? baselineMin - latest.length : latest.length - baselineMax;
  const direction = latest.length < baselineMin ? "короче" : "длиннее";
  return {
    tone: "attention",
    title: `Последний цикл был ${direction} вашей недавней истории`,
    text: `${latest.length} дней — на ${difference} ${difference === 1 ? "день" : difference < 5 ? "дня" : "дней"} за пределами предыдущего диапазона ${baselineMin}–${baselineMax}.`,
    basis: "Это наблюдение по вашим записям, а не диагноз.",
  };
}

function FlowHeatmap({ cycles }: { cycles: CycleRecord[] }) {
  const recent = cycles.filter((cycle) => cycle.entries.some((entry) => entry.period)).slice(-3);
  if (!recent.length) return <div className="p1-empty">Отметьте интенсивность хотя бы одного дня месячных — здесь появится карта.</div>;
  const maxDays = Math.min(10, Math.max(5, ...recent.flatMap((cycle) => cycle.entries.filter((entry) => entry.period).map((entry) => daysBetween(cycle.start, entry.date) + 1))));
  const columns = { gridTemplateColumns: `70px repeat(${maxDays}, minmax(28px, 1fr))` };
  return <div className="flow-heatmap"><div className="p1-grid-head" style={columns}><span>Цикл</span>{Array.from({ length: maxDays }, (_, index) => <b key={index}>{index + 1}</b>)}</div>{recent.map((cycle) => { const entriesByDay = new Map(cycle.entries.filter((entry) => entry.period).map((entry) => [daysBetween(cycle.start, entry.date) + 1, entry])); return <div className="flow-heatmap-row" style={columns} key={cycle.start}><span>{formatCycleDate(cycle.start)}</span>{Array.from({ length: maxDays }, (_, index) => { const day = index + 1; const entry = entriesByDay.get(day); const flags = entry ? [entry.periodClots && "сгустки", entry.periodLeak && "протекание", entry.periodNightChange && "смена ночью", entry.periodHourlyChange && "смена каждый час"].filter(Boolean).join(", ") : ""; return entry?.period ? <Link className={`${entry.period} ${flags ? "has-flags" : ""}`} href={`/diary?section=period&date=${entry.date}`} title={`${flowLabels[entry.period]}${flags ? ` · ${flags}` : ""}`} aria-label={`${day}-й день: ${flowLabels[entry.period]}${flags ? `, ${flags}` : ""}`} key={index}><i /></Link> : <i className="empty" key={index} />; })}</div>; })}<footer><span><i className="spotting" />Мажущие</span><span><i className="light" />Слабые</span><span><i className="medium" />Средние</span><span><i className="heavy" />Обильные</span><span><i className="flag" />Есть дополнительная отметка</span></footer></div>;
}

function PainMap({ cycles }: { cycles: CycleRecord[] }) {
  const recent = cycles.filter((cycle) => cycle.entries.some((entry) => (entry.pain ?? 0) > 0)).slice(-3);
  const painEntries = recent.flatMap((cycle) => cycle.entries.filter((entry) => (entry.pain ?? 0) > 0));
  if (!painEntries.length) return <div className="p1-empty">Отметьте интенсивность боли — Mira покажет её положение в цикле.</div>;
  const byDay = new Map<number, number[]>();
  recent.forEach((cycle) => cycle.entries.forEach((entry) => { if (!entry.pain) return; const day = daysBetween(cycle.start, entry.date) + 1; byDay.set(day, [...(byDay.get(day) ?? []), entry.pain]); }));
  const typicalDay = [...byDay.entries()].sort((a, b) => (b[1].reduce((sum, value) => sum + value, 0) / b[1].length) - (a[1].reduce((sum, value) => sum + value, 0) / a[1].length))[0]?.[0];
  const locations = painEntries.flatMap((entry) => entry.painLocations ?? []);
  const types = painEntries.flatMap((entry) => entry.painTypes ?? []);
  const common = (values: string[]) => [...new Set(values)].sort((a, b) => values.filter((value) => value === b).length - values.filter((value) => value === a).length)[0];
  return <><div className="pain-map"><div className="pain-map-scale"><span>Цикл</span><b>1</b><b>7</b><b>14</b><b>21</b><b>28</b></div>{recent.map((cycle) => <div className="pain-map-row" key={cycle.start}><span>{formatCycleDate(cycle.start)}</span><div>{Array.from({ length: Math.min(45, Math.max(28, cycle.length)) }, (_, index) => { const day = index + 1; const entry = cycle.entries.find((item) => daysBetween(cycle.start, item.date) + 1 === day); const value = entry?.pain ?? 0; return value ? <Link className={value >= 7 ? "high" : value >= 4 ? "medium" : "low"} href={`/diary?date=${entry!.date}`} title={`${day}-й день · боль ${value}/10`} aria-label={`${day}-й день цикла: боль ${value} из 10`} key={day} /> : <i key={day} />; })}</div></div>)}</div><div className="pain-map-facts"><p><small>Наиболее выражена</small><strong>{typicalDay ? `${typicalDay}-й день цикла` : "Пока неизвестно"}</strong></p><p><small>Частое место</small><strong>{common(locations) ?? "Не указано"}</strong></p><p><small>Частый характер</small><strong>{common(types) ?? "Не указано"}</strong></p></div><small className="p1-basis">Основано на {painEntries.length} фактических отметках боли в {recent.length} циклах.</small></>;
}

function CycleHistoryList({ cycles, selectedStart, onSelect, limit }: { cycles: CycleRecord[]; selectedStart?: string; onSelect: (cycle: CycleRecord) => void; limit?: number }) {
  const visible = limit ? cycles.slice(0, limit) : cycles;
  return <div className={styles.historyTable}>
    <div className={styles.historyHead} aria-hidden="true"><span>Начало цикла</span><span>Длина</span><span>Месячные</span><span /></div>
    {visible.map((cycle) => <button
      aria-pressed={selectedStart === cycle.start}
      className={styles.historyRow}
      key={cycle.start}
      onClick={() => onSelect(cycle)}
      type="button"
    >
      <i aria-hidden="true" />
      <span><strong>{formatCycleDate(cycle.start)}{cycle.current ? " · текущий" : ""}</strong><small>{cycle.current ? `Сейчас ${cycle.length}-й день` : cycle.end ? `до ${formatCycleDate(cycle.end)}` : "Дата окончания не отмечена"}</small></span>
      <b>{cycle.current ? `${cycle.length}-й день` : formatDays(cycle.length)}</b>
      <span><strong>{cycle.periodDays ? formatDays(cycle.periodDays) : "Нет данных"}</strong><small>длительность</small></span>
      <ChevronRight aria-hidden="true" />
    </button>)}
  </div>;
}

function SelectedCycleData({ cycle }: { cycle?: CycleRecord }) {
  if (!cycle) return <div className={styles.selectedEmpty}>Выберите цикл, чтобы посмотреть его данные.</div>;
  const painEntries = cycle.entries.filter((entry) => (entry.pain ?? 0) > 0);
  const notes = cycle.entries.filter((entry) => entry.notes?.trim());
  const maxPain = painEntries.length ? Math.max(...painEntries.map((entry) => entry.pain ?? 0)) : undefined;
  return <div className={styles.selectedData}>
    <div><span>Месячные</span><strong>{cycle.periodDays ? formatDays(cycle.periodDays) : "Нет отметок"}</strong><small>{cycle.entries.filter((entry) => entry.period).length ? `${formatCycleDate(cycle.start)} · фактические записи` : "Добавьте данные в дневнике"}</small></div>
    <div><span>Записи о боли</span><strong>{painEntries.length ? `${painEntries.length} ${painEntries.length === 1 ? "запись" : "записи"}` : "Нет отметок"}</strong><small>{maxPain ? `максимум ${maxPain} из 10` : "Боль не отмечена"}</small></div>
    <div><span>Заметки</span><strong>{notes.length ? `${notes.length} ${notes.length === 1 ? "запись" : "записи"}` : "Нет заметок"}</strong><small>{notes.at(-1)?.notes ?? "Можно добавить в дневнике"}</small></div>
  </div>;
}

function PhaseTimeline({ progress }: { progress: number }) {
  return <div className={styles.phaseTimeline} aria-label={`Пройдено около ${Math.round(progress)}% текущего цикла`}>
    <div className={styles.phaseLabels}><span><strong>Месячные</strong><small>1–5 день</small></span><span><strong>Фолликулярная фаза</strong><small>6–14 день</small></span><span><strong>Овуляция</strong><small>15–17 день</small></span><span><strong>Лютеиновая фаза</strong><small>18–28 день</small></span></div>
    <div className={styles.phaseTrack}><i /><i /><i /><i /><b style={{ left: `${progress}%` }}><span className="sr-only">Сегодня</span></b></div>
  </div>;
}

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [selectedPeriod, setSelectedPeriod] = useState<CyclePeriod>("6m");
  const [selectedCycleStart, setSelectedCycleStart] = useState<string>();
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "data">("overview");
  const loadProfile = () => {
    setLoadState("loading");
    void getProfile().then((nextProfile) => {
      setProfile(nextProfile);
      setLoadState("ready");
    }).catch(() => setLoadState("error"));
  };
  useEffect(() => { void getProfile().then((nextProfile) => { setProfile(nextProfile); setLoadState("ready"); }).catch(() => setLoadState("error")); }, []);

  const cycleHistory = useMemo(() => buildCycleHistorySummary(profile?.entries ?? []), [profile]);
  const { cycles, completed, current } = cycleHistory;
  const historyRows = useMemo(() => [...(current ? [current] : []), ...completed.slice().reverse()], [completed, current]);
  const todayKey = new Date().toISOString().slice(0, 10);
  const periodStats = useMemo(() => buildCyclePeriodStats(completed, selectedPeriod, todayKey), [completed, selectedPeriod, todayKey]);
  const chartCycles = periodStats.cycles;
  const recentTrackedCycles = cycles.slice(-3);
  const personalRange = periodStats.range ? `${periodStats.range.min}–${periodStats.range.max} дней` : "—";
  const rhythm = getRhythmInsight(periodStats.cycles);
  const attention = buildCycleAttention(periodStats.cycles);
  const reliability = buildCycleReliability(periodStats.completedCount);
  const selectedCycle = historyRows.find((cycle) => cycle.start === selectedCycleStart) ?? historyRows[0];
  const forecast = calculateCycle({
    entries: profile?.entries ?? [],
    lastPeriod: profile?.lastPeriod,
    cycleLength: profile?.cycleLength,
    periodLength: profile?.periodLength,
    cyclePattern: profile?.cyclePattern,
    today: todayKey,
  });
  const progress = forecast.cycleDay
    ? Math.min(100, Math.max(2, (forecast.cycleDay / Math.max(1, forecast.cycleLength)) * 100))
    : 2;

  const insight = attention
    ? { label: "Обратите внимание", title: attention.title, text: attention.text, tone: "attention" }
    : { label: "Mira заметила", title: rhythm.title, text: rhythm.text, tone: rhythm.tone };
  const periodOptions = [["3m", "3 мес."], ["6m", "6 мес."], ["12m", "12 мес."], ["all", "Всё"]] as const;

  if (loadState === "loading") return <main className={cn("analytics-page cycles-product-page", styles.page)}><div className={cn("analytics-shell", styles.shell)}><AppPageState kind="loading" title="Загружаем историю цикла" text="Собираем ваши сохранённые отметки." /></div><AppTabBar active="analytics" /></main>;
  if (loadState === "error") return <main className={cn("analytics-page cycles-product-page", styles.page)}><div className={cn("analytics-shell", styles.shell)}><AppPageState kind="error" title="Не удалось загрузить историю" text="Проверьте подключение и попробуйте ещё раз." onRetry={loadProfile} /></div><AppTabBar active="analytics" /></main>;

  return <main className={cn("analytics-page cycles-product-page", styles.page)}><div className={cn("analytics-shell", styles.shell)}>
    <header className={styles.hero}>
      <div className={styles.heroCopy}><small>Мой цикл</small><h1>{forecast.cycleDay ? `${forecast.cycleDay}-й день` : "Мой цикл"}</h1><h2>{forecast.phase ? phaseLabels[forecast.phase] : "Прогноз формируется"}</h2><Link className={cn(buttonVariants({ variant: "outline", size: "xs" }), styles.todayButton)} href={`/diary?date=${todayKey}`}><Plus />Отметить сегодня</Link></div>
      <div className={styles.forecast}><CalendarDays /><div><small>Следующие месячные</small><strong>{formatPredictionRange(forecast.rangeStart, forecast.rangeEnd)}</strong><span>на основе {forecast.completedCycles} завершённых циклов</span><b>{reliability.label.toLowerCase()}</b></div></div>
    </header>
    {!cycles.length ? <section className="analytics-empty"><Sparkles /><h2>Пока нет завершённых циклов</h2><p>Отметьте начало месячных в календаре — здесь появится история.</p><Link href="/calendar?action=period">Отметить месячные</Link></section> : <>
      <PhaseTimeline progress={progress} />
      <Tabs className={styles.tabs} value={activeTab} onValueChange={(value) => value && setActiveTab(value as typeof activeTab)}>
        <TabsList className={styles.tabsList} variant="line"><TabsTrigger value="overview">Обзор</TabsTrigger><TabsTrigger value="history">История</TabsTrigger><TabsTrigger value="data">Данные</TabsTrigger></TabsList>
        <TabsContent className={styles.tabContent} value="overview">
          {periodStats.completedCount ? <>
            <div className={styles.analysisGrid}>
              <section className={styles.chartPanel}><header><div><h2>Длина цикла</h2><p>Последние {Math.min(chartCycles.length, 6)} завершённых цикла</p></div><span>{selectedPeriod === "all" ? "Вся история" : periodOptions.find(([value]) => value === selectedPeriod)?.[1]}</span></header><CycleOverviewChart cycles={chartCycles} /></section>
              <aside className={cn(styles.insightPanel, insight.tone === "attention" && styles.insightAttention)}><Sparkles /><small>{insight.label}</small><h2>{insight.title}</h2><p>{insight.text}</p><div><strong>{reliability.label}</strong><span>{reliability.text}</span></div>{attention && <Link href={`/analytics/cycles/${attention.cycleStart}`}>Посмотреть цикл <ChevronRight /></Link>}</aside>
            </div>
            <section className={styles.metricsBand} aria-label="Показатели за выбранный период">
              <article><CalendarDays /><div><strong>{formatAverageDays(periodStats.averageCycleLength)}</strong><span>средняя длина цикла</span></div></article>
              <article><Droplet /><div><strong>{formatAverageDays(periodStats.averagePeriodLength)}</strong><span>средняя длительность месячных</span></div></article>
              <article><TrendingUp /><div><strong>{personalRange}</strong><span>личный диапазон цикла</span></div></article>
              <ToggleGroup aria-label="Период аналитики" className={styles.periodToggle} onValueChange={(values) => { const next = values.at(-1) as CyclePeriod | undefined; if (next) setSelectedPeriod(next); }} spacing={0} value={[selectedPeriod]} variant="outline">
                {periodOptions.map(([value, label]) => <ToggleGroupItem aria-label={`Показать ${label}`} key={value} value={value}>{label}</ToggleGroupItem>)}
              </ToggleGroup>
            </section>
          </> : <section className={styles.periodEmpty}><TrendingUp /><div><strong>В этом периоде нет завершённых циклов</strong><p>Выберите больший период, чтобы увидеть сохранённую историю.</p></div><button onClick={() => setSelectedPeriod("all")} type="button">Показать всю историю</button></section>}
          <div className={styles.detailGrid}>
            <section className={styles.historyPanel}><header><h2>История циклов</h2><Link href="/analytics/cycles">Все циклы <ChevronRight /></Link></header><CycleHistoryList cycles={historyRows} limit={3} onSelect={(cycle) => setSelectedCycleStart(cycle.start)} selectedStart={selectedCycle?.start} /></section>
            <section className={styles.selectedPanel}><header><h2>Данные выбранного цикла</h2><span>{selectedCycle ? formatCycleDate(selectedCycle.start) : "—"}</span></header><SelectedCycleData cycle={selectedCycle} /></section>
          </div>
          <div className={styles.bottomActions}>
            <Accordion className={styles.detailsAccordion}>
              <AccordionItem value="details"><AccordionTrigger className={styles.detailsTrigger}><span><ListFilter />Подробные отметки</span></AccordionTrigger><AccordionContent className={styles.detailsContent}><section className="p1-analytics-card"><header><div><small>Фактические данные</small><h2>Интенсивность месячных</h2><p>Сравнение последних циклов по дням.</p></div><span><Droplet /></span></header><FlowHeatmap cycles={recentTrackedCycles} /></section><section className="p1-analytics-card"><header><div><small>Фактические данные</small><h2>Боль по дням цикла</h2><p>Чем насыщеннее точка, тем сильнее отмеченная боль.</p></div><span className="pain"><HeartPulse /></span></header><PainMap cycles={recentTrackedCycles} /></section></AccordionContent></AccordionItem>
            </Accordion>
            <Link className={cn(buttonVariants({ variant: "outline" }), styles.reportButton)} href="/analytics/report"><FileHeart />Подготовить отчёт врачу</Link>
          </div>
        </TabsContent>
        <TabsContent className={styles.tabContent} value="history"><section className={styles.historyPanel}><header><div><h2>История циклов</h2><p>Текущий и завершённые циклы в хронологическом порядке.</p></div><Link href="/analytics/cycles">Открыть полный список <ChevronRight /></Link></header><CycleHistoryList cycles={historyRows} onSelect={(cycle) => setSelectedCycleStart(cycle.start)} selectedStart={selectedCycle?.start} /></section><section className={styles.chartPanel}><header><div><h2>Динамика завершённых циклов</h2><p>Текущий цикл не влияет на сравнение.</p></div></header><CycleOverviewChart cycles={chartCycles} /></section></TabsContent>
        <TabsContent className={styles.tabContent} value="data"><section className={styles.selectedPanel}><header><h2>Данные выбранного цикла</h2><Link href={`/analytics/cycles/${selectedCycle?.start ?? ""}`}>Открыть цикл <ChevronRight /></Link></header><SelectedCycleData cycle={selectedCycle} /></section><Accordion className={styles.detailsAccordion} defaultValue={["flow"]} multiple><AccordionItem value="flow"><AccordionTrigger>Интенсивность месячных</AccordionTrigger><AccordionContent className={styles.detailsContent}><section className="p1-analytics-card"><FlowHeatmap cycles={recentTrackedCycles} /></section></AccordionContent></AccordionItem><AccordionItem value="pain"><AccordionTrigger>Боль по дням цикла</AccordionTrigger><AccordionContent className={styles.detailsContent}><section className="p1-analytics-card"><PainMap cycles={recentTrackedCycles} /></section></AccordionContent></AccordionItem></Accordion></TabsContent>
      </Tabs>
    </>}
  </div><AppTabBar active="analytics" /></main>;
}
