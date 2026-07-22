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
  return rows.filter((entry, index) => entry.periodStarted || index === 0 || dateDiff(rows[index - 1].date, entry.date) > 1).map((entry) => entry.date);
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

export function completedCycles(entries: DomainEntry[], today: string) {
  const starts = periodStarts(entries);
  return starts.map<CycleSummary>((start, index) => {
    const next = starts[index + 1];
    const end = next ? addDays(next, -1) : today;
    return {
      start,
      end,
      length: dateDiff(start, end) + 1,
      periodDays: (() => { const interval = periodIntervals(entries).find((item) => item.start === start); return interval?.end ? dateDiff(start, interval.end) + 1 : entries.filter((entry) => entry.period && entry.date >= start && (!next || entry.date < next)).length; })(),
      completed: Boolean(next),
    };
  }).filter((cycle) => cycle.completed);
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
  const periodLength = options.periodLength ?? 5;
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
