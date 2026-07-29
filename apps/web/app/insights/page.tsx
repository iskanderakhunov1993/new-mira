"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, BedDouble, CalendarRange, ChevronRight, Droplet, HeartPulse, Lightbulb, LockKeyhole, Pill, Sparkles, TestTube } from "lucide-react";
import { AppTabBar } from "@/components/AppTabBar";
import { getProfile, MiraProfile } from "@/lib/demo-session";
import { buildPersonalization, SymptomPattern } from "@/lib/personalization";

function PatternCard({ pattern }: { pattern: SymptomPattern }) {
  const confidence = pattern.confidence === "strong" ? "Устойчивое повторение" : pattern.confidence === "moderate" ? "Повторяется" : "Первые признаки";
  return <Link className="pattern-card redesigned" href={`/insights/symptoms/${encodeURIComponent(pattern.name)}`}><header><div><span>●</span><div><small>{confidence}</small><h3>{pattern.name}</h3><p>{pattern.matchedCycles} из {pattern.evaluatedCycles} циклов · обычно {pattern.dayRange.min}–{pattern.dayRange.max}-й день</p></div></div><ChevronRight /></header><div className="pattern-mini-timeline">{pattern.cycles.map(({ cycle, days }) => <div key={cycle.start}><span>{new Intl.DateTimeFormat("ru-RU", { month: "short" }).format(new Date(`${cycle.start}T12:00:00`))}</span><i style={{ width: `${Math.min(100, Math.max(14, (days[0] / Math.max(1, cycle.length)) * 100))}%` }} /></div>)}</div></Link>;
}

export default function InsightsPage() {
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  useEffect(() => { void getProfile().then(setProfile).catch(() => setProfile(null)); }, []);
  const personalization = useMemo(() => buildPersonalization(profile?.entries ?? []), [profile]);
  const ready = personalization.completed.length >= 3;
  const entries = profile?.entries ?? [];
  const trackedDays = entries.filter((entry) => entry.period || entry.symptoms?.length || entry.pain !== undefined || entry.mood || entry.energy || entry.sleepHours !== undefined || entry.medicationIntakes?.length).length;
  const symptomMarks = entries.reduce((sum, entry) => sum + (entry.symptoms?.length ?? 0), 0);
  const medicationMarks = entries.reduce((sum, entry) => sum + (entry.medicationIntakes?.length ?? 0), 0);
  const periodMarks = entries.filter((entry) => entry.period).length;
  const activityMarks = entries.filter((entry) => entry.activityTypes?.length).length;
  const testMarks = entries.filter((entry) => entry.pregnancyTest || entry.ovulationTest).length;
  const privateMarks = entries.filter((entry) => entry.sexualActivity || entry.sexualComfort).length;
  const privateInsightsEnabled = Boolean(profile?.preferences?.privateInsights && profile?.consents?.sensitiveInsights);

  return <main className="insights-page"><div className="insights-shell">
    <header className="insights-header"><div><small>Персональные объяснения</small><h1>Инсайты</h1><p>Что повторяется в ваших записях.</p></div><span><Lightbulb /></span></header>
    <section className={`insights-hero fingerprint-hero ${ready ? "has-patterns" : ""}`}><span><Sparkles /></span><div><small>Ваш отпечаток цикла</small><h2>{ready ? `Основано на ${personalization.completed.length} циклах` : "Нужно ещё заполнить историю"}</h2><p>{ready ? "Mira показывает только повторения в ваших отметках — это не диагноз." : `Сейчас завершённых циклов: ${personalization.completed.length} из 3. Отмечайте начало месячных и самочувствие.`}</p></div></section>
    <section className="insights-coverage">
      <header><div><small>Все функции доступны бесплатно</small><h2>Что уже можно анализировать</h2></div><span>{trackedDays} дней</span></header>
      <div>
        <Link href="/analytics"><CalendarRange /><span><strong>{personalization.completed.length}</strong><small>завершённых циклов</small></span><ChevronRight /></Link>
        <Link href="/diary?section=period"><Droplet /><span><strong>{periodMarks}</strong><small>отметок месячных</small></span><ChevronRight /></Link>
        <Link href="/diary?section=symptoms"><HeartPulse /><span><strong>{symptomMarks}</strong><small>отметок симптомов</small></span><ChevronRight /></Link>
        <Link href="/diary?section=medication"><Pill /><span><strong>{medicationMarks}</strong><small>приёмов лекарств</small></span><ChevronRight /></Link>
        <Link href="/diary?section=lifestyle"><Activity /><span><strong>{activityMarks}</strong><small>дней с активностью</small></span><ChevronRight /></Link>
        <Link href="/diary?section=tests"><TestTube /><span><strong>{testMarks}</strong><small>дней с домашними тестами</small></span><ChevronRight /></Link>
      </div>
      <p>Записи принадлежат вам. Mira сравнивает только фактические отметки и всегда показывает, на скольких данных основано наблюдение.</p>
    </section>
    <section className="insights-coverage">
      <header><div><small>Отдельный приватный контур</small><h2>Интимные наблюдения</h2></div><LockKeyhole /></header>
      {privateInsightsEnabled ? <p>Приватных отметок: {privateMarks}. Они анализируются отдельно и не попадут в отчёт для врача, пока вы сами не включите этот раздел.</p> : <p>Приватные инсайты выключены. Записи сохраняются в дневнике, но Mira не строит по ним выводы без отдельного согласия.</p>}
    </section>
    {ready && <>
      <section className="fingerprint-card"><header><div><small>Ваш обычный ритм</small><h2>Отпечаток цикла</h2></div><span>{personalization.completed.length} циклов</span></header><div>{personalization.fingerprint.slice(0, 3).map((item) => <article key={item.label}><small>{item.label}</small><strong>{item.value}</strong></article>)}</div></section>
      {personalization.currentComparison && <section className={`current-comparison ${personalization.currentComparison.tone}`}><HeartPulse /><div><small>Текущий и типичный цикл</small><h2>{personalization.currentComparison.label}</h2><p>{personalization.currentComparison.text}</p></div></section>}
      <section className="patterns-list"><div className="patterns-heading"><div><h2>Mira заметила</h2><p>Повторения в дневнике</p></div><span>{personalization.patterns.length}</span></div>{personalization.patterns.length ? personalization.patterns.slice(0, 3).map((pattern) => <PatternCard pattern={pattern} key={pattern.name} />) : <div className="insights-empty"><Lightbulb /><h2>Повторений пока не видно</h2><p>Симптом появится здесь, когда повторится хотя бы в половине из трёх или более циклов.</p></div>}</section>
      <section className="personalization-grid"><article><BedDouble /><small>Сон и энергия</small><h2>{personalization.sleep.entries ? `${personalization.sleep.average.toFixed(1)} ч в среднем` : "Недостаточно записей"}</h2><p>{personalization.sleep.difference ? `В дни с усталостью сон короче на ${personalization.sleep.difference.toFixed(1)} ч.` : "Отмечайте сон и энергию, чтобы увидеть связь."}</p></article><article><HeartPulse /><small>Что облегчает</small><h2>{personalization.relief[0]?.label ?? "Пока нет сравнения"}</h2><p>{personalization.relief.length ? `В ${personalization.relief[0].entries} отметках средняя боль ${personalization.relief[0].averagePain.toFixed(1)} из 10.` : "Нужно минимум две сопоставимые отметки боли."}</p></article></section>
    </>}
    <Link className="insights-track-link" href="/diary?section=symptoms"><span><strong>Добавить сегодняшние симптомы</strong><small>Это займёт около минуты</small></span><ArrowRight /></Link>
  </div><AppTabBar active="insights" /></main>;
}
