import type { CyclePattern, DomainEntry } from "./types";

const DAY_MS = 86_400_000;

export function dateDiff(first: string, second: string) {
  return Math.round((new Date(`${second}T12:00:00Z`).getTime() - new Date(`${first}T12:00:00Z`).getTime()) / DAY_MS);
}

export function addDays(date: string, days: number) {
  const next = new Date(`${date}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

export function periodStarts(entries: DomainEntry[]) {
  const rows = entries.filter((entry) => entry.period).sort((a, b) => a.date.localeCompare(b.date));
  const explicitStarts = rows.filter((entry) => entry.periodStarted).map((entry) => entry.date);
  if (explicitStarts.length) return explicitStarts;
  return rows.filter((entry, index) => index === 0 || dateDiff(rows[index - 1].date, entry.date) > 1).map((entry) => entry.date);
}

export function periodIntervals(entries: DomainEntry[], today?: string) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  return periodStarts(sorted).map((start, index, starts) => {
    const explicitEnd = sorted.find((entry) => entry.periodEnded && entry.date >= start && (!starts[index + 1] || entry.date < starts[index + 1]));
    const marked = sorted.filter((entry) => entry.period && entry.date >= start && (!starts[index + 1] || entry.date < starts[index + 1])).map((entry) => entry.date);
    return { start, end: explicitEnd?.date ?? marked.at(-1) ?? (index === starts.length - 1 ? today : undefined), ongoing: !explicitEnd && index === starts.length - 1 };
  });
}

export type CycleSummary = {
  start: string;
  end: string;
  length: number;
  periodDays: number;
  completed: boolean;
};

export type CycleRecord<T extends DomainEntry = DomainEntry> = CycleSummary & {
  current: boolean;
  entries: T[];
};

export function buildCycleRecords<T extends DomainEntry>(entries: T[], today: string) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const starts = periodStarts(sorted);
  const intervals = periodIntervals(sorted, today);
  return starts.map<CycleRecord<T>>((start, index) => {
    const nextStart = starts[index + 1];
    const current = !nextStart;
    const end = nextStart ? addDays(nextStart, -1) : today;
    const cycleEntries = sorted.filter((entry) => entry.date >= start && entry.date <= end);
    const interval = intervals.find((item) => item.start === start);
    const markedPeriodDays = cycleEntries.filter((entry) => entry.period).length;
    const periodDays = interval?.end ? Math.max(1, dateDiff(start, interval.end) + 1) : markedPeriodDays;
    return { start, end, length: dateDiff(start, end) + 1, periodDays, completed: !current, current, entries: cycleEntries };
  });
}

export function buildCycleHistorySummary<T extends DomainEntry>(entries: T[], today: string) {
  const cycles = buildCycleRecords(entries, today);
  const completed = cycles.filter((cycle) => cycle.completed);
  const current = cycles.find((cycle) => cycle.current);
  const latestCompleted = completed.at(-1);
  const recentForRange = completed.slice(-3);
  const recentRange = recentForRange.length === 3
    ? {
        min: Math.min(...recentForRange.map((cycle) => cycle.length)),
        max: Math.max(...recentForRange.map((cycle) => cycle.length)),
        sampleSize: recentForRange.length,
      }
    : undefined;

  return {
    cycles,
    completed,
    current,
    latestCompleted,
    recentRange,
    remainingForRange: Math.max(0, 3 - completed.length),
  };
}

export function completedCycles(entries: DomainEntry[], today: string) {
  return buildCycleRecords(entries, today).filter((cycle) => cycle.completed).map((cycle) => ({
    start: cycle.start,
    end: cycle.end,
    length: cycle.length,
    periodDays: cycle.periodDays,
    completed: cycle.completed,
  }));
}

export type CycleForecast = {
  hasData: boolean;
  cycleDay?: number;
  phase?: "menstruation" | "follicular" | "ovulation-window" | "luteal";
  latestStart?: string;
  expectedStart?: string;
  rangeStart?: string;
  rangeEnd?: string;
  daysUntil?: number;
  uncertaintyDays: number;
  cycleLength: number;
  completedCycles: number;
  delayed: boolean;
  explanation: string;
};

export function buildFertilityForecast(forecast: CycleForecast, monthsAhead = 12) {
  const fertile = new Set<string>();
  const ovulation = new Set<string>();
  if (!forecast.expectedStart) return { expectedOvulation: undefined, fertileWindow: [] as string[], fertile, ovulation };

  const expectedOvulation = addDays(forecast.expectedStart, -14);
  const fertileWindow = Array.from({ length: 7 }, (_, index) => addDays(expectedOvulation, index - 5));
  for (let cycle = 0; cycle <= Math.ceil((monthsAhead * 31) / forecast.cycleLength); cycle += 1) {
    const ovulationKey = addDays(expectedOvulation, cycle * forecast.cycleLength);
    ovulation.add(ovulationKey);
    for (let day = -5; day <= 1; day += 1) fertile.add(addDays(ovulationKey, day));
  }
  return { expectedOvulation, fertileWindow, fertile, ovulation };
}

export function calculateCycle(options: {
  entries: DomainEntry[];
  lastPeriod?: string;
  cycleLength?: number;
  periodLength?: number;
  cyclePattern?: CyclePattern;
  today: string;
}): CycleForecast {
  const starts = periodStarts(options.entries);
  const latestStart = starts.at(-1) ?? options.lastPeriod;
  const lengths = starts.slice(1).map((start, index) => dateDiff(starts[index], start)).filter((length) => length >= 15 && length <= 90).slice(-6);
  const configuredLength = options.cycleLength ?? 28;
  const cycleLength = lengths.length ? Math.round(lengths.reduce((sum, length) => sum + length, 0) / lengths.length) : configuredLength;
  const cyclePattern = options.cyclePattern ?? "regular";
  const observedSpread = lengths.length > 1 ? Math.max(...lengths) - Math.min(...lengths) : 0;
  const baseUncertainty = lengths.length >= 3 ? Math.max(1, Math.ceil(observedSpread / 2)) : lengths.length ? 2 : 3;
  const uncertaintyDays = cyclePattern === "regular" ? baseUncertainty : Math.max(5, baseUncertainty + 2);

  if (!latestStart) {
    return { hasData: false, uncertaintyDays, cycleLength, completedCycles: lengths.length, delayed: false, explanation: "Отметьте начало месячных, чтобы Mira рассчитала ориентировочный диапазон." };
  }

  const expectedStart = addDays(latestStart, cycleLength);
  const cycleDay = Math.max(1, dateDiff(latestStart, options.today) + 1);
  const daysUntil = dateDiff(options.today, expectedStart);
  const observedPeriodLengths = buildCycleRecords(options.entries, options.today).filter((cycle) => cycle.periodDays > 0 && cycle.periodDays <= 14).map((cycle) => cycle.periodDays).slice(-6);
  const periodLength = observedPeriodLengths.length ? Math.round(observedPeriodLengths.reduce((sum, length) => sum + length, 0) / observedPeriodLengths.length) : options.periodLength ?? 5;
  const ovulationDay = Math.max(periodLength + 2, cycleLength - 14);
  const phase = cycleDay <= periodLength ? "menstruation" : Math.abs(cycleDay - ovulationDay) <= 2 ? "ovulation-window" : cycleDay < ovulationDay - 2 ? "follicular" : "luteal";

  return {
    hasData: true,
    cycleDay,
    phase,
    latestStart,
    expectedStart,
    rangeStart: addDays(expectedStart, -uncertaintyDays),
    rangeEnd: addDays(expectedStart, uncertaintyDays),
    daysUntil,
    uncertaintyDays,
    cycleLength,
    completedCycles: lengths.length,
    delayed: daysUntil < -uncertaintyDays,
    explanation: cyclePattern === "regular" ? "Прогноз ориентировочный и уточняется по мере накопления данных." : "При нерегулярном цикле диапазон шире и служит только ориентиром.",
  };
}
