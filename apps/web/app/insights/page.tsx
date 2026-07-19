"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Info, Lightbulb, Sparkles } from "lucide-react";
import { AppTabBar } from "@/components/AppTabBar";
import { getProfile, MiraProfile } from "@/lib/demo-session";
import { buildCycles, CycleRecord, daysBetween, formatCycleDate } from "@/lib/cycle-analytics";

const excludedSymptoms = new Set(["Всё в порядке", "Без изменений", "Выделений нет", "Секса не было", "Ничего не принимала"]);
const sensitivePrefixes = ["Секс ", "Оральный", "Анальный", "Мастурбация", "Интимные", "Секс-игрушки", "Оргазм"];

type Pattern = {
  name: string;
  occurrences: number;
  cycles: { cycle: CycleRecord; days: number[] }[];
  phase: string;
};

function phaseForDay(day: number, cycle: CycleRecord) {
  if (day <= cycle.periodDays) return "Во время месячных";
  const ovulationDay = Math.max(cycle.periodDays + 2, cycle.length - 14);
  if (Math.abs(day - ovulationDay) <= 2) return "Около овуляции";
  if (day > ovulationDay + 2) return "В лютеиновой фазе";
  return "В фолликулярной фазе";
}

function buildPatterns(cycles: CycleRecord[]): Pattern[] {
  const recent = cycles.slice(-3);
  const symptoms = new Map<string, Map<string, number[]>>();
  recent.forEach((cycle) => cycle.entries.forEach((entry) => entry.symptoms?.forEach((name) => {
    if (excludedSymptoms.has(name) || sensitivePrefixes.some((prefix) => name.startsWith(prefix))) return;
    const cycleMap = symptoms.get(name) ?? new Map<string, number[]>();
    const days = cycleMap.get(cycle.start) ?? [];
    days.push(daysBetween(cycle.start, entry.date) + 1);
    cycleMap.set(cycle.start, days);
    symptoms.set(name, cycleMap);
  })));

  return [...symptoms.entries()].filter(([, cycleMap]) => cycleMap.size >= 2).map(([name, cycleMap]) => {
    const matches = recent.filter((cycle) => cycleMap.has(cycle.start)).map((cycle) => ({ cycle, days: cycleMap.get(cycle.start)! }));
    const phaseCounts = new Map<string, number>();
    matches.forEach(({ cycle, days }) => days.forEach((day) => { const phase = phaseForDay(day, cycle); phaseCounts.set(phase, (phaseCounts.get(phase) ?? 0) + 1); }));
    const phase = [...phaseCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "В течение цикла";
    return { name, cycles: matches, occurrences: matches.reduce((sum, item) => sum + item.days.length, 0), phase };
  }).sort((a, b) => b.cycles.length - a.cycles.length || b.occurrences - a.occurrences).slice(0, 3);
}

function PatternTimeline({ pattern }: { pattern: Pattern }) {
  return <div className="insight-timeline" aria-label={`Дни появления симптома ${pattern.name}`}>
    {pattern.cycles.map(({ cycle, days }) => <div className="insight-timeline-row" key={cycle.start}><span>{formatCycleDate(cycle.start)}</span><div>{days.map((day, index) => <i style={{ left: `${Math.min(98, Math.max(2, ((day - 1) / Math.max(1, cycle.length - 1)) * 96 + 2))}%` }} title={`${day}-й день цикла`} key={`${day}-${index}`} />)}</div></div>)}
    <footer><span>Начало цикла</span><span>Конец цикла</span></footer>
  </div>;
}

function marksLabel(value: number) {
  if (value % 10 === 1 && value % 100 !== 11) return "отметка";
  if ([2, 3, 4].includes(value % 10) && ![12, 13, 14].includes(value % 100)) return "отметки";
  return "отметок";
}

export default function InsightsPage() {
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  useEffect(() => { const timer = window.setTimeout(() => setProfile(getProfile()), 0); return () => window.clearTimeout(timer); }, []);
  const cycles = useMemo(() => buildCycles(profile?.entries ?? []), [profile]);
  const recentCycles = cycles.slice(-3);
  const patterns = buildPatterns(cycles);
  const trackedEntries = recentCycles.reduce((sum, cycle) => sum + cycle.entries.filter((entry) => entry.symptoms?.length).length, 0);
  const coveredDays = new Set(recentCycles.flatMap((cycle) => cycle.entries.map((entry) => entry.date))).size;
  const totalCycleDays = recentCycles.reduce((sum, cycle) => sum + cycle.length, 0);
  const coverage = totalCycleDays ? Math.min(100, Math.round((coveredDays / totalCycleDays) * 100)) : 0;
  const enoughForPatterns = recentCycles.length >= 2;

  return <main className="insights-page"><div className="insights-shell">
    <header className="insights-header"><div><small>Персональная аналитика</small><h1>Инсайты здоровья</h1><p>Что повторяется в ваших циклах.</p></div><span><Lightbulb /></span></header>
    <section className={`insights-hero ${patterns.length ? "has-patterns" : ""}`}><span><Sparkles /></span><div><small>Mira заметила · наблюдение</small><h2>{!enoughForPatterns ? "Пока мало данных для сравнения" : patterns.length ? recentCycles.length >= 3 ? "Похоже, некоторые симптомы повторяются" : "Появились первые совпадения" : "Повторяющихся симптомов пока не видно"}</h2><p>{!enoughForPatterns ? "Нужны отметки хотя бы в двух циклах. Продолжайте записывать симптомы — Mira сравнит их автоматически." : patterns.length ? `Основано на ${recentCycles.length} циклах и ${trackedEntries} фактических дневных отметках.` : "Это нормально. Продолжайте отмечать самочувствие, чтобы сравнение стало точнее."}</p></div></section>
    <section className="insights-progress"><header><div><h2>Полнота и надёжность</h2><p>{recentCycles.length >= 3 ? `Сравниваются 3 цикла · заполнено ${coverage}% дней` : `${recentCycles.length} из 3 циклов · заполнено ${coverage}% дней`}</p></div><strong>{recentCycles.length >= 3 && coverage >= 35 ? "Средняя" : "Предварительно"}</strong></header><div><span style={{ width: `${coverage}%` }} /></div><small>Основано на {coveredDays} {coveredDays % 10 === 1 && coveredDays % 100 !== 11 ? "заполненном дне" : "заполненных днях"}. Пропуски снижают надёжность. Инсайты не являются диагнозом.</small></section>
    {patterns.length ? <section className="patterns-list"><div className="patterns-heading"><div><h2>Повторяющиеся симптомы</h2><p>Последние {recentCycles.length} цикла</p></div><span>{patterns.length}</span></div>{patterns.map((pattern) => <article className="pattern-card" key={pattern.name}><header><div><span>●</span><div><h3>{pattern.name}</h3><p>{pattern.occurrences} {marksLabel(pattern.occurrences)} в {pattern.cycles.length} циклах</p></div></div><b>{pattern.phase}</b></header><PatternTimeline pattern={pattern} /><div className="pattern-explanation"><Info /><p><strong>Почему это полезно</strong>Повторение в похожей части цикла помогает заранее обратить внимание на самочувствие.</p></div></article>)}</section> : <section className="insights-empty"><Lightbulb /><h2>Отмечайте симптомы несколько дней</h2><p>Когда один симптом повторится минимум в двух циклах, здесь появится его динамика по дням.</p></section>}
    <Link className="insights-track-link" href="/diary?section=symptoms"><span><strong>Добавить сегодняшние симптомы</strong><small>Это займёт около минуты</small></span><ArrowRight /></Link>
  </div><AppTabBar active="insights" /></main>;
}
