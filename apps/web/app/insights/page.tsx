"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BedDouble, ChevronRight, HeartPulse, Lightbulb, Sparkles } from "lucide-react";
import { AppTabBar } from "@/components/AppTabBar";
import { getProfile, MiraProfile } from "@/lib/demo-session";
import { buildPersonalization, SymptomPattern } from "@/lib/personalization";

function PatternCard({ pattern }: { pattern: SymptomPattern }) {
  return <Link className="pattern-card redesigned" href={`/insights/symptoms/${encodeURIComponent(pattern.name)}`}><header><div><span>●</span><div><small>Повторяющийся симптом</small><h3>{pattern.name}</h3><p>{pattern.matchedCycles} из 3 циклов · {pattern.typicalDay}-й день</p></div></div><ChevronRight /></header><div className="pattern-mini-timeline">{pattern.cycles.map(({ cycle, days }) => <div key={cycle.start}><span>{new Intl.DateTimeFormat("ru-RU", { month: "short" }).format(new Date(`${cycle.start}T12:00:00`))}</span><i style={{ width: `${Math.min(100, Math.max(14, (days[0] / Math.max(1, cycle.length)) * 100))}%` }} /></div>)}</div></Link>;
}

export default function InsightsPage() {
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  useEffect(() => { void getProfile().then(setProfile).catch(() => setProfile(null)); }, []);
  const personalization = useMemo(() => buildPersonalization(profile?.entries ?? []), [profile]);
  const ready = personalization.completed.length >= 3;

  return <main className="insights-page"><div className="insights-shell">
    <header className="insights-header"><div><small>Персональные объяснения</small><h1>Инсайты</h1><p>Что повторяется в ваших записях.</p></div><span><Lightbulb /></span></header>
    <section className={`insights-hero fingerprint-hero ${ready ? "has-patterns" : ""}`}><span><Sparkles /></span><div><small>Ваш отпечаток цикла</small><h2>{ready ? "Основано на 3 циклах" : "Нужно ещё заполнить историю"}</h2><p>{ready ? "Mira показывает только повторения в ваших отметках — это не диагноз." : `Сейчас завершённых циклов: ${personalization.completed.length} из 3. Отмечайте начало месячных и самочувствие.`}</p></div></section>
    {ready && <>
      <section className="fingerprint-card"><header><div><small>Ваш обычный ритм</small><h2>Отпечаток цикла</h2></div><span>3 цикла</span></header><div>{personalization.fingerprint.slice(0, 3).map((item) => <article key={item.label}><small>{item.label}</small><strong>{item.value}</strong></article>)}</div></section>
      {personalization.currentComparison && <section className={`current-comparison ${personalization.currentComparison.tone}`}><HeartPulse /><div><small>Текущий и типичный цикл</small><h2>{personalization.currentComparison.label}</h2><p>{personalization.currentComparison.text}</p></div></section>}
      <section className="patterns-list"><div className="patterns-heading"><div><h2>Mira заметила</h2><p>Повторения в дневнике</p></div><span>{personalization.patterns.length}</span></div>{personalization.patterns.length ? personalization.patterns.slice(0, 3).map((pattern) => <PatternCard pattern={pattern} key={pattern.name} />) : <div className="insights-empty"><Lightbulb /><h2>Повторений пока не видно</h2><p>Симптом появится здесь, когда он отмечен хотя бы в двух из трёх циклов.</p></div>}</section>
      <section className="personalization-grid"><article><BedDouble /><small>Сон и энергия</small><h2>{personalization.sleep.entries ? `${personalization.sleep.average.toFixed(1)} ч в среднем` : "Недостаточно записей"}</h2><p>{personalization.sleep.difference ? `В дни с усталостью сон короче на ${personalization.sleep.difference.toFixed(1)} ч.` : "Отмечайте сон и энергию, чтобы увидеть связь."}</p></article><article><HeartPulse /><small>Что облегчает</small><h2>{personalization.relief[0]?.label ?? "Пока нет сравнения"}</h2><p>{personalization.relief.length ? `В ${personalization.relief[0].entries} отметках средняя боль ${personalization.relief[0].averagePain.toFixed(1)} из 10.` : "Нужно минимум две сопоставимые отметки боли."}</p></article></section>
    </>}
    <Link className="insights-track-link" href="/diary?section=symptoms"><span><strong>Добавить сегодняшние симптомы</strong><small>Это займёт около минуты</small></span><ArrowRight /></Link>
  </div><AppTabBar active="insights" /></main>;
}
