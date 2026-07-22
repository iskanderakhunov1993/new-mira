"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Droplet, Sparkles, X } from "lucide-react";
import { getProfile, MiraProfile, setPeriodForDate } from "@/lib/demo-session";
import { AppTabBar } from "@/components/AppTabBar";
import { buildPeriodForecast, formatCycleDate, predictedFertilityDates } from "@/lib/cycle-analytics";
import { addDays, calculateCycle, periodIntervals } from "@/lib/domain/cycle-engine";
import { buildCalendarMarkers } from "@/lib/domain/calendar-markers";

const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const weekdays = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

function CalendarContent() {
  const search = useSearchParams();
  const requestedDate = search.get("date");
  const selectedDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate ?? "") ? requestedDate ?? undefined : undefined;
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  const [month, setMonth] = useState(() => { const selected = selectedDate ? new Date(`${selectedDate}T12:00:00`) : new Date(); return new Date(selected.getFullYear(), selected.getMonth(), 1); });
  const markMode = search.get("action") === "period";
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    void getProfile().then(setProfile).catch(() => setProfile(null));
  }, []);

  const days = useMemo(() => {
    const firstWeekday = (month.getDay() + 6) % 7;
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array.from({ length: firstWeekday }, () => null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  }, [month]);

  const todayKey = new Date().toISOString().slice(0, 10);
  const periodDates = new Set(profile?.entries?.filter((entry) => entry.period).map((entry) => entry.date) ?? []);
  periodIntervals(profile?.entries ?? [], todayKey).forEach((interval) => { if (!interval.end) return; for (let cursor = interval.start; cursor <= interval.end; cursor = addDays(cursor, 1)) periodDates.add(cursor); });
  const forecast = calculateCycle({ entries: profile?.entries ?? [], lastPeriod: profile?.lastPeriod, cycleLength: profile?.cycleLength, periodLength: profile?.periodLength, cyclePattern: profile?.cyclePattern, today: todayKey });
  const legacyForecast = buildPeriodForecast({ entries: profile?.entries ?? [], lastPeriod: profile?.lastPeriod, cycleLength: profile?.cycleLength, periodLength: profile?.periodLength, today: todayKey });
  const predictedDates = new Set<string>();
  if (forecast.rangeStart && forecast.rangeEnd) for (let cursor = forecast.rangeStart; cursor <= addDays(forecast.rangeEnd, (profile?.periodLength ?? 5) - 1); cursor = addDays(cursor, 1)) predictedDates.add(cursor);
  const fertilityDates = predictedFertilityDates(legacyForecast);
  periodDates.forEach((date) => predictedDates.delete(date));
  const visiblePeriodDays = days.filter((day) => {
    if (!day) return false;
    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return periodDates.has(key);
  }).length;
  const forecastRange = forecast.rangeStart && forecast.rangeEnd ? `${formatCycleDate(forecast.rangeStart)} — ${formatCycleDate(forecast.rangeEnd)}` : "Недостаточно данных";

  function moveMonth(offset: number) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  async function togglePeriodDay(date: string) {
    if (date > todayKey) return;
    const updated = await setPeriodForDate(date, periodDates.has(date) ? undefined : "medium");
    setProfile(updated); setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <main className="calendar-page">
      <div className="calendar-shell">
        <header className="calendar-top"><div><small>История цикла</small><h1>Календарь</h1></div><Link href="/today" aria-label="Закрыть календарь"><X /></Link></header>
        {markMode && <section className="period-calendar-mode"><div><span><Droplet /></span><div><small>Режим отметки</small><h2>Выберите дни месячных</h2><p>Фактические дни — розовые, прогноз — пунктирный.</p></div></div><button type="button" onClick={() => togglePeriodDay(todayKey)}>{periodDates.has(todayKey) ? "Снять отметку сегодня" : "Начались сегодня"}</button>{saved && <small className="calendar-saved"><Check /> Сохранено</small>}</section>}
        <section className="calendar-card">
          <div className="calendar-month"><button type="button" aria-label="Предыдущий месяц" onClick={() => moveMonth(-1)}><ChevronLeft /></button><h2>{monthNames[month.getMonth()]} {month.getFullYear()}</h2><button type="button" aria-label="Следующий месяц" onClick={() => moveMonth(1)}><ChevronRight /></button></div>
          <div className="calendar-weekdays">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
          <div className="calendar-grid">{days.map((day, index) => {
            if (!day) return <span className="empty" key={`empty-${index}`} />;
            const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const entry = profile?.entries?.find((item) => item.date === key);
            const markers = buildCalendarMarkers(entry);
            const visibleMarkers = markers.slice(0, 2);
            const hiddenCount = markers.length - visibleMarkers.length;
            const stateMarkers = markers.length ? <span className="calendar-state-markers" aria-hidden="true">{visibleMarkers.map((marker) => <b key={marker.key}>{marker.emoji}</b>)}{hiddenCount > 0 && <em>+{hiddenCount}</em>}</span> : null;
            const ariaLabel = `${day} ${monthNames[month.getMonth()]}${markers.length ? `: ${markers.map((marker) => marker.label).join(", ")}` : ""}`;
            const classes = `${periodDates.has(key) ? "period-day" : ""} ${predictedDates.has(key) ? "predicted-period-day" : ""} ${fertilityDates.fertile.has(key) ? "fertile-day" : ""} ${fertilityDates.ovulation.has(key) ? "ovulation-day" : ""} ${entry?.symptoms?.length ? "symptom-day" : ""} ${entry ? "entry-day" : ""} ${key === todayKey ? "today" : ""} ${key === selectedDate ? "selected-day" : ""}`;
            const fallbackDot = !markers.length && (predictedDates.has(key) || fertilityDates.fertile.has(key));
            return markMode ? <button aria-label={ariaLabel} className={classes} disabled={key > todayKey} type="button" onClick={() => togglePeriodDay(key)} key={key}><span>{day}</span>{stateMarkers}{fallbackDot && <i />}</button> : <Link aria-label={ariaLabel} className={classes} href={`/track?date=${key}`} key={key}><span>{day}</span>{stateMarkers}{fallbackDot && <i />}</Link>;
          })}</div>
        </section>
        <section className="calendar-legend"><span><i className="actual" />Факт: месячные</span><span><i className="predicted" />Диапазон прогноза</span><span><i className="symptom" />Есть симптомы</span><span><i className="entry" />Есть отметка</span></section>
        <section className="calendar-summary"><span><Droplet /></span><div><small>{forecast.expectedStart ? "Следующие месячные — прогноз" : "Отмечено в этом месяце"}</small><h2>{forecast.expectedStart ? forecastRange : `${visiblePeriodDays} ${visiblePeriodDays === 1 ? "день" : visiblePeriodDays > 1 && visiblePeriodDays < 5 ? "дня" : "дней"}`}</h2><p>{forecast.expectedStart ? `${forecast.explanation} Основано на ${forecast.completedCycles || "настройках профиля"}.` : markMode ? "Нажимайте на прошедшие дни, чтобы добавить или убрать отметку." : "Отметьте начало месячных — после этого появится прогноз."}</p></div></section>
        {legacyForecast.expectedOvulation && <section className="fertility-summary"><span><Sparkles /></span><div><small>Дополнительный календарный ориентир</small><h2>Овуляция — около {formatCycleDate(legacyForecast.expectedOvulation)}</h2><p>Фертильное окно: {formatCycleDate(legacyForecast.fertileWindow[0])} — {formatCycleDate(legacyForecast.fertileWindow.at(-1)!)} Этот расчёт не подтверждает овуляцию и не подходит как метод контрацепции.</p></div></section>}
      </div>
      <AppTabBar active="today" />
    </main>
  );
}

export default function CalendarPage() {
  return <Suspense fallback={<main className="calendar-page" />}><CalendarContent /></Suspense>;
}
