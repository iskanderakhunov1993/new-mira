"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarRange, Check, FileHeart, LockKeyhole, Printer, ShieldCheck } from "lucide-react";
import { AppTabBar } from "@/components/AppTabBar";
import { getAssessments, getProfile, MiraProfile } from "@/lib/demo-session";
import type { HealthAssessment, LifeEffect, LifeImpact } from "@/lib/domain/assessment";
import { MEDICATION_EFFECT_LABELS, MEDICATION_REASON_LABELS } from "@/lib/domain/medication";
import { buildCycles, daysBetween, formatCycleDate } from "@/lib/cycle-analytics";
import { buildPersonalization } from "@/lib/personalization";

type ReportKey = "periods" | "pain" | "symptoms" | "medications" | "context" | "assessments" | "mood" | "sleep" | "patterns" | "comparison" | "questions" | "notes" | "intimacy";
type ReportGroup = "main" | "additional" | "private";

const REPORT_ITEMS: { id: ReportKey; group: ReportGroup; label: string; hint: string; sensitive?: boolean }[] = [
  { id: "periods", group: "main", label: "Циклы и месячные", hint: "Даты, длительность и интенсивность" },
  { id: "pain", group: "main", label: "Боль", hint: "Дни, интенсивность и влияние на дела" },
  { id: "symptoms", group: "main", label: "Симптомы", hint: "Частота и отмеченная выраженность" },
  { id: "medications", group: "main", label: "Лекарства и эффект", hint: "Приёмы, эффект и побочные реакции" },
  { id: "questions", group: "main", label: "Вопросы для врача", hint: "Сформированы только из ваших отметок" },
  { id: "assessments", group: "additional", label: "Оценки самочувствия", hint: "Жалобы и влияние на обычную жизнь" },
  { id: "context", group: "additional", label: "Контрацепция, тесты и активность", hint: "Факты по датам, без интерпретации" },
  { id: "mood", group: "additional", label: "Настроение", hint: "Общая сводка за период" },
  { id: "sleep", group: "additional", label: "Сон", hint: "Средняя продолжительность и число отметок" },
  { id: "patterns", group: "additional", label: "Личный ритм", hint: "Наблюдения минимум по трём циклам" },
  { id: "comparison", group: "additional", label: "Текущий цикл", hint: "Сравнение с вашей обычной историей" },
  { id: "notes", group: "private", label: "Личные заметки", hint: "Включаются только вручную", sensitive: true },
  { id: "intimacy", group: "private", label: "Интимные данные", hint: "Включаются только вручную", sensitive: true },
];

const DEFAULT_SELECTION: Record<ReportKey, boolean> = { periods: true, pain: true, symptoms: true, medications: true, context: true, assessments: true, mood: true, sleep: true, patterns: true, comparison: true, questions: true, notes: false, intimacy: false };
const LEGACY_PRIVATE_SYMPTOMS = new Set(["Секса не было", "Секс с защитой", "Секс без защиты", "Оральный секс", "Анальный секс", "Мастурбация", "Интимные прикосновения", "Секс-игрушки", "Оргазм", "Сильное желание", "Среднее желание", "Слабое желание", "Комфортно", "Боль во время секса", "Кровь после секса"]);

const ASSESSMENT_LABELS: Record<HealthAssessment["type"], string> = { delay: "Задержка месячных", pain: "Боль", heavy_flow: "Обильное кровотечение", discharge: "Выделения, зуд или жжение", postcoital: "Боль или кровь после секса", weakness: "Слабость или головокружение" };
const RESULT_LABELS: Record<HealthAssessment["resultCode"], string> = { self_care: "Продолжить наблюдение", routine_care: "Обсудить с врачом", urgent_care: "Медицинская оценка сегодня", emergency: "Срочная помощь" };
const IMPACT_LABELS: Record<LifeImpact, string> = { none: "не мешает", some: "немного мешает", strong: "сильно мешает", cannot_function: "невозможно заниматься обычными делами" };
const EFFECT_LABELS: Record<LifeEffect, string> = { missed_work_or_study: "пропущена работа или учёба", sleep_disrupted: "нарушен сон", could_not_exercise: "не могла тренироваться", took_medicine: "принято лекарство", sought_medical_help: "потребовалась медицинская помощь" };
const CONTRACEPTION_METHOD_LABELS: Record<string, string> = { pill: "таблетки", ring: "кольцо", patch: "пластырь", iud: "ВМС", implant: "имплант", injection: "инъекция", condom: "презерватив", other: "другое" };
const CONTRACEPTION_STATUS_LABELS: Record<string, string> = { on_time: "по плану", missed: "пропуск", changed: "смена метода", stopped: "отмена" };
const TEST_LABELS: Record<string, string> = { negative: "отрицательный", positive: "положительный", unclear: "неясный" };
const REPORT_GROUPS: { id: ReportGroup; title: string; text: string }[] = [
  { id: "main", title: "Главное для консультации", text: "Основные факты уже выбраны" },
  { id: "additional", title: "Дополнительный контекст", text: "Можно убрать то, что не относится к вопросу" },
  { id: "private", title: "Приватные данные", text: "По умолчанию выключены и попадут в PDF только после вашего выбора" },
];

function formatFullDate(date: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function sexualComfortLabel(value: string) {
  return { comfortable: "комфортно", dryness: "сухость", pain: "боль во время секса", bleeding: "кровь после секса" }[value] ?? value;
}

export default function DoctorReportPage() {
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  const [assessments, setAssessments] = useState<HealthAssessment[]>([]);
  const [months, setMonths] = useState(3);
  const [selected, setSelected] = useState(DEFAULT_SELECTION);
  useEffect(() => {
    void Promise.all([getProfile(), getAssessments()])
      .then(([nextProfile, nextAssessments]) => { setProfile(nextProfile); setAssessments(nextAssessments); })
      .catch(() => { setProfile(null); setAssessments([]); });
  }, []);

  const report = useMemo(() => {
    const allEntries = profile?.entries ?? [];
    const lastDate = [...allEntries.map((entry) => entry.date), ...assessments.map((assessment) => assessment.date)].sort().at(-1) ?? new Date().toISOString().slice(0, 10);
    const from = new Date(`${lastDate}T12:00:00`); from.setMonth(from.getMonth() - months);
    const fromKey = from.toISOString().slice(0, 10);
    const entries = allEntries.filter((entry) => entry.date >= fromKey && entry.date <= lastDate);
    const periodAssessments = assessments.filter((assessment) => assessment.date >= fromKey && assessment.date <= lastDate);
    const generalAssessments = periodAssessments.filter((assessment) => assessment.type !== "postcoital");
    const intimateAssessments = periodAssessments.filter((assessment) => assessment.type === "postcoital");
    const cycles = buildCycles(allEntries, lastDate).filter((cycle) => cycle.end >= fromKey);
    const completed = cycles.filter((cycle) => !cycle.current);
    const pain = entries.filter((entry) => typeof entry.pain === "number");
    const periodEntries = entries.filter((entry) => entry.period);
    const sleep = entries.filter((entry) => typeof entry.sleepHours === "number");
    const symptomCounts = new Map<string, number>();
    entries.forEach((entry) => entry.symptoms?.filter((symptom) => !LEGACY_PRIVATE_SYMPTOMS.has(symptom)).forEach((symptom) => symptomCounts.set(symptom, (symptomCounts.get(symptom) ?? 0) + 1)));
    const symptoms = [...symptomCounts.entries()].sort((a, b) => b[1] - a[1]);
    const medicationIntakes = entries.flatMap((entry) => (entry.medicationIntakes ?? []).map((intake) => ({ date: entry.date, intake })));
    const activityDays = entries.filter((entry) => entry.activityTypes?.length);
    const contraceptionDays = entries.filter((entry) => entry.contraceptionMethod || entry.contraceptionStatus);
    const testDays = entries.filter((entry) => entry.pregnancyTest || entry.ovulationTest);
    const intimacyDays = entries.filter((entry) => entry.sexualActivity || entry.sexualComfort);
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
      personalization.patterns[0] ? `Повторяется «${personalization.patterns[0].name}» в ${personalization.patterns[0].matchedCycles} из ${personalization.patterns[0].evaluatedCycles} циклов: требует ли это дополнительного наблюдения?` : null,
      personalization.sleep.difference && personalization.sleep.difference >= 1 ? `В дни с усталостью сон короче на ${personalization.sleep.difference.toFixed(1)} ч: что стоит учитывать?` : null,
    ].filter((question): question is string => Boolean(question));
    return { fromKey, lastDate, entries, cycles, completed, pain, sleep, symptoms, medicationIntakes, activityDays, contraceptionDays, testDays, intimacyDays, moods, flowCounts, periodSignals, painLocations, painTypes, strongImpactDays, coverage, personalization, questions, generalAssessments, intimateAssessments };
  }, [profile, assessments, months]);

  const toggle = (id: ReportKey) => setSelected((current) => ({ ...current, [id]: !current[id] }));
  const selectedCount = Object.values(selected).filter(Boolean).length;

  return <main className="report-page"><div className="report-shell">
    <header className="report-top no-print"><Link href="/analytics" aria-label="Назад к аналитике"><ArrowLeft /></Link><div><small>Аналитика</small><h1>Отчёт для врача</h1></div><span><FileHeart /></span></header>

    <section className="report-intro no-print"><div><ShieldCheck /></div><h2>Подготовьте факты к приёму</h2><p>Выберите период и нужные разделы. Mira ничего не отправляет врачу самостоятельно, а приватные данные всегда выключены по умолчанию.</p></section>

    <section className="report-settings no-print"><header><div><CalendarRange /></div><div><h2>Период отчёта</h2><p>{formatFullDate(report.fromKey)} — {formatFullDate(report.lastDate)}</p></div></header><div className="report-periods">{[3, 6, 12].map((value) => <button className={months === value ? "active" : ""} key={value} onClick={() => setMonths(value)}>{value} мес.</button>)}</div></section>

    <section className="report-checklist no-print"><header><div><h2>Что включить</h2><p>{selectedCount} разделов · состав можно изменить</p></div><LockKeyhole /></header>
      {REPORT_GROUPS.map((group) => <div className={`report-checklist-group ${group.id === "private" ? "private" : ""}`} key={group.id}>
        <div className="report-checklist-label"><strong>{group.title}</strong><small>{group.text}</small></div>
        {REPORT_ITEMS.filter((item) => item.group === group.id).map((item) => <button aria-pressed={selected[item.id]} className={selected[item.id] ? "selected" : ""} key={item.id} onClick={() => toggle(item.id)}><i>{selected[item.id] && <Check />}</i><span><strong>{item.label}{item.sensitive && <em>Приватно</em>}</strong><small>{item.hint}</small></span></button>)}
      </div>)}
    </section>

    <section className="report-preview"><header><div><small>Предпросмотр</small><h2>Сводка здоровья</h2><p>{formatFullDate(report.fromKey)} — {formatFullDate(report.lastDate)}</p></div><span>Mira</span></header>
      <div className="report-person"><p><span>Имя</span><strong>{profile?.name ?? "Не указано"}</strong></p><p><span>Дата подготовки</span><strong>{formatFullDate(report.lastDate)}</strong></p><p><span>Основано на записях</span><strong>{report.entries.length} дн. из выбранного периода</strong></p><p><span>Покрытие периода</span><strong>{report.coverage}%</strong></p></div>
      {selected.periods && <article><h3>Циклы и месячные</h3>{report.cycles.length ? <><div className="report-metrics"><p><strong>{report.completed.length || report.cycles.length}</strong><span>цикла в отчёте</span></p><p><strong>{report.completed.length ? `${Math.round(report.completed.reduce((sum, cycle) => sum + cycle.length, 0) / report.completed.length)} дн.` : "—"}</strong><span>средняя длина</span></p><p><strong>{report.cycles.length ? `${Math.round(report.cycles.reduce((sum, cycle) => sum + cycle.periodDays, 0) / report.cycles.length)} дн.` : "—"}</strong><span>месячные</span></p></div><ul>{report.cycles.map((cycle) => <li key={cycle.start}><span>{cycle.current ? "Текущий цикл" : `${formatCycleDate(cycle.start)} — ${formatCycleDate(cycle.end)}`}</span><strong>{cycle.length} дн. · месячные {cycle.periodDays} дн.</strong></li>)}</ul><p className="report-finding">Фактическая интенсивность по дням: мажущие — {report.flowCounts.spotting ?? 0}, слабые — {report.flowCounts.light ?? 0}, средние — {report.flowCounts.medium ?? 0}, обильные — {report.flowCounts.heavy ?? 0}.</p>{Object.values(report.periodSignals).some(Boolean) && <p className="report-finding">Дополнительные отметки: сгустки — {report.periodSignals.clots}, протекания — {report.periodSignals.leaks}, смена ночью — {report.periodSignals.night}, смена каждый час — {report.periodSignals.hourly}.</p>}</> : <p className="report-empty">За выбранный период циклы не отмечены.</p>}</article>}
      {selected.pain && <article><h3>Боль</h3>{report.pain.length ? <><p className="report-finding">Отмечена в {report.pain.length} {report.pain.length === 1 ? "дне" : "днях"}. Средняя интенсивность — <strong>{(report.pain.reduce((sum, entry) => sum + (entry.pain ?? 0), 0) / report.pain.length).toFixed(1)} из 10</strong>.</p>{Object.keys(report.painLocations).length > 0 && <p className="report-finding">Локализация: {Object.entries(report.painLocations).map(([name, count]) => `${name} — ${count}`).join(", ")}.</p>}{Object.keys(report.painTypes).length > 0 && <p className="report-finding">Характер: {Object.entries(report.painTypes).map(([name, count]) => `${name} — ${count}`).join(", ")}.</p>}{report.strongImpactDays > 0 && <p className="report-finding">Боль мешала обычным делам в {report.strongImpactDays} {report.strongImpactDays === 1 ? "дне" : "днях"}.</p>}</> : <p className="report-empty">Отметок боли нет.</p>}<small>Это пользовательские отметки, а не медицинская оценка.</small></article>}
      {selected.symptoms && <article><h3>Часто отмеченные симптомы</h3>{report.symptoms.length ? <div className="report-tags">{report.symptoms.slice(0, 8).map(([name, count]) => { const levels = report.entries.map((entry) => entry.symptomIntensity?.[name]).filter((level): level is 1 | 2 | 3 => Boolean(level)); const average = levels.length ? (levels.reduce((sum, level) => sum + level, 0) / levels.length).toFixed(1) : null; return <span key={name}>{name} <b>{count}{average ? ` · ${average}/3` : ""}</b></span>; })}</div> : <p className="report-empty">Симптомы не отмечены.</p>}<small>Интенсивность показана только для дней, где пользователь её указал.</small></article>}
      {selected.medications && <article><h3>Лекарства и эффект</h3>{report.medicationIntakes.length ? <ul>{report.medicationIntakes.map(({ date, intake }) => <li key={`${date}-${intake.id}`}><span>{formatFullDate(date)} · {intake.takenAt}</span><strong>{intake.name}{intake.dose ? `, ${intake.dose}` : ""}. Причина: {MEDICATION_REASON_LABELS[intake.reason]}. Эффект: {MEDICATION_EFFECT_LABELS[intake.effect]}{intake.sideEffects ? `. Побочные эффекты: ${intake.sideEffects}` : ""}.</strong></li>)}</ul> : <p className="report-empty">Приёмы лекарств не отмечены.</p>}<small>В отчёте показаны введённые пользователем факты, а не назначения Mira.</small></article>}
      {selected.context && <article><h3>Контрацепция, тесты и активность</h3>
        <div className="report-metrics"><p><strong>{report.activityDays.length}</strong><span>дней активности</span></p><p><strong>{report.contraceptionDays.length}</strong><span>отметок контрацепции</span></p><p><strong>{report.testDays.length}</strong><span>дней с тестами</span></p></div>
        {report.contraceptionDays.length > 0 && <div className="report-detail-group"><h4>Контрацепция</h4><ul>{report.contraceptionDays.map((entry) => <li key={`contraception-${entry.date}`}><span>{formatFullDate(entry.date)}</span><strong>{entry.contraceptionMethod ? CONTRACEPTION_METHOD_LABELS[entry.contraceptionMethod] : "метод не указан"}{entry.contraceptionStatus ? ` · ${CONTRACEPTION_STATUS_LABELS[entry.contraceptionStatus]}` : ""}</strong></li>)}</ul></div>}
        {report.testDays.length > 0 && <div className="report-detail-group"><h4>Домашние тесты</h4><ul>{report.testDays.map((entry) => <li key={`test-${entry.date}`}><span>{formatFullDate(entry.date)}</span><strong>{[entry.pregnancyTest ? `тест на беременность — ${TEST_LABELS[entry.pregnancyTest]}` : null, entry.ovulationTest ? `тест на овуляцию — ${TEST_LABELS[entry.ovulationTest]}` : null].filter(Boolean).join("; ")}</strong></li>)}</ul></div>}
        {report.activityDays.length > 0 && <div className="report-detail-group"><h4>Активность</h4><ul>{report.activityDays.map((entry) => <li key={`activity-${entry.date}`}><span>{formatFullDate(entry.date)}</span><strong>{entry.activityTypes?.join(", ")}</strong></li>)}</ul></div>}
        {report.activityDays.length + report.contraceptionDays.length + report.testDays.length === 0 && <p className="report-empty">Контекст за выбранный период не отмечен.</p>}<small>Показаны только введённые вами факты без интерпретации.</small>
      </article>}
      {selected.assessments && <AssessmentReportSection title="Оценки самочувствия" assessments={report.generalAssessments} />}
      {selected.mood && <article><h3>Настроение</h3>{Object.keys(report.moods).length ? <p className="report-finding">Хорошее — {report.moods.good ?? 0} дн., спокойное — {report.moods.calm ?? 0} дн., сниженное — {report.moods.low ?? 0} дн.</p> : <p className="report-empty">Отметок настроения нет.</p>}</article>}
      {selected.sleep && <article><h3>Сон</h3>{report.sleep.length ? <p className="report-finding">Средняя продолжительность — <strong>{(report.sleep.reduce((sum, entry) => sum + (entry.sleepHours ?? 0), 0) / report.sleep.length).toFixed(1)} ч.</strong> Основано на {report.sleep.length} отметках.</p> : <p className="report-empty">Отметок сна нет.</p>}</article>}
      {selected.patterns && <article><h3>Личный ритм</h3>{report.personalization.completed.length >= 3 ? <><div className="report-metrics"><p><strong>{report.personalization.fingerprint[0].value}</strong><span>типичная длина</span></p><p><strong>{report.personalization.fingerprint[1].value}</strong><span>месячные</span></p><p><strong>{report.personalization.fingerprint[3].value}</strong><span>средняя боль</span></p></div>{report.personalization.patterns.length ? <p className="report-finding">Повторяющиеся симптомы: {report.personalization.patterns.slice(0, 3).map((pattern) => `${pattern.name} — ${pattern.matchedCycles} из ${pattern.evaluatedCycles} циклов, обычно ${pattern.dayRange.min}–${pattern.dayRange.max}-й день`).join("; ")}.</p> : <p className="report-empty">Повторяющихся симптомов пока не отмечено.</p>}</> : <p className="report-empty">Для личного ритма нужны три завершённых цикла.</p>}<small>Это наблюдения по пользовательским записям, а не медицинские выводы.</small></article>}
      {selected.comparison && <article><h3>Текущий цикл и обычный ритм</h3>{report.personalization.currentComparison ? <p className="report-finding">{report.personalization.currentComparison.text}</p> : <p className="report-empty">Пока недостаточно данных текущего цикла для сравнения.</p>}</article>}
      {selected.questions && <article><h3>Вопросы для обсуждения с врачом</h3>{report.questions.length ? <ul className="report-questions">{report.questions.map((question) => <li key={question}><span>Вопрос</span><strong>{question}</strong></li>)}</ul> : <p className="report-empty">Пока недостаточно фактов, чтобы предложить вопросы. Продолжайте отмечать цикл и самочувствие.</p>}<small>Вопросы помогают начать разговор и не заменяют рекомендаций специалиста.</small></article>}
      {selected.notes && <article><h3>Личные заметки</h3>{report.entries.some((entry) => entry.notes) ? <ul>{report.entries.filter((entry) => entry.notes).map((entry) => <li key={entry.date}><span>{formatFullDate(entry.date)}</span><strong>{entry.notes}</strong></li>)}</ul> : <p className="report-empty">Личных заметок нет.</p>}</article>}
      {selected.intimacy && <><article><h3>Интимные данные</h3>{report.intimacyDays.length ? <ul>{report.intimacyDays.map((entry) => <li key={entry.date}><span>{formatFullDate(entry.date)}</span><strong>{entry.sexualActivity === "protected" ? "Секс с защитой" : entry.sexualActivity === "unprotected" ? "Секс без защиты" : entry.sexualActivity === "none" ? "Секса не было" : "Активность не указана"}{entry.sexualComfort ? ` · ${sexualComfortLabel(entry.sexualComfort)}` : ""}</strong></li>)}</ul> : <p className="report-empty">Приватных отметок нет.</p>}<small>Этот раздел включён вами вручную.</small></article><AssessmentReportSection title="Связанные оценки самочувствия" assessments={report.intimateAssessments} /></>}
      <footer><ShieldCheck /><p><strong>Важно</strong><span>Отчёт помогает обсудить наблюдения со специалистом, но не заменяет консультацию и диагностику.</span></p></footer>
    </section>

    <div className="report-action no-print"><div><strong>Отчёт готов</strong><span>{selectedCount} разделов · вы сами выбираете состав</span></div><button disabled={!selectedCount} onClick={() => window.print()}><Printer />Сохранить PDF</button></div>
  </div><AppTabBar active="analytics" /></main>;
}

function AssessmentReportSection({ title, assessments }: { title: string; assessments: HealthAssessment[] }) {
  return <article><h3>{title}</h3>{assessments.length ? <ul>{assessments.map((assessment) => {
    const impact = assessment.answers.lifeImpact ?? "none";
    const effects = assessment.answers.lifeEffects ?? [];
    return <li key={assessment.id}><span>{formatFullDate(assessment.date)} · {ASSESSMENT_LABELS[assessment.type]}</span><strong>{RESULT_LABELS[assessment.resultCode]}. Влияние: {IMPACT_LABELS[impact]}{effects.length ? `. Дополнительно: ${effects.map((effect) => EFFECT_LABELS[effect]).join(", ")}` : ""}.</strong></li>;
  })}</ul> : <p className="report-empty">За выбранный период оценок нет.</p>}<small>Показаны пользовательские ответы и результат информационной маршрутизации, а не диагноз.</small></article>;
}
