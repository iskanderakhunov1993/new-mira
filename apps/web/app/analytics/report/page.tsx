"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarRange, Check, FileHeart, LockKeyhole, Printer, ShieldCheck } from "lucide-react";
import { AppTabBar } from "@/components/AppTabBar";
import { getProfile, MiraProfile } from "@/lib/demo-session";
import { buildCycles, daysBetween, formatCycleDate } from "@/lib/cycle-analytics";
import { buildPersonalization } from "@/lib/personalization";

type ReportKey = "periods" | "pain" | "symptoms" | "mood" | "sleep" | "patterns" | "comparison" | "questions" | "notes" | "intimacy";

const REPORT_ITEMS: { id: ReportKey; label: string; hint: string; sensitive?: boolean }[] = [
  { id: "periods", label: "Даты и длительность циклов", hint: "Месячные и длина каждого цикла" },
  { id: "pain", label: "Боль", hint: "Дни и отмеченная интенсивность" },
  { id: "symptoms", label: "Симптомы", hint: "Частота отмеченных состояний" },
  { id: "mood", label: "Настроение", hint: "Только общая сводка" },
  { id: "sleep", label: "Сон", hint: "Средняя продолжительность" },
  { id: "patterns", label: "Личный ритм", hint: "Повторяющиеся симптомы и типичный цикл" },
  { id: "comparison", label: "Текущий цикл", hint: "Сравнение с вашей обычной историей" },
  { id: "questions", label: "Вопросы для врача", hint: "Сформированы только из фактических отметок" },
  { id: "notes", label: "Личные заметки", hint: "Может содержать чувствительную информацию", sensitive: true },
  { id: "intimacy", label: "Интимные данные", hint: "Сексуальная активность и желание", sensitive: true },
];

const DEFAULT_SELECTION: Record<ReportKey, boolean> = { periods: true, pain: true, symptoms: true, mood: true, sleep: true, patterns: true, comparison: true, questions: true, notes: false, intimacy: false };

function formatFullDate(date: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

export default function DoctorReportPage() {
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  const [months, setMonths] = useState(3);
  const [selected, setSelected] = useState(DEFAULT_SELECTION);
  useEffect(() => { const timer = window.setTimeout(() => setProfile(getProfile()), 0); return () => window.clearTimeout(timer); }, []);

  const report = useMemo(() => {
    const allEntries = profile?.entries ?? [];
    const lastDate = allEntries.at(-1)?.date ?? new Date().toISOString().slice(0, 10);
    const from = new Date(`${lastDate}T12:00:00`); from.setMonth(from.getMonth() - months);
    const fromKey = from.toISOString().slice(0, 10);
    const entries = allEntries.filter((entry) => entry.date >= fromKey && entry.date <= lastDate);
    const cycles = buildCycles(allEntries, lastDate).filter((cycle) => cycle.end >= fromKey);
    const completed = cycles.filter((cycle) => !cycle.current);
    const pain = entries.filter((entry) => typeof entry.pain === "number");
    const periodEntries = entries.filter((entry) => entry.period);
    const sleep = entries.filter((entry) => typeof entry.sleepHours === "number");
    const symptomCounts = new Map<string, number>();
    entries.forEach((entry) => entry.symptoms?.forEach((symptom) => symptomCounts.set(symptom, (symptomCounts.get(symptom) ?? 0) + 1)));
    const symptoms = [...symptomCounts.entries()].sort((a, b) => b[1] - a[1]);
    const moods = entries.filter((entry) => entry.mood).reduce<Record<string, number>>((sum, entry) => { const key = entry.mood ?? "calm"; sum[key] = (sum[key] ?? 0) + 1; return sum; }, {});
    const flowCounts = periodEntries.reduce<Record<string, number>>((sum, entry) => { if (entry.period) sum[entry.period] = (sum[entry.period] ?? 0) + 1; return sum; }, {});
    const periodSignals = { clots: periodEntries.filter((entry) => entry.periodClots).length, leaks: periodEntries.filter((entry) => entry.periodLeak).length, night: periodEntries.filter((entry) => entry.periodNightChange).length, hourly: periodEntries.filter((entry) => entry.periodHourlyChange).length };
    const painLocations = pain.flatMap((entry) => entry.painLocations ?? []).reduce<Record<string, number>>((sum, item) => { sum[item] = (sum[item] ?? 0) + 1; return sum; }, {});
    const painTypes = pain.flatMap((entry) => entry.painTypes ?? []).reduce<Record<string, number>>((sum, item) => { sum[item] = (sum[item] ?? 0) + 1; return sum; }, {});
    const strongImpactDays = pain.filter((entry) => entry.painImpact === "strong").length;
    const coverage = Math.min(100, Math.round((new Set(entries.map((entry) => entry.date)).size / Math.max(1, daysBetween(fromKey, lastDate) + 1)) * 100));
    const personalization = buildPersonalization(allEntries);
    const questions = [
      strongImpactDays > 0 ? `Боль мешала обычным делам в ${strongImpactDays} дн.: стоит ли обсудить план облегчения?` : null,
      pain.length >= 3 ? `Средняя отмеченная боль — ${(pain.reduce((sum, entry) => sum + (entry.pain ?? 0), 0) / pain.length).toFixed(1)} из 10: какие признаки важно отслеживать?` : null,
      personalization.patterns[0] ? `Повторяется «${personalization.patterns[0].name}» в ${personalization.patterns[0].matchedCycles} из 3 циклов: требует ли это дополнительного наблюдения?` : null,
      personalization.sleep.difference && personalization.sleep.difference >= 1 ? `В дни с усталостью сон короче на ${personalization.sleep.difference.toFixed(1)} ч: что стоит учитывать?` : null,
    ].filter((question): question is string => Boolean(question));
    return { fromKey, lastDate, entries, cycles, completed, pain, sleep, symptoms, moods, flowCounts, periodSignals, painLocations, painTypes, strongImpactDays, coverage, personalization, questions };
  }, [profile, months]);

  const toggle = (id: ReportKey) => setSelected((current) => ({ ...current, [id]: !current[id] }));
  const selectedCount = Object.values(selected).filter(Boolean).length;

  return <main className="report-page"><div className="report-shell">
    <header className="report-top no-print"><Link href="/analytics" aria-label="Назад к аналитике"><ArrowLeft /></Link><div><small>Аналитика</small><h1>Отчёт для врача</h1></div><span><FileHeart /></span></header>

    <section className="report-intro no-print"><div><ShieldCheck /></div><h2>Только факты, которые выбрали вы</h2><p>Отчёт формируется на устройстве. Mira не ставит диагноз и не отправляет данные врачу самостоятельно.</p></section>

    <section className="report-settings no-print"><header><div><CalendarRange /></div><div><h2>Период отчёта</h2><p>{formatFullDate(report.fromKey)} — {formatFullDate(report.lastDate)}</p></div></header><div className="report-periods">{[3, 6, 12].map((value) => <button className={months === value ? "active" : ""} key={value} onClick={() => setMonths(value)}>{value} мес.</button>)}</div></section>

    <section className="report-checklist no-print"><header><div><h2>Что включить</h2><p>Выбрано разделов: {selectedCount}</p></div><LockKeyhole /></header>{REPORT_ITEMS.map((item) => <button className={selected[item.id] ? "selected" : ""} key={item.id} onClick={() => toggle(item.id)}><i>{selected[item.id] && <Check />}</i><span><strong>{item.label}{item.sensitive && <em>Чувствительные данные</em>}</strong><small>{item.hint}</small></span></button>)}</section>

    <section className="report-preview"><header><div><small>Предпросмотр</small><h2>Сводка здоровья</h2><p>{formatFullDate(report.fromKey)} — {formatFullDate(report.lastDate)}</p></div><span>Mira</span></header>
      <div className="report-person"><p><span>Имя</span><strong>{profile?.name ?? "Не указано"}</strong></p><p><span>Дата подготовки</span><strong>{formatFullDate(report.lastDate)}</strong></p><p><span>Полнота записей</span><strong>{report.coverage}% дней</strong></p></div>
      {selected.periods && <article><h3>Циклы и месячные</h3>{report.cycles.length ? <><div className="report-metrics"><p><strong>{report.completed.length || report.cycles.length}</strong><span>цикла в отчёте</span></p><p><strong>{report.completed.length ? `${Math.round(report.completed.reduce((sum, cycle) => sum + cycle.length, 0) / report.completed.length)} дн.` : "—"}</strong><span>средняя длина</span></p><p><strong>{report.cycles.length ? `${Math.round(report.cycles.reduce((sum, cycle) => sum + cycle.periodDays, 0) / report.cycles.length)} дн.` : "—"}</strong><span>месячные</span></p></div><ul>{report.cycles.map((cycle) => <li key={cycle.start}><span>{cycle.current ? "Текущий цикл" : `${formatCycleDate(cycle.start)} — ${formatCycleDate(cycle.end)}`}</span><strong>{cycle.length} дн. · месячные {cycle.periodDays} дн.</strong></li>)}</ul><p className="report-finding">Фактическая интенсивность по дням: мажущие — {report.flowCounts.spotting ?? 0}, слабые — {report.flowCounts.light ?? 0}, средние — {report.flowCounts.medium ?? 0}, обильные — {report.flowCounts.heavy ?? 0}.</p>{Object.values(report.periodSignals).some(Boolean) && <p className="report-finding">Дополнительные отметки: сгустки — {report.periodSignals.clots}, протекания — {report.periodSignals.leaks}, смена ночью — {report.periodSignals.night}, смена каждый час — {report.periodSignals.hourly}.</p>}</> : <p className="report-empty">За выбранный период циклы не отмечены.</p>}</article>}
      {selected.pain && <article><h3>Боль</h3>{report.pain.length ? <><p className="report-finding">Отмечена в {report.pain.length} {report.pain.length === 1 ? "дне" : "днях"}. Средняя интенсивность — <strong>{(report.pain.reduce((sum, entry) => sum + (entry.pain ?? 0), 0) / report.pain.length).toFixed(1)} из 10</strong>.</p>{Object.keys(report.painLocations).length > 0 && <p className="report-finding">Локализация: {Object.entries(report.painLocations).map(([name, count]) => `${name} — ${count}`).join(", ")}.</p>}{Object.keys(report.painTypes).length > 0 && <p className="report-finding">Характер: {Object.entries(report.painTypes).map(([name, count]) => `${name} — ${count}`).join(", ")}.</p>}{report.strongImpactDays > 0 && <p className="report-finding">Боль мешала обычным делам в {report.strongImpactDays} {report.strongImpactDays === 1 ? "дне" : "днях"}.</p>}</> : <p className="report-empty">Отметок боли нет.</p>}<small>Это пользовательские отметки, а не медицинская оценка.</small></article>}
      {selected.symptoms && <article><h3>Часто отмеченные симптомы</h3>{report.symptoms.length ? <div className="report-tags">{report.symptoms.slice(0, 8).map(([name, count]) => { const levels = report.entries.map((entry) => entry.symptomIntensity?.[name]).filter((level): level is 1 | 2 | 3 => Boolean(level)); const average = levels.length ? (levels.reduce((sum, level) => sum + level, 0) / levels.length).toFixed(1) : null; return <span key={name}>{name} <b>{count}{average ? ` · ${average}/3` : ""}</b></span>; })}</div> : <p className="report-empty">Симптомы не отмечены.</p>}<small>Интенсивность показана только для дней, где пользователь её указал.</small></article>}
      {selected.mood && <article><h3>Настроение</h3>{Object.keys(report.moods).length ? <p className="report-finding">Хорошее — {report.moods.good ?? 0} дн., спокойное — {report.moods.calm ?? 0} дн., сниженное — {report.moods.low ?? 0} дн.</p> : <p className="report-empty">Отметок настроения нет.</p>}</article>}
      {selected.sleep && <article><h3>Сон</h3>{report.sleep.length ? <p className="report-finding">Средняя продолжительность — <strong>{(report.sleep.reduce((sum, entry) => sum + (entry.sleepHours ?? 0), 0) / report.sleep.length).toFixed(1)} ч.</strong> Основано на {report.sleep.length} отметках.</p> : <p className="report-empty">Отметок сна нет.</p>}</article>}
      {selected.patterns && <article><h3>Личный ритм</h3>{report.personalization.completed.length >= 3 ? <><div className="report-metrics"><p><strong>{report.personalization.fingerprint[0].value}</strong><span>типичная длина</span></p><p><strong>{report.personalization.fingerprint[1].value}</strong><span>месячные</span></p><p><strong>{report.personalization.fingerprint[3].value}</strong><span>средняя боль</span></p></div>{report.personalization.patterns.length ? <p className="report-finding">Повторяющиеся симптомы: {report.personalization.patterns.slice(0, 3).map((pattern) => `${pattern.name} — ${pattern.matchedCycles} из 3 циклов, обычно ${pattern.typicalDay}-й день`).join("; ")}.</p> : <p className="report-empty">Повторяющихся симптомов в трёх циклах не отмечено.</p>}</> : <p className="report-empty">Для личного ритма нужны три завершённых цикла.</p>}<small>Это наблюдения по пользовательским записям, а не медицинские выводы.</small></article>}
      {selected.comparison && <article><h3>Текущий цикл и обычный ритм</h3>{report.personalization.currentComparison ? <p className="report-finding">{report.personalization.currentComparison.text}</p> : <p className="report-empty">Пока недостаточно данных текущего цикла для сравнения.</p>}</article>}
      {selected.questions && <article><h3>Вопросы для обсуждения с врачом</h3>{report.questions.length ? <ul className="report-questions">{report.questions.map((question) => <li key={question}><span>Вопрос</span><strong>{question}</strong></li>)}</ul> : <p className="report-empty">Пока недостаточно фактов, чтобы предложить вопросы. Продолжайте отмечать цикл и самочувствие.</p>}<small>Вопросы помогают начать разговор и не заменяют рекомендаций специалиста.</small></article>}
      {selected.notes && <article><h3>Личные заметки</h3>{report.entries.some((entry) => entry.notes) ? <ul>{report.entries.filter((entry) => entry.notes).map((entry) => <li key={entry.date}><span>{formatFullDate(entry.date)}</span><strong>{entry.notes}</strong></li>)}</ul> : <p className="report-empty">Личных заметок нет.</p>}</article>}
      {selected.intimacy && <article><h3>Интимные данные</h3><p className="report-empty">В выбранном периоде нет сохранённых интимных отметок, доступных для отчёта.</p></article>}
      <footer><ShieldCheck /><p><strong>Важно</strong><span>Отчёт помогает обсудить наблюдения со специалистом, но не заменяет консультацию и диагностику.</span></p></footer>
    </section>

    <div className="report-action no-print"><div><strong>Отчёт готов</strong><span>{selectedCount} разделов · данные остаются на устройстве</span></div><button disabled={!selectedCount} onClick={() => window.print()}><Printer />Сохранить PDF</button></div>
  </div><AppTabBar active="analytics" /></main>;
}
