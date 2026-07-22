"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Droplet, Sparkles, X } from "lucide-react";
import { getProfile, MiraProfile, setPeriodForDate } from "@/lib/demo-session";
import { AppTabBar } from "@/components/AppTabBar";
import { buildPeriodForecast, dateKeyAfter, formatCycleDate, predictedFertilityDates, predictedPeriodDates } from "@/lib/cycle-analytics";

const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const weekdays = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

export default function CalendarPage() {
  const [profile, setProfile] = useState<MiraProfile | null>(null);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [markMode] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("action") === "period");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    void getProfile().then(setProfile).catch(() => setProfile(null));
  }, []);

  const days = useMemo(() => {
    const firstWeekday = (month.getDay() + 6) % 7;
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array.from({ length: firstWeekday }, () => null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  }, [month]);

  const periodDates = new Set(profile?.entries?.filter((entry) => entry.period).map((entry) => entry.date) ?? []);
  const todayKey = new Date().toISOString().slice(0, 10);
  const forecast = buildPeriodForecast({ entries: profile?.entries ?? [], lastPeriod: profile?.lastPeriod, cycleLength: profile?.cycleLength, periodLength: profile?.periodLength, today: todayKey });
  const predictedDates = predictedPeriodDates(forecast);
  const fertilityDates = predictedFertilityDates(forecast);
  periodDates.forEach((date) => predictedDates.delete(date));
  const visiblePeriodDays = days.filter((day) => {
    if (!day) return false;
    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return periodDates.has(key);
  }).length;
  const forecastRange = forecast.expectedStart ? `${formatCycleDate(dateKeyAfter(forecast.expectedStart, -forecast.uncertaintyDays))} — ${formatCycleDate(dateKeyAfter(forecast.expectedStart, forecast.uncertaintyDays))}` : "Недостаточно данных";

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
            const classes = `${periodDates.has(key) ? "period-day" : ""} ${predictedDates.has(key) ? "predicted-period-day" : ""} ${fertilityDates.fertile.has(key) ? "fertile-day" : ""} ${fertilityDates.ovulation.has(key) ? "ovulation-day" : ""} ${key === todayKey ? "today" : ""}`;
            return markMode ? <button className={classes} disabled={key > todayKey} type="button" onClick={() => togglePeriodDay(key)} key={key}><span>{day}</span>{(periodDates.has(key) || predictedDates.has(key) || fertilityDates.fertile.has(key)) && <i />}</button> : <Link className={classes} href={`/diary?section=period&date=${key}`} key={key}><span>{day}</span>{(periodDates.has(key) || predictedDates.has(key) || fertilityDates.fertile.has(key)) && <i />}</Link>;
          })}</div>
        </section>
        <section className="calendar-legend"><span><i className="actual" />Факт: месячные</span><span><i className="predicted" />Прогноз месячных</span><span><i className="fertile" />Примерные фертильные дни</span><span><i className="ovulation" />Примерная овуляция</span></section>
        <section className="calendar-summary"><span><Droplet /></span><div><small>{forecast.expectedStart ? "Следующие месячные — прогноз" : "Отмечено в этом месяце"}</small><h2>{forecast.expectedStart ? formatCycleDate(forecast.expectedStart) : `${visiblePeriodDays} ${visiblePeriodDays === 1 ? "день" : visiblePeriodDays > 1 && visiblePeriodDays < 5 ? "дня" : "дней"}`}</h2><p>{forecast.expectedStart ? `Возможное начало: ${forecastRange} ${forecast.completedCycles ? `Расчёт по ${forecast.completedCycles} ${forecast.completedCycles === 1 ? "завершённому циклу" : "завершённым циклам"}.` : "Расчёт по настройкам профиля."}` : markMode ? "Нажимайте на прошедшие дни, чтобы добавить или убрать отметку." : "Отметьте начало месячных — после этого появится прогноз."}</p></div></section>
        {forecast.expectedOvulation && <section className="fertility-summary"><span><Sparkles /></span><div><small>Примерный прогноз</small><h2>Овуляция — около {formatCycleDate(forecast.expectedOvulation)}</h2><p>Фертильное окно: {formatCycleDate(forecast.fertileWindow[0])} — {formatCycleDate(forecast.fertileWindow.at(-1)!)} Календарный расчёт не подтверждает овуляцию и не подходит как метод контрацепции.</p></div></section>}
      </div>
      <AppTabBar active="today" />
    </main>
  );
}
