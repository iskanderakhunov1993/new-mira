"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BedDouble, CalendarDays, ChevronRight, Droplet, FileHeart, HeartPulse, Sparkles, TrendingUp } from "lucide-react";
import { AppTabBar } from "@/components/AppTabBar";
import { getProfile, MiraProfile } from "@/lib/demo-session";
import { buildCycles, CycleRecord, formatCycleDate } from "@/lib/cycle-analytics";

const flowLabels = { spotting: "Мажущие", light: "Слабые", medium: "Средние", heavy: "Обильные" } as const;

function CycleDots({ cycle }: { cycle: CycleRecord }) {
  return <div className="cycle-dots" aria-label={`${cycle.periodDays} дней месячных`}>{Array.from({ length: Math.min(cycle.length, 35) }, (_, index) => <i className={index < cycle.periodDays ? "period" : ""} key={index} />)}</div>;
}

function CycleChart({ cycles }: { cycles: CycleRecord[] }) {
  const values = cycles.map((cycle) => cycle.length);
  if (values.length < 2) return <div className="cycle-chart-empty">Добавьте ещё один завершённый цикл, чтобы увидеть динамику.</div>;
  const min = Math.min(...values) - 2; const max = Math.max(...values) + 2;
  const points = values.map((value, index) => ({ x: 35 + index * (330 / Math.max(1, values.length - 1)), y: 155 - ((value - min) / Math.max(1, max - min)) * 115, value }));
  return <div className="cycle-chart"><svg viewBox="0 0 400 190" role="img" aria-label="Динамика длины циклов"><rect className="chart-range" x="30" y="55" width="345" height="85" rx="14" /><path className="chart-grid" d="M30 40H375M30 97H375M30 155H375" /><polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} /><g>{points.map((point, index) => <Link href={`/analytics/cycles/${cycles[index].start}`} key={cycles[index].start}><circle cx={point.x} cy={point.y} r="7" /><text x={point.x} y={point.y - 14} textAnchor="middle">{point.value}</text></Link>)}</g></svg><div className="chart-labels">{cycles.map((cycle) => <span key={cycle.start}>{formatCycleDate(cycle.start)}</span>)}</div></div>;
}

function average(values: number[]) { return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined; }

function CycleComparison({ cycles }: { cycles: CycleRecord[] }) {
  const rows = [
    { label: "Длина", values: cycles.map((cycle) => `${cycle.length} дн.`) },
    { label: "Боль", values: cycles.map((cycle) => { const value = average(cycle.entries.map((entry) => entry.pain).filter((value): value is number => value !== undefined)); return value ? `${value.toFixed(1)} / 10` : "—"; }) },
    { label: "Сон", values: cycles.map((cycle) => { const value = average(cycle.entries.map((entry) => entry.sleepHours).filter((value): value is number => value !== undefined)); return value ? `${value.toFixed(1)} ч` : "—"; }) },
  ];
  return <section className="cycle-comparison"><header><div><small>Последние записи</small><h2>Сравнение циклов</h2></div><span>{cycles.length} цикла</span></header><div className="cycle-comparison-table"><div className="cycle-comparison-head"><span /><>{cycles.map((cycle) => <b key={cycle.start}>{formatCycleDate(cycle.start)}</b>)}</></div>{rows.map((row) => <div className="cycle-comparison-row" key={row.label}><strong>{row.label}</strong>{row.values.map((value, index) => <span key={`${row.label}-${index}`}>{value}</span>)}</div>)}</div></section>;
}

function FlowHeatmap({ cycles }: { cycles: CycleRecord[] }) {
  const recent = cycles.filter((cycle) => cycle.entries.some((entry) => entry.period)).slice(-3);
  if (!recent.length) return <div className="p1-empty">Отметьте интенсивность хотя бы одного дня месячных — здесь появится карта.</div>;
  const maxDays = Math.min(10, Math.max(5, ...recent.map((cycle) => cycle.periodDays)));
  const columns = { gridTemplateColumns: `70px repeat(${maxDays}, minmax(28px, 1fr))` };
  return <div className="flow-heatmap"><div className="p1-grid-head" style={columns}><span>Цикл</span>{Array.from({ length: maxDays }, (_, index) => <b key={index}>{index + 1}</b>)}</div>{recent.map((cycle) => { const entries = cycle.entries.filter((entry) => entry.period).sort((a, b) => a.date.localeCompare(b.date)); return <div className="flow-heatmap-row" style={columns} key={cycle.start}><span>{formatCycleDate(cycle.start)}</span>{Array.from({ length: maxDays }, (_, index) => { const entry = entries[index]; const flags = entry ? [entry.periodClots && "сгустки", entry.periodLeak && "протекание", entry.periodNightChange && "смена ночью", entry.periodHourlyChange && "смена каждый час"].filter(Boolean).join(", ") : ""; return entry?.period ? <Link className={`${entry.period} ${flags ? "has-flags" : ""}`} href={`/diary?section=period&date=${entry.date}`} title={`${flowLabels[entry.period]}${flags ? ` · ${flags}` : ""}`} aria-label={`${index + 1}-й день: ${flowLabels[entry.period]}${flags ? `, ${flags}` : ""}`} key={index}><i /></Link> : <i className="empty" key={index} />; })}</div>; })}<footer><span><i className="spotting" />Мажущие</span><span><i className="light" />Слабые</span><span><i className="medium" />Средние</span><span><i className="heavy" />Обильные</span><span><i className="flag" />Есть дополнительная отметка</span></footer></div>;
}

function PainMap({ cycles }: { cycles: CycleRecord[] }) {
  const recent = cycles.filter((cycle) => cycle.entries.some((entry) => (entry.pain ?? 0) > 0)).slice(-3);
  const painEntries = recent.flatMap((cycle) => cycle.entries.filter((entry) => (entry.pain ?? 0) > 0));
  if (!painEntries.length) return <div className="p1-empty">Отметьте интенсивность боли — Mira покажет её положение в цикле.</div>;
  const byDay = new Map<number, number[]>();
  recent.forEach((cycle) => cycle.entries.forEach((entry) => { if (!entry.pain) return; const day = Math.floor((new Date(`${entry.date}T12:00:00`).getTime() - new Date(`${cycle.start}T12:00:00`).getTime()) / 86400000) + 1; byDay.set(day, [...(byDay.get(day) ?? []), entry.pain]); }));
  const typicalDay = [...byDay.entries()].sort((a, b) => (b[1].reduce((sum, value) => sum + value, 0) / b[1].length) - (a[1].reduce((sum, value) => sum + value, 0) / a[1].length))[0]?.[0];
  const locations = painEntries.flatMap((entry) => entry.painLocations ?? []);
  const types = painEntries.flatMap((entry) => entry.painTypes ?? []);
  const common = (values: string[]) => [...new Set(values)].sort((a, b) => values.filter((value) => value === b).length - values.filter((value) => value === a).length)[0];
  return <><div className="pain-map"><div className="pain-map-scale"><span>Цикл</span><b>1</b><b>7</b><b>14</b><b>21</b><b>28</b></div>{recent.map((cycle) => <div className="pain-map-row" key={cycle.start}><span>{formatCycleDate(cycle.start)}</span><div>{Array.from({ length: 28 }, (_, index) => { const day = index + 1; const entry = cycle.entries.find((item) => item.date === new Date(new Date(`${cycle.start}T12:00:00`).getTime() + index * 86400000).toISOString().slice(0, 10)); const value = entry?.pain ?? 0; return value ? <Link className={value >= 7 ? "high" : value >= 4 ? "medium" : "low"} href={`/diary?section=period&date=${entry!.date}`} title={`${day}-й день · боль ${value}/10`} aria-label={`${day}-й день цикла: боль ${value} из 10`} key={day} /> : <i key={day} />; })}</div></div>)}</div><div className="pain-map-facts"><p><small>Чаще выражена</small><strong>{typicalDay ? `${typicalDay}-й день цикла` : "Пока неизвестно"}</strong></p><p><small>Частое место</small><strong>{common(locations) ?? "Не указано"}</strong></p><p><small>Частый характер</small><strong>{common(types) ?? "Не указано"}</strong></p></div><small className="p1-basis">Основано на {painEntries.length} фактических отметках боли в {recent.length} циклах.</small></>;
}

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  useEffect(() => { void getProfile().then(setProfile).catch(() => setProfile(null)); }, []);
  const cycles = useMemo(() => buildCycles(profile?.entries ?? []), [profile]);
  const completed = cycles.filter((cycle) => !cycle.current);
  const current = cycles.find((cycle) => cycle.current);
  const lengths = completed.map((cycle) => cycle.length);
  const periodAverage = completed.length ? Math.round(completed.reduce((sum, cycle) => sum + cycle.periodDays, 0) / completed.length) : profile?.periodLength ?? 5;
  const chartCycles = completed.slice(-6);
  const stable = lengths.length >= 3 && Math.max(...lengths) - Math.min(...lengths) <= 3;
  const recentTrackedCycles = cycles.slice(-3);
  const comparisonCycles = completed.slice(-3).reverse();
  const averagePain = average(comparisonCycles.flatMap((cycle) => cycle.entries.map((entry) => entry.pain).filter((value): value is number => value !== undefined)));
  const averageSleep = average(comparisonCycles.flatMap((cycle) => cycle.entries.map((entry) => entry.sleepHours).filter((value): value is number => value !== undefined)));

  return <main className="analytics-page cycles-product-page"><div className="analytics-shell"><header className="analytics-header"><div><small>История и динамика</small><h1>Мой цикл</h1><p>Факты и сравнение последних циклов.</p></div><span><TrendingUp /></span></header>
    {!cycles.length ? <section className="analytics-empty"><Sparkles /><h2>Пока нет завершённых циклов</h2><p>Отметьте начало месячных в календаре — здесь появится история.</p><Link href="/calendar?action=period">Отметить месячные</Link></section> : <>
      <section className="cycle-status-card"><Sparkles /><div><small>Ваш ритм</small><h2>{lengths.length < 3 ? "Пока собираем историю" : stable ? "Цикл близок к обычному" : "Длина циклов меняется"}</h2><p>{lengths.length < 3 ? `Есть ${completed.length} из 3 циклов для сравнения.` : `Последние ${completed.length} цикла ${stable ? "укладываются в ваш обычный диапазон" : "отличаются друг от друга"}.`}</p></div></section>
      <section className="cycle-summary-grid"><article><CalendarDays /><strong>{comparisonCycles.length ? `${Math.round(average(comparisonCycles.map((cycle) => cycle.length)) ?? 0)} дней` : "—"}</strong><span>типичная длина</span></article><article><Droplet /><strong>{periodAverage} дней</strong><span>месячные</span></article><article><HeartPulse /><strong>{averagePain ? `${averagePain.toFixed(1)} / 10` : "—"}</strong><span>средняя боль</span></article><article><BedDouble /><strong>{averageSleep ? `${averageSleep.toFixed(1)} ч` : "—"}</strong><span>средний сон</span></article></section>
      {comparisonCycles.length ? <CycleComparison cycles={comparisonCycles} /> : null}
      <section className="cycle-dynamics-card redesigned"><header><div><small>Только завершённые циклы</small><h2>Динамика длины цикла</h2></div><span>Обычный диапазон</span></header><CycleChart cycles={chartCycles} /><footer><strong>{lengths.length < 3 ? "Пока мало данных для вывода" : stable ? "Циклы отличаются не более чем на 3 дня" : "На графике видны изменения длины"}</strong><span>Нажмите на точку, чтобы открыть цикл.</span></footer></section>
      <section className="cycle-history-preview"><header><h2>История циклов</h2><Link href="/analytics/cycles">Все циклы <ChevronRight /></Link></header><div>{[...(current ? [current] : []), ...completed.slice(-2).reverse()].map((cycle) => <Link href={`/analytics/cycles/${cycle.start}`} key={cycle.start}><div><strong>{cycle.current ? `Текущий цикл: ${cycle.length} день` : `${cycle.length} дней`}</strong><span>{cycle.current ? `Начался ${formatCycleDate(cycle.start)}` : `${formatCycleDate(cycle.start)} — ${formatCycleDate(cycle.end)}`}</span><CycleDots cycle={cycle} /></div><ChevronRight /></Link>)}</div></section>
      <details className="cycle-more-data"><summary>Подробные отметки <ChevronRight /></summary><section className="p1-analytics-card"><header><div><small>Фактические данные</small><h2>Интенсивность месячных</h2><p>Сравнение последних циклов по дням.</p></div><span><Droplet /></span></header><FlowHeatmap cycles={recentTrackedCycles} /></section><section className="p1-analytics-card"><header><div><small>Фактические данные</small><h2>Боль по дням цикла</h2><p>Чем насыщеннее точка, тем сильнее отмеченная боль.</p></div><span className="pain"><HeartPulse /></span></header><PainMap cycles={recentTrackedCycles} /></section></details>
      <Link className="doctor-report-entry" href="/analytics/report"><span><FileHeart /></span><div><small>Для консультации</small><h2>Отчёт для врача</h2><p>Соберите факты о циклах и симптомах. Вы сами решаете, что включить.</p></div><ChevronRight /></Link>
    </>}
  </div><AppTabBar active="analytics" /></main>;
}
