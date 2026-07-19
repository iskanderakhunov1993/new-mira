import { CycleEntry } from "./demo-session";

export type CycleRecord = { start: string; end: string; length: number; periodDays: number; current: boolean; entries: CycleEntry[] };
export type PeriodForecast = { latestStart?: string; expectedStart?: string; expectedPeriodDates: string[]; expectedOvulation?: string; fertileWindow: string[]; cycleLength: number; periodLength: number; cycleDay: number; daysUntil: number; uncertaintyDays: number; completedCycles: number; source: "history" | "settings" };

export function daysBetween(first: string, second: string) {
  return Math.round((new Date(`${second}T12:00:00`).getTime() - new Date(`${first}T12:00:00`).getTime()) / 86400000);
}

export function dateKeyAfter(date: string, offset: number) {
  const value = new Date(`${date}T12:00:00`); value.setDate(value.getDate() + offset); return value.toISOString().slice(0, 10);
}

export function formatCycleDate(date: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(`${date}T12:00:00`));
}

export function periodStarts(entries: CycleEntry[]) {
  const dates = entries.filter((entry) => entry.period).map((entry) => entry.date).sort();
  return dates.filter((date, index) => index === 0 || daysBetween(dates[index - 1], date) > 1);
}

export function buildPeriodForecast(options: { entries: CycleEntry[]; lastPeriod?: string; cycleLength?: number; periodLength?: number; today?: string }): PeriodForecast {
  const today = options.today ?? new Date().toISOString().slice(0, 10);
  const starts = periodStarts(options.entries);
  const latestStart = starts.at(-1) ?? options.lastPeriod;
  const observedLengths = starts.slice(1).map((start, index) => daysBetween(starts[index], start)).filter((length) => length >= 15 && length <= 90).slice(-6);
  const cycleLength = observedLengths.length ? Math.round(observedLengths.reduce((sum, value) => sum + value, 0) / observedLengths.length) : options.cycleLength ?? 28;
  const actualPeriodLengths = starts.map((start, index) => { const nextStart = starts[index + 1]; return options.entries.filter((entry) => Boolean(entry.period) && entry.date >= start && (!nextStart || entry.date < nextStart)).length; }).filter((length) => length > 0 && length <= 14).slice(-6);
  const periodLength = actualPeriodLengths.length ? Math.round(actualPeriodLengths.reduce((sum, value) => sum + value, 0) / actualPeriodLengths.length) : options.periodLength ?? 5;
  const uncertaintyDays = observedLengths.length >= 3 ? Math.max(1, Math.ceil((Math.max(...observedLengths) - Math.min(...observedLengths)) / 2)) : observedLengths.length ? 2 : 3;
  const expectedStart = latestStart ? dateKeyAfter(latestStart, cycleLength) : undefined;
  const expectedOvulation = expectedStart ? dateKeyAfter(expectedStart, -14) : undefined;
  const fertileWindow = expectedOvulation ? Array.from({ length: 7 }, (_, index) => dateKeyAfter(expectedOvulation, index - 5)) : [];
  return { latestStart, expectedStart, expectedPeriodDates: expectedStart ? Array.from({ length: periodLength }, (_, index) => dateKeyAfter(expectedStart, index)) : [], expectedOvulation, fertileWindow, cycleLength, periodLength, cycleDay: latestStart ? Math.max(1, daysBetween(latestStart, today) + 1) : 1, daysUntil: expectedStart ? daysBetween(today, expectedStart) : cycleLength, uncertaintyDays, completedCycles: observedLengths.length, source: observedLengths.length ? "history" : "settings" };
}

export function predictedPeriodDates(forecast: PeriodForecast, monthsAhead = 12) {
  const dates = new Set<string>();
  if (!forecast.expectedStart) return dates;
  for (let cycle = 0; cycle <= Math.ceil((monthsAhead * 31) / forecast.cycleLength); cycle += 1) {
    const startKey = dateKeyAfter(forecast.expectedStart, cycle * forecast.cycleLength);
    for (let day = 0; day < forecast.periodLength; day += 1) dates.add(dateKeyAfter(startKey, day));
  }
  return dates;
}

export function predictedFertilityDates(forecast: PeriodForecast, monthsAhead = 12) {
  const fertile = new Set<string>();
  const ovulation = new Set<string>();
  if (!forecast.expectedOvulation) return { fertile, ovulation };
  for (let cycle = 0; cycle <= Math.ceil((monthsAhead * 31) / forecast.cycleLength); cycle += 1) {
    const ovulationKey = dateKeyAfter(forecast.expectedOvulation, cycle * forecast.cycleLength);
    ovulation.add(ovulationKey);
    for (let day = -5; day <= 1; day += 1) fertile.add(dateKeyAfter(ovulationKey, day));
  }
  return { fertile, ovulation };
}

export function buildCycles(entries: CycleEntry[], today = new Date().toISOString().slice(0, 10)): CycleRecord[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const periodDates = sorted.filter((entry) => entry.period).map((entry) => entry.date);
  const starts = periodStarts(sorted);
  return starts.map((start, index) => {
    const nextStart = starts[index + 1];
    const current = !nextStart;
    const end = nextStart ? dateKeyAfter(nextStart, -1) : today;
    const periodDays = periodDates.filter((date) => date >= start && (!nextStart || date < nextStart)).length;
    return { start, end, length: daysBetween(start, end) + 1, periodDays, current, entries: sorted.filter((entry) => entry.date >= start && entry.date <= end) };
  });
}

export function cycleStatus(cycle: CycleRecord | undefined, completed: CycleRecord[]) {
  if (!cycle) return { label: "Пока нет цикла", tone: "neutral" };
  if (completed.length < 3) return { label: "Пока мало данных для оценки", tone: "neutral" };
  const comparison = completed.filter((item) => item.start !== cycle.start).map((item) => item.length);
  if (!comparison.length) return { label: "Пока мало данных для оценки", tone: "neutral" };
  const min = Math.min(...comparison); const max = Math.max(...comparison);
  return cycle.length >= min && cycle.length <= max ? { label: "В вашем обычном диапазоне", tone: "good" } : { label: "Отличается от предыдущих", tone: "attention" };
}
