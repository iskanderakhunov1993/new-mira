"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronRight, CircleHelp, Droplet, FileHeart, HeartPulse, MoonStar, Pill, Plus, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { AppTabBar } from "@/components/AppTabBar";
import { AppPageState } from "@/components/AppPageState";
import { CycleTrendCard } from "@/components/CycleTrendCard";
import { getProfile, MiraProfile } from "@/lib/demo-session";
import { buildCycleHistorySummary, CycleRecord, daysBetween, formatCycleDate } from "@/lib/cycle-analytics";
import { calculateCycle } from "@/lib/domain/cycle-engine";
import { buildCycleAttention, buildCyclePeriodStats, buildCycleReliability, type CyclePeriod } from "@/lib/domain/cycle-period-stats";

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

function CycleDots({ cycle }: { cycle: CycleRecord }) {
  const periodDays = new Set(cycle.entries.filter((entry) => entry.period).map((entry) => daysBetween(cycle.start, entry.date)));
  return <div className="cycle-dots" aria-label={`${formatDays(cycle.periodDays)} месячных`}>{Array.from({ length: Math.min(cycle.length, 35) }, (_, index) => <i className={periodDays.has(index) ? "period" : ""} key={index} />)}</div>;
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

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [selectedPeriod, setSelectedPeriod] = useState<CyclePeriod>("6m");
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
  const todayKey = new Date().toISOString().slice(0, 10);
  const periodStats = useMemo(() => buildCyclePeriodStats(completed, selectedPeriod, todayKey), [completed, selectedPeriod, todayKey]);
  const chartCycles = periodStats.cycles;
  const recentTrackedCycles = cycles.slice(-3);
  const personalRange = periodStats.range ? `${periodStats.range.min}–${periodStats.range.max} дней` : "—";
  const rhythm = getRhythmInsight(periodStats.cycles);
  const attention = buildCycleAttention(periodStats.cycles);
  const reliability = buildCycleReliability(periodStats.completedCount);
  const forecast = calculateCycle({
    entries: profile?.entries ?? [],
    lastPeriod: profile?.lastPeriod,
    cycleLength: profile?.cycleLength,
    periodLength: profile?.periodLength,
    cyclePattern: profile?.cyclePattern,
    today: todayKey,
  });
  const todayEntry = profile?.entries?.find((entry) => entry.date === todayKey);
  const progress = forecast.cycleDay
    ? Math.min(100, Math.max(2, (forecast.cycleDay / Math.max(1, forecast.cycleLength)) * 100))
    : 2;
  const todayFacts = [
    todayEntry?.pain !== undefined && todayEntry.pain > 0
      ? { icon: HeartPulse, label: "Боль", value: `${todayEntry.pain} из 10` }
      : undefined,
    todayEntry?.energy
      ? { icon: Sparkles, label: "Энергия", value: todayEntry.energy === "low" ? "Низкая" : todayEntry.energy === "high" ? "Высокая" : "Обычная" }
      : undefined,
    todayEntry?.sleepHours !== undefined
      ? { icon: MoonStar, label: "Сон", value: `${todayEntry.sleepHours.toLocaleString("ru-RU")} ч` }
      : undefined,
    todayEntry?.medicationIntakes?.length
      ? { icon: Pill, label: "Лекарства", value: `${todayEntry.medicationIntakes.length} отмечено` }
      : undefined,
  ].filter(Boolean) as { icon: typeof HeartPulse; label: string; value: string }[];

  if (loadState === "loading") return <main className="analytics-page cycles-product-page"><div className="analytics-shell"><AppPageState kind="loading" title="Загружаем историю цикла" text="Собираем ваши сохранённые отметки." /></div><AppTabBar active="analytics" /></main>;
  if (loadState === "error") return <main className="analytics-page cycles-product-page"><div className="analytics-shell"><AppPageState kind="error" title="Не удалось загрузить историю" text="Проверьте подключение и попробуйте ещё раз." onRetry={loadProfile} /></div><AppTabBar active="analytics" /></main>;

  return <main className="analytics-page cycles-product-page cycle-home-page"><div className="analytics-shell"><header className="analytics-header cycle-home-header"><div><small>Мой цикл</small><h1>{forecast.cycleDay ? `${forecast.cycleDay}-й день` : "Мой цикл"}</h1><p>{forecast.phase ? `Предположительно: ${phaseLabels[forecast.phase].toLowerCase()}` : "Отметьте начало месячных, чтобы появился прогноз."}</p></div><Link href="/calendar" aria-label="Открыть календарь"><CalendarDays /></Link></header>
    {!cycles.length ? <section className="analytics-empty"><Sparkles /><h2>Пока нет завершённых циклов</h2><p>Отметьте начало месячных в календаре — здесь появится история.</p><Link href="/calendar?action=period">Отметить месячные</Link></section> : <>
      <section className="cycle-now-card">
        <header><span>Сейчас</span><details><summary aria-label="Как рассчитывается прогноз"><CircleHelp /></summary><p>{forecast.explanation}</p></details></header>
        <h2>{forecast.phase ? phaseLabels[forecast.phase] : "Прогноз формируется"}</h2>
        <p>{forecast.daysUntil !== undefined && forecast.daysUntil >= 0 ? `До следующих месячных ориентировочно ${formatDays(forecast.daysUntil)}` : forecast.delayed ? "Ожидаемая дата прошла — прогноз мог измениться" : "Продолжайте отмечать цикл, чтобы уточнить даты"}</p>
        <div className="cycle-now-track" aria-label={`Пройдено около ${Math.round(progress)}% текущего цикла`}>
          <i className="menstruation" />
          <i className="follicular" />
          <i className="ovulation" />
          <i className="luteal" />
          <b style={{ left: `${progress}%` }}><span>Сегодня</span></b>
        </div>
        <div className="cycle-now-labels"><span>Месячные</span><span>Овуляция</span><span>Следующие</span></div>
        <div className="cycle-next-period"><div><small>Следующие месячные</small><strong>{formatPredictionRange(forecast.rangeStart, forecast.rangeEnd)}</strong></div><span>Прогноз</span></div>
        <footer>Основано на {forecast.completedCycles} {forecast.completedCycles === 1 ? "завершённом цикле" : "завершённых циклах"} · прогноз не является методом контрацепции</footer>
      </section>
      <Link className="cycle-log-today" href={`/diary?date=${todayKey}`}><span><Plus /></span><div><strong>Отметить сегодня</strong><small>Самочувствие, симптомы, сон и лекарства</small></div><ChevronRight /></Link>
      <section className="cycle-today-facts">
        <header><div><small>Сегодня</small><h2>Краткая сводка</h2></div><Link href={`/diary?date=${todayKey}`}>Изменить</Link></header>
        {todayFacts.length ? <div>{todayFacts.map(({ icon: Icon, label, value }) => <article key={label}><Icon /><span><small>{label}</small><strong>{value}</strong></span></article>)}</div> : <div className="cycle-today-empty"><p>Сегодня пока ничего не отмечено.</p><span>Даже одна короткая запись помогает Mira замечать изменения со временем.</span></div>}
      </section>
      <section className="cycle-period-overview" aria-labelledby="cycle-period-title">
        <header><div><small>Завершённые циклы</small><h2 id="cycle-period-title">Обзор за период</h2></div><span>{periodStats.completedCount}</span></header>
        <div className="cycle-period-control" role="group" aria-label="Период аналитики">
          {([["3m", "3 мес"], ["6m", "6 мес"], ["12m", "12 мес"], ["all", "Всё"]] as const).map(([value, label]) => <button aria-pressed={selectedPeriod === value} className={selectedPeriod === value ? "active" : ""} key={value} onClick={() => setSelectedPeriod(value)} type="button">{label}</button>)}
        </div>
      </section>
      {periodStats.completedCount ? <>
        <section className={`cycle-status-card ${rhythm.tone}`}><Sparkles /><div><small>Mira заметила</small><h2>{rhythm.title}</h2><p>{rhythm.text}</p><div className="cycle-reliability"><strong>{reliability.label}</strong><span>{reliability.text}</span></div></div></section>
        <section className="cycle-summary-grid period-metrics"><article><CalendarDays /><strong>{formatAverageDays(periodStats.averageCycleLength)}</strong><span>средняя длина цикла</span></article><article><Droplet /><strong>{formatAverageDays(periodStats.averagePeriodLength)}</strong><span>средняя длительность месячных</span></article><article><TrendingUp /><strong>{personalRange}</strong><span>диапазон за выбранный период</span></article></section>
      </> : <section className="cycle-period-empty"><TrendingUp /><div><strong>В этом периоде нет завершённых циклов</strong><p>Выберите больший период, чтобы увидеть сохранённую историю.</p></div><button onClick={() => setSelectedPeriod("all")} type="button">Показать всю историю</button></section>}
      {attention && <section className="cycle-attention-card"><ShieldAlert /><div><small>Обратите внимание</small><h2>{attention.title}</h2><p>{attention.text}</p><div><Link href={`/analytics/cycles/${attention.cycleStart}`}>Посмотреть цикл</Link><Link href="/analytics/report">Подготовить отчёт</Link></div></div></section>}
      <section className="cycle-history-preview"><header><h2>История циклов</h2><Link href="/analytics/cycles">Все циклы <ChevronRight /></Link></header><div>{[...(current ? [current] : []), ...completed.slice(-2).reverse()].map((cycle) => <Link href={`/analytics/cycles/${cycle.start}`} key={cycle.start}><div><strong>{cycle.current ? `Текущий цикл: ${cycle.length}-й день` : formatDays(cycle.length)}</strong><span>{cycle.current ? `Начался ${formatCycleDate(cycle.start)}` : `${formatCycleDate(cycle.start)} — ${formatCycleDate(cycle.end)}`}</span><CycleDots cycle={cycle} /></div><ChevronRight /></Link>)}</div></section>
      <CycleTrendCard className="analytics-cycle-trend" cycles={chartCycles} maxCycles={12} />
      <details className="cycle-more-data"><summary>Подробные отметки <ChevronRight /></summary><section className="p1-analytics-card"><header><div><small>Фактические данные</small><h2>Интенсивность месячных</h2><p>Сравнение последних циклов по дням.</p></div><span><Droplet /></span></header><FlowHeatmap cycles={recentTrackedCycles} /></section><section className="p1-analytics-card"><header><div><small>Фактические данные</small><h2>Боль по дням цикла</h2><p>Чем насыщеннее точка, тем сильнее отмеченная боль.</p></div><span className="pain"><HeartPulse /></span></header><PainMap cycles={recentTrackedCycles} /></section></details>
      <Link className="doctor-report-entry" href="/analytics/report"><span><FileHeart /></span><div><small>Для консультации</small><h2>Отчёт для врача</h2><p>Соберите факты о циклах и симптомах. Вы сами решаете, что включить.</p></div><ChevronRight /></Link>
      <section className="cycle-free-tools"><header><small>Все функции Mira доступны бесплатно</small><h2>Ваши инструменты</h2></header><div><Link href="/calendar"><CalendarDays /><span><strong>Календарь</strong><small>Записи и прогнозы по дням</small></span><ChevronRight /></Link><Link href="/diary?section=tests"><HeartPulse /><span><strong>Тесты и измерения</strong><small>Температура, тесты и наблюдения</small></span><ChevronRight /></Link><Link href="/diary?section=medication"><Pill /><span><strong>Лекарства</strong><small>Приём, причина и эффект</small></span><ChevronRight /></Link><Link href="/insights"><Sparkles /><span><strong>Инсайты</strong><small>Повторения и сравнение циклов</small></span><ChevronRight /></Link></div></section>
    </>}
  </div><AppTabBar active="analytics" /></main>;
}
