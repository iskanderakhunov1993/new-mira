"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronRight, Droplet, FileHeart, HeartPulse, Sparkles, TrendingUp } from "lucide-react";
import { AppTabBar } from "@/components/AppTabBar";
import { AppPageState } from "@/components/AppPageState";
import { getProfile, MiraProfile } from "@/lib/demo-session";
import { buildCycleHistorySummary, CycleRecord, daysBetween, formatCycleDate } from "@/lib/cycle-analytics";

const flowLabels = { spotting: "Мажущие", light: "Слабые", medium: "Средние", heavy: "Обильные" } as const;

function formatDays(value: number) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  const word = mod10 === 1 && mod100 !== 11 ? "день" : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "дня" : "дней";
  return `${value} ${word}`;
}

function CycleDots({ cycle }: { cycle: CycleRecord }) {
  const periodDays = new Set(cycle.entries.filter((entry) => entry.period).map((entry) => daysBetween(cycle.start, entry.date)));
  return <div className="cycle-dots" aria-label={`${formatDays(cycle.periodDays)} месячных`}>{Array.from({ length: Math.min(cycle.length, 35) }, (_, index) => <i className={periodDays.has(index) ? "period" : ""} key={index} />)}</div>;
}

function CycleChart({ cycles }: { cycles: CycleRecord[] }) {
  const values = cycles.map((cycle) => cycle.length);
  if (values.length < 2) return <div className="cycle-chart-empty">Добавьте ещё один завершённый цикл, чтобы увидеть динамику.</div>;
  const min = Math.min(...values) - 2; const max = Math.max(...values) + 2;
  const yFor = (value: number) => 155 - ((value - min) / Math.max(1, max - min)) * 115;
  const points = values.map((value, index) => ({ x: 35 + index * (330 / Math.max(1, values.length - 1)), y: yFor(value), value }));
  const comparisonValues = values.length >= 4 ? values.slice(-4, -1) : values;
  const rangeMin = Math.min(...comparisonValues);
  const rangeMax = Math.max(...comparisonValues);
  const rangeTop = yFor(rangeMax);
  const rangeHeight = Math.max(12, yFor(rangeMin) - rangeTop);
  const latestOutsideRange = values.length >= 4 && (values.at(-1)! < rangeMin || values.at(-1)! > rangeMax);
  return <div className="cycle-chart"><svg viewBox="0 0 400 190" role="img" aria-label="Динамика длины завершённых циклов"><rect className="chart-range" x="30" y={rangeTop} width="345" height={rangeHeight} rx="10" /><path className="chart-grid" d="M30 40H375M30 97H375M30 155H375" /><polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} /><g>{points.map((point, index) => <Link href={`/analytics/cycles/${cycles[index].start}`} key={cycles[index].start}><circle className={latestOutsideRange && index === points.length - 1 ? "attention" : undefined} cx={point.x} cy={point.y} r="7" /><text x={point.x} y={point.y - 14} textAnchor="middle">{point.value}</text></Link>)}</g></svg><div className="chart-labels">{cycles.map((cycle) => <span key={cycle.start}>{formatCycleDate(cycle.start)}</span>)}</div><div className="cycle-chart-legend"><i />Ваш диапазон по предыдущим циклам</div></div>;
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
  return {
    tone: "attention",
    title: "Последний цикл отличался от предыдущих",
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
  const loadProfile = () => {
    setLoadState("loading");
    void getProfile().then((nextProfile) => {
      setProfile(nextProfile);
      setLoadState("ready");
    }).catch(() => setLoadState("error"));
  };
  useEffect(() => { void getProfile().then((nextProfile) => { setProfile(nextProfile); setLoadState("ready"); }).catch(() => setLoadState("error")); }, []);

  const cycleHistory = useMemo(() => buildCycleHistorySummary(profile?.entries ?? []), [profile]);
  const { cycles, completed, current, latestCompleted, recentRange } = cycleHistory;
  const chartCycles = completed.slice(-6);
  const recentTrackedCycles = cycles.slice(-3);
  const personalRange = recentRange
    ? `${recentRange.min}–${recentRange.max} дней`
    : "—";
  const rhythm = getRhythmInsight(completed);

  if (loadState === "loading") return <main className="analytics-page cycles-product-page"><div className="analytics-shell"><AppPageState kind="loading" title="Загружаем историю цикла" text="Собираем ваши сохранённые отметки." /></div><AppTabBar active="analytics" /></main>;
  if (loadState === "error") return <main className="analytics-page cycles-product-page"><div className="analytics-shell"><AppPageState kind="error" title="Не удалось загрузить историю" text="Проверьте подключение и попробуйте ещё раз." onRetry={loadProfile} /></div><AppTabBar active="analytics" /></main>;

  return <main className="analytics-page cycles-product-page"><div className="analytics-shell"><header className="analytics-header"><div><small>История и динамика</small><h1>Мой цикл</h1><p>Факты и сравнение последних циклов.</p></div><span><TrendingUp /></span></header>
    {!cycles.length ? <section className="analytics-empty"><Sparkles /><h2>Пока нет завершённых циклов</h2><p>Отметьте начало месячных в календаре — здесь появится история.</p><Link href="/calendar?action=period">Отметить месячные</Link></section> : <>
      <section className={`cycle-status-card ${rhythm.tone}`}><Sparkles /><div><small>Ваш ритм</small><h2>{rhythm.title}</h2><p>{rhythm.text}</p><span>{rhythm.basis}</span></div></section>
      <section className="cycle-summary-grid"><article><CalendarDays /><strong>{latestCompleted ? formatDays(latestCompleted.length) : "—"}</strong><span>предыдущий цикл</span></article><article><Droplet /><strong>{latestCompleted?.periodDays ? formatDays(latestCompleted.periodDays) : "—"}</strong><span>отмеченные месячные</span></article><article><TrendingUp /><strong>{personalRange}</strong><span>{recentRange ? "диапазон последних 3 циклов" : "появится после 3 циклов"}</span></article></section>
      <section className="cycle-history-preview"><header><h2>История циклов</h2><Link href="/analytics/cycles">Все циклы <ChevronRight /></Link></header><div>{[...(current ? [current] : []), ...completed.slice(-2).reverse()].map((cycle) => <Link href={`/analytics/cycles/${cycle.start}`} key={cycle.start}><div><strong>{cycle.current ? `Текущий цикл: ${cycle.length}-й день` : formatDays(cycle.length)}</strong><span>{cycle.current ? `Начался ${formatCycleDate(cycle.start)}` : `${formatCycleDate(cycle.start)} — ${formatCycleDate(cycle.end)}`}</span><CycleDots cycle={cycle} /></div><ChevronRight /></Link>)}</div></section>
      <section className="cycle-dynamics-card redesigned"><header><div><small>Только завершённые циклы</small><h2>Динамика длины цикла</h2></div><span>{chartCycles.length} из истории</span></header><CycleChart cycles={chartCycles} /><footer><strong>{rhythm.title}</strong><span>{chartCycles.length >= 2 ? `${rhythm.text} Нажмите на точку, чтобы открыть цикл.` : "Динамика появится после второго завершённого цикла."}</span></footer></section>
      <details className="cycle-more-data"><summary>Подробные отметки <ChevronRight /></summary><section className="p1-analytics-card"><header><div><small>Фактические данные</small><h2>Интенсивность месячных</h2><p>Сравнение последних циклов по дням.</p></div><span><Droplet /></span></header><FlowHeatmap cycles={recentTrackedCycles} /></section><section className="p1-analytics-card"><header><div><small>Фактические данные</small><h2>Боль по дням цикла</h2><p>Чем насыщеннее точка, тем сильнее отмеченная боль.</p></div><span className="pain"><HeartPulse /></span></header><PainMap cycles={recentTrackedCycles} /></section></details>
      <Link className="doctor-report-entry" href="/analytics/report"><span><FileHeart /></span><div><small>Для консультации</small><h2>Отчёт для врача</h2><p>Соберите факты о циклах и симптомах. Вы сами решаете, что включить.</p></div><ChevronRight /></Link>
    </>}
  </div><AppTabBar active="analytics" /></main>;
}
