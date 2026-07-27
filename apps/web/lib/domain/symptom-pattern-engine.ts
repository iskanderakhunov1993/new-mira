import { dateDiff, periodStarts } from "./cycle-engine";
import type { DomainEntry } from "./types";

const EXCLUDED = new Set(["всё в порядке", "без изменений", "выделений нет", "секса не было", "ничего не принимала"]);
const SENSITIVE_PREFIXES = ["секс ", "оральный", "анальный", "мастурбация", "интимные", "секс-игрушки", "оргазм"];

export type PatternConfidence = "first_signs" | "moderate" | "strong";

export type SymptomPatternEvidence = {
  key: string;
  name: string;
  occurrences: number;
  matchedCycles: number;
  evaluatedCycles: number;
  recurrenceRate: number;
  typicalDay: number;
  dayRange: { min: number; max: number };
  phase: string;
  confidence: PatternConfidence;
  cycles: { cycleStart: string; cycleLength: number; periodDays: number; days: number[]; averageIntensity?: number }[];
};

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("ru-RU");
}

function cleanLabel(value: string) {
  const label = value.trim().replace(/\s+/g, " ");
  return label ? label[0].toLocaleUpperCase("ru-RU") + label.slice(1) : label;
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined;
}

function median(values: number[]) {
  if (!values.length) return 1;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function phaseForDay(day: number, cycleLength: number, periodDays: number) {
  if (day <= periodDays) return "во время месячных";
  const ovulationEstimate = Math.max(periodDays + 2, cycleLength - 14);
  if (Math.abs(day - ovulationEstimate) <= 2) return "примерно в середине цикла";
  return day < ovulationEstimate ? "в первой половине цикла" : "во второй половине цикла";
}

function completedWindows(entries: DomainEntry[], limit: number) {
  const starts = periodStarts(entries);
  return starts.slice(0, -1).map((start, index) => {
    const next = starts[index + 1];
    const periodDates = entries.filter((entry) => entry.period && entry.date >= start && entry.date < next).map((entry) => entry.date);
    return { start, next, length: dateDiff(start, next), periodDays: periodDates.length };
  }).filter((cycle) => cycle.length >= 15 && cycle.length <= 90).slice(-limit);
}

export function buildSymptomPatternEvidence(entries: DomainEntry[], options: { maxCycles?: number; minCycles?: number } = {}) {
  const cycles = completedWindows(entries, options.maxCycles ?? 6);
  const minCycles = options.minCycles ?? 3;
  if (cycles.length < minCycles) return [];

  const names = new Map<string, string>();
  const evidence = new Map<string, Map<string, { days: number[]; intensities: number[] }>>();
  for (const cycle of cycles) {
    const cycleEntries = entries.filter((entry) => entry.date >= cycle.start && entry.date < cycle.next);
    for (const entry of cycleEntries) {
      for (const rawName of entry.symptoms ?? []) {
        const key = normalize(rawName);
        if (!key || EXCLUDED.has(key) || SENSITIVE_PREFIXES.some((prefix) => key.startsWith(prefix))) continue;
        names.set(key, names.get(key) ?? cleanLabel(rawName));
        const byCycle = evidence.get(key) ?? new Map();
        const observation = byCycle.get(cycle.start) ?? { days: [], intensities: [] };
        const day = dateDiff(cycle.start, entry.date) + 1;
        if (!observation.days.includes(day)) observation.days.push(day);
        const intensity = entry.symptomIntensity?.[rawName];
        if (intensity) observation.intensities.push(intensity);
        byCycle.set(cycle.start, observation);
        evidence.set(key, byCycle);
      }
    }
  }

  return [...evidence.entries()].map<SymptomPatternEvidence>(([key, byCycle]) => {
    const matched = cycles.filter((cycle) => byCycle.has(cycle.start)).map((cycle) => {
      const item = byCycle.get(cycle.start)!;
      return { cycleStart: cycle.start, cycleLength: cycle.length, periodDays: cycle.periodDays, days: item.days.sort((a, b) => a - b), averageIntensity: average(item.intensities) };
    });
    const days = matched.flatMap((item) => item.days);
    const typicalDay = median(days);
    const recurrenceRate = matched.length / cycles.length;
    const spread = Math.max(...days) - Math.min(...days);
    const confidence: PatternConfidence = matched.length >= 4 && recurrenceRate >= 0.67 && spread <= 5 ? "strong" : matched.length >= 3 && recurrenceRate >= 0.6 ? "moderate" : "first_signs";
    const reference = matched[0];
    return { key, name: names.get(key)!, occurrences: days.length, matchedCycles: matched.length, evaluatedCycles: cycles.length, recurrenceRate, typicalDay, dayRange: { min: Math.min(...days), max: Math.max(...days) }, phase: phaseForDay(typicalDay, reference.cycleLength, reference.periodDays), confidence, cycles: matched };
  }).filter((pattern) => pattern.matchedCycles >= 2 && pattern.recurrenceRate >= 0.5)
    .sort((a, b) => b.recurrenceRate - a.recurrenceRate || b.matchedCycles - a.matchedCycles || b.occurrences - a.occurrences);
}
