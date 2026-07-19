"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, CircleAlert, Droplet, FileHeart, HeartPulse, Info, Sparkles, TrendingUp } from "lucide-react";
import { AppTabBar } from "@/components/AppTabBar";
import { getProfile, MiraProfile } from "@/lib/demo-session";
import { buildCycles, cycleStatus, CycleRecord, formatCycleDate } from "@/lib/cycle-analytics";

const flowLabels = { spotting: "Мажущие", light: "Слабые", medium: "Средние", heavy: "Обильные" } as const;

function CycleDots({ cycle }: { cycle: CycleRecord }) {
  return <div className="cycle-dots" aria-label={`${cycle.periodDays} дней месячных`}>{Array.from({ length: Math.min(cycle.length, 35) }, (_, index) => <i className={index < cycle.periodDays ? "period" : ""} key={index} />)}</div>;
}

function CycleChart({ cycles }: { cycles: CycleRecord[] }) {
  const values = cycles.map((cycle) => cycle.length);
  if (values.length < 2) return <div className="cycle-chart-empty">Добавьте ещё один завершённый цикл, чтобы увидеть динамику.</div>;
  const min = Math.min(...values) - 2; const max = Math.max(...values) + 2;
  const points = values.map((value, index) => ({ x: 35 + index * (330 / Math.max(1, values.length - 1)), y: 155 - ((value - min) / Math.max(1, max - min)) * 115, value }));
  return <div className="cycle-chart"><svg viewBox="0 0 400 190" role="img" aria-label="Динамика длины циклов"><path className="chart-grid" d="M30 40H375M30 97H375M30 155H375" /><polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} /><g>{points.map((point, index) => <Link href={`/analytics/cycles/${cycles[index].start}`} key={cycles[index].start}><circle cx={point.x} cy={point.y} r="7" /><text x={point.x} y={point.y - 14} textAnchor="middle">{point.value}</text></Link>)}</g></svg><div className="chart-labels">{cycles.map((cycle) => <span key={cycle.start}>{formatCycleDate(cycle.start)}</span>)}</div></div>;
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

function buildMainChange(cycles: CycleRecord[]) {
  const completed = cycles.filter((cycle) => !cycle.current && cycle.entries.some((entry) => entry.period || entry.pain)).slice(-2);
  if (completed.length < 2) return { title: "Пока нужен ещё один завершённый цикл", text: "После следующего цикла Mira сравнит длительность, интенсивность выделений и боль.", sample: `${completed.length} из 2 циклов`, tone: "neutral" };
  const [older, latest] = completed;
  const averagePain = (cycle: CycleRecord) => { const values = cycle.entries.map((entry) => entry.pain).filter((value): value is number => Boolean(value)); return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0; };
  const painDelta = averagePain(latest) - averagePain(older);
  const heavyDelta = latest.entries.filter((entry) => entry.period === "heavy").length - older.entries.filter((entry) => entry.period === "heavy").length;
  const durationDelta = latest.periodDays - older.periodDays;
  const sample = `Сравнены циклы ${formatCycleDate(older.start)} и ${formatCycleDate(latest.start)}`;
  if (Math.abs(painDelta) >= 1.5) return { title: painDelta > 0 ? "В последнем цикле боль была сильнее" : "В последнем цикле боль была слабее", text: `Средняя отмеченная интенсивность изменилась на ${Math.abs(painDelta).toFixed(1)} пункта. Это наблюдение по вашим записям.`, sample, tone: painDelta > 0 ? "attention" : "good" };
  if (heavyDelta !== 0) return { title: heavyDelta > 0 ? "Обильных дней стало больше" : "Обильных дней стало меньше", text: `Разница с предыдущим циклом — ${Math.abs(heavyDelta)} ${Math.abs(heavyDelta) === 1 ? "день" : "дня"}. Продолжайте отмечать интенсивность.`, sample, tone: heavyDelta > 0 ? "attention" : "good" };
  if (Math.abs(durationDelta) >= 2) return { title: durationDelta > 0 ? "Месячные длились дольше" : "Месячные были короче", text: `Продолжительность отличается от предыдущего цикла на ${Math.abs(durationDelta)} дня.`, sample, tone: "neutral" };
  return { title: "Заметных изменений между двумя циклами нет", text: "Длительность, боль и число обильных дней близки к предыдущему циклу.", sample, tone: "good" };
}

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  useEffect(() => { const timer = window.setTimeout(() => setProfile(getProfile()), 0); return () => window.clearTimeout(timer); }, []);
  const cycles = useMemo(() => buildCycles(profile?.entries ?? []), [profile]);
  const completed = cycles.filter((cycle) => !cycle.current);
  const previous = completed.at(-1);
  const current = cycles.find((cycle) => cycle.current);
  const status = cycleStatus(previous, completed);
  const lengths = completed.map((cycle) => cycle.length);
  const range = lengths.length ? `${Math.min(...lengths)}–${Math.max(...lengths)} дней` : "—";
  const periodAverage = completed.length ? Math.round(completed.reduce((sum, cycle) => sum + cycle.periodDays, 0) / completed.length) : profile?.periodLength ?? 5;
  const chartCycles = completed.slice(-6);
  const stable = lengths.length >= 3 && Math.max(...lengths) - Math.min(...lengths) <= 3;
  const recentTrackedCycles = cycles.slice(-3);
  const mainChange = buildMainChange(cycles);

  return <main className="analytics-page cycles-product-page"><div className="analytics-shell"><header className="analytics-header"><div><small>Мой цикл</small><h1>Мои циклы</h1><p>История, динамика и понятные объяснения.</p></div><span><TrendingUp /></span></header><section className="data-trust-legend" aria-label="Типы данных"><span><i className="fact" />Факт — внесено вами</span><span><i className="forecast" />Прогноз — расчёт Mira</span><span><i className="observation" />Наблюдение — повторение в истории</span></section>
    {!cycles.length ? <section className="analytics-empty"><Sparkles /><h2>Пока нет завершённых циклов</h2><p>Отметьте начало месячных в календаре — здесь появится история.</p><Link href="/calendar?action=period">Отметить месячные</Link></section> : <>
      <section className="my-cycles-card"><article><div><small>Длина предыдущего цикла</small><strong>{previous ? `${previous.length} дней` : "Нет данных"}</strong></div><span className={status.tone}><Info />{status.label}</span></article><article><div><small>Средняя длительность месячных</small><strong>{periodAverage} дней</strong></div><span className="neutral"><Info />Основано на {completed.length} циклах</span></article><article><div><small>Колебания длины цикла</small><strong>{range}</strong></div><span className={stable ? "good" : "neutral"}>{lengths.length < 3 ? <Info /> : stable ? <Sparkles /> : <CircleAlert />}{lengths.length < 3 ? "Нужно минимум 3 цикла" : stable ? "Стабильная динамика" : "Есть заметные изменения"}</span></article></section>
      <section className="mira-cycle-note"><span><Sparkles /></span><div><small>Mira объясняет</small><h2>{lengths.length < 3 ? "Пока рано оценивать регулярность" : stable ? "Последние циклы близки по длине" : "Длина циклов меняется"}</h2><p>{lengths.length < 3 ? "Добавьте ещё один завершённый цикл — после этого появится личный диапазон." : "Проверьте даты начала месячных. Если изменения повторяются и беспокоят вас, историю можно показать врачу."}</p></div></section>
      <section className={`p1-main-change ${mainChange.tone}`}><span><Sparkles /></span><div><small>Mira заметила · наблюдение</small><h2>{mainChange.title}</h2><p>{mainChange.text}</p><footer>{mainChange.sample} · не является диагнозом</footer></div></section>
      <section className="p1-analytics-card"><header><div><small>Фактические данные</small><h2>Интенсивность месячных</h2><p>Сравнение последних циклов по дням.</p></div><span><Droplet /></span></header><FlowHeatmap cycles={recentTrackedCycles} /></section>
      <section className="p1-analytics-card"><header><div><small>Фактические данные</small><h2>Боль по дням цикла</h2><p>Чем насыщеннее точка, тем сильнее отмеченная боль.</p></div><span className="pain"><HeartPulse /></span></header><PainMap cycles={recentTrackedCycles} /></section>
      <section className="cycle-history-preview"><header><h2>История циклов</h2><Link href="/analytics/cycles">Смотреть все <ChevronRight /></Link></header><div>{[...(current ? [current] : []), ...completed.slice(-2).reverse()].map((cycle) => <Link href={`/analytics/cycles/${cycle.start}`} key={cycle.start}><div><strong>{cycle.current ? `Текущий цикл: ${cycle.length} день` : `${cycle.length} дней`}</strong><span>{cycle.current ? `Начался ${formatCycleDate(cycle.start)}` : `${formatCycleDate(cycle.start)} — ${formatCycleDate(cycle.end)}`}</span><CycleDots cycle={cycle} /></div><ChevronRight /></Link>)}</div></section>
      <section className="cycle-dynamics-card"><header><div><h2>Динамика цикла</h2><p>Только завершённые циклы</p></div><Info /></header><CycleChart cycles={chartCycles} /><footer><strong>{lengths.length < 3 ? "Пока мало данных для вывода" : stable ? "Циклы отличаются не более чем на 3 дня" : "На графике видны изменения длины"}</strong><span>Нажмите на точку, чтобы открыть цикл.</span></footer></section>
      <Link className="doctor-report-entry" href="/analytics/report"><span><FileHeart /></span><div><small>Для консультации</small><h2>Отчёт для врача</h2><p>Соберите факты о циклах и симптомах. Вы сами решаете, что включить.</p></div><ChevronRight /></Link>
    </>}
  </div><AppTabBar active="analytics" /></main>;
}
