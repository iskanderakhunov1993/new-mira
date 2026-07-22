import { dateDiff, periodStarts } from "./cycle-engine";
import type { DomainEntry } from "./types";

export type CyclePhase = "menstruation" | "follicular" | "ovulation-window" | "luteal";

export function cyclePhaseForDate(options: { entries: DomainEntry[]; lastPeriod?: string; cycleLength?: number; periodLength?: number; date: string }): CyclePhase | undefined {
  const starts = [...new Set([...periodStarts(options.entries), ...(options.lastPeriod ? [options.lastPeriod] : [])])].sort();
  const startIndex = starts.findLastIndex((start) => start <= options.date);
  if (startIndex < 0) return undefined;
  const start = starts[startIndex];
  const nextStart = starts[startIndex + 1];
  const cycleLength = nextStart ? dateDiff(start, nextStart) : options.cycleLength ?? 28;
  const cycleDay = dateDiff(start, options.date) + 1;
  if (cycleDay < 1 || cycleDay > cycleLength) return undefined;
  const entry = options.entries.find((item) => item.date === options.date);
  const periodLength = options.periodLength ?? 5;
  if (entry?.period || cycleDay <= periodLength) return "menstruation";
  const ovulationEstimate = Math.max(periodLength + 2, cycleLength - 14);
  if (Math.abs(cycleDay - ovulationEstimate) <= 2) return "ovulation-window";
  return cycleDay < ovulationEstimate ? "follicular" : "luteal";
}
