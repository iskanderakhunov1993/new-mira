import { CycleEntry } from "./demo-session";
import { addDays, buildCycleRecords, calculateCycle, dateDiff, periodStarts as domainPeriodStarts, type CycleRecord as DomainCycleRecord } from "./domain/cycle-engine";

export type CycleRecord = DomainCycleRecord<CycleEntry>;
export type PeriodForecast = { latestStart?: string; expectedStart?: string; expectedPeriodDates: string[]; expectedOvulation?: string; fertileWindow: string[]; cycleLength: number; periodLength: number; cycleDay: number; daysUntil: number; uncertaintyDays: number; completedCycles: number; source: "history" | "settings" };

export function daysBetween(first: string, second: string) {
  return dateDiff(first, second);
}

export function dateKeyAfter(date: string, offset: number) {
  return addDays(date, offset);
}

export function formatCycleDate(date: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(`${date}T12:00:00`));
}

export function periodStarts(entries: CycleEntry[]) {
  return domainPeriodStarts(entries);
}

export function buildPeriodForecast(options: { entries: CycleEntry[]; lastPeriod?: string; cycleLength?: number; periodLength?: number; today?: string }): PeriodForecast {
  const today = options.today ?? new Date().toISOString().slice(0, 10);
  const core = calculateCycle({ entries: options.entries, lastPeriod: options.lastPeriod, cycleLength: options.cycleLength, periodLength: options.periodLength, today });
  const cycles = buildCycleRecords(options.entries, today);
  const observedPeriods = cycles.filter((cycle) => cycle.periodDays > 0 && cycle.periodDays <= 14).map((cycle) => cycle.periodDays).slice(-6);
  const periodLength = observedPeriods.length ? Math.round(observedPeriods.reduce((sum, length) => sum + length, 0) / observedPeriods.length) : options.periodLength ?? 5;
  const expectedStart = core.expectedStart;
  const expectedOvulation = expectedStart ? dateKeyAfter(expectedStart, -14) : undefined;
  const fertileWindow = expectedOvulation ? Array.from({ length: 7 }, (_, index) => dateKeyAfter(expectedOvulation, index - 5)) : [];
  return { latestStart: core.latestStart, expectedStart, expectedPeriodDates: expectedStart ? Array.from({ length: periodLength }, (_, index) => dateKeyAfter(expectedStart, index)) : [], expectedOvulation, fertileWindow, cycleLength: core.cycleLength, periodLength, cycleDay: core.cycleDay ?? 1, daysUntil: core.daysUntil ?? core.cycleLength, uncertaintyDays: core.uncertaintyDays, completedCycles: core.completedCycles, source: core.completedCycles ? "history" : "settings" };
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
  return buildCycleRecords(entries, today);
}

export function cycleStatus(cycle: CycleRecord | undefined, completed: CycleRecord[]) {
  if (!cycle) return { label: "Пока нет цикла", tone: "neutral" };
  if (completed.length < 3) return { label: "Пока мало данных для оценки", tone: "neutral" };
  const comparison = completed.filter((item) => item.start !== cycle.start).map((item) => item.length);
  if (!comparison.length) return { label: "Пока мало данных для оценки", tone: "neutral" };
  const min = Math.min(...comparison); const max = Math.max(...comparison);
  return cycle.length >= min && cycle.length <= max ? { label: "В вашем обычном диапазоне", tone: "good" } : { label: "Отличается от предыдущих", tone: "attention" };
}
