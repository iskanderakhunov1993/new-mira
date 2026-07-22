import { completedCycles } from "./cycle-engine";
import type { DomainEntry } from "./types";

export function buildAnalyticsSummary(entries: DomainEntry[], today: string) {
  const cycles = completedCycles(entries, today);
  const lengths = cycles.map((cycle) => cycle.length);
  const symptoms = new Map<string, number>();
  entries.forEach((entry) => entry.symptoms?.forEach((symptom) => symptoms.set(symptom, (symptoms.get(symptom) ?? 0) + 1)));
  const frequentSymptoms = [...symptoms.entries()].filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return {
    completedCount: cycles.length,
    lengths,
    lengthRange: lengths.length ? { min: Math.min(...lengths), max: Math.max(...lengths) } : undefined,
    averagePeriodLength: cycles.length ? Math.round(cycles.reduce((sum, cycle) => sum + cycle.periodDays, 0) / cycles.length) : undefined,
    frequentSymptoms,
    enoughForPatterns: cycles.length >= 3,
  };
}
