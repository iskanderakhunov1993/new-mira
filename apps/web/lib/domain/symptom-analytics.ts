import type { CycleRecord } from "./cycle-engine";
import type { DomainEntry } from "./types";

const EXCLUDED = new Set(["всё в порядке", "без изменений", "выделений нет", "секса не было", "ничего не принимала"]);
const SENSITIVE_PREFIXES = ["секс ", "оральный", "анальный", "мастурбация", "интимные", "секс-игрушки", "оргазм"];

export type SymptomPhase = "menstruation" | "first-half" | "mid-cycle" | "second-half";

export type SymptomAnalytics = {
  evaluatedCycles: number;
  trackedCycles: number;
  totalObservations: number;
  topSymptoms: {
    key: string;
    name: string;
    totalDays: number;
    averageDaysPerCycle: number;
    cyclesWithSymptom: number;
    typicalPhase: SymptomPhase;
    typicalPhaseLabel: string;
  }[];
  comparison?: {
    latestCycleStart: string;
    baselineCycles: number;
    rows: {
      key: string;
      name: string;
      latestDays: number;
      baselineAverageDays: number;
      difference: number;
    }[];
  };
  matrix: {
    maxDay: number;
    rows: {
      key: string;
      name: string;
      days: { day: number; count: number; latest: boolean }[];
    }[];
  };
};

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("ru-RU");
}

function cleanLabel(value: string) {
  const label = value.trim().replace(/\s+/g, " ");
  return label ? label[0].toLocaleUpperCase("ru-RU") + label.slice(1) : label;
}

function isAnalyzable(value: string) {
  const key = normalize(value);
  return Boolean(key) && !EXCLUDED.has(key) && !SENSITIVE_PREFIXES.some((prefix) => key.startsWith(prefix));
}

function dayOfCycle(cycle: CycleRecord, date: string) {
  const start = new Date(`${cycle.start}T12:00:00Z`).getTime();
  const current = new Date(`${date}T12:00:00Z`).getTime();
  return Math.round((current - start) / 86_400_000) + 1;
}

function phaseForDay(day: number, cycle: CycleRecord): SymptomPhase {
  if (day <= Math.max(1, cycle.periodDays)) return "menstruation";
  const ovulationEstimate = Math.max(cycle.periodDays + 2, cycle.length - 14);
  if (Math.abs(day - ovulationEstimate) <= 2) return "mid-cycle";
  return day < ovulationEstimate ? "first-half" : "second-half";
}

function phaseLabel(phase: SymptomPhase) {
  if (phase === "menstruation") return "чаще во время месячных";
  if (phase === "mid-cycle") return "чаще примерно в середине цикла";
  if (phase === "first-half") return "чаще в первой половине цикла";
  return "чаще во второй половине цикла";
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function buildSymptomAnalytics<T extends DomainEntry>(cycles: CycleRecord<T>[], options: { maxCycles?: number; topLimit?: number; matrixLimit?: number } = {}): SymptomAnalytics {
  const completed = cycles.filter((cycle) => cycle.completed && !cycle.current).slice(-(options.maxCycles ?? 6));
  const tracked = completed.filter((cycle) => cycle.entries.some((entry) => (entry.symptoms ?? []).some(isAnalyzable)));
  const names = new Map<string, string>();
  const observations = new Map<string, { cycleStart: string; day: number; phase: SymptomPhase }[]>();

  for (const cycle of tracked) {
    for (const entry of cycle.entries) {
      const seenToday = new Set<string>();
      for (const rawName of entry.symptoms ?? []) {
        if (!isAnalyzable(rawName)) continue;
        const key = normalize(rawName);
        if (seenToday.has(key)) continue;
        seenToday.add(key);
        names.set(key, names.get(key) ?? cleanLabel(rawName));
        const day = dayOfCycle(cycle, entry.date);
        if (day < 1 || day > cycle.length) continue;
        observations.set(key, [...(observations.get(key) ?? []), { cycleStart: cycle.start, day, phase: phaseForDay(day, cycle) }]);
      }
    }
  }

  const ranked = [...observations.entries()].sort((first, second) => second[1].length - first[1].length || names.get(first[0])!.localeCompare(names.get(second[0])!, "ru"));
  const topSymptoms = ranked.slice(0, options.topLimit ?? 5).map(([key, rows]) => {
    const phaseCounts = rows.reduce((accumulator, row) => accumulator.set(row.phase, (accumulator.get(row.phase) ?? 0) + 1), new Map<SymptomPhase, number>());
    const typicalPhase = [...phaseCounts.entries()].sort((first, second) => second[1] - first[1])[0][0];
    return {
      key,
      name: names.get(key)!,
      totalDays: rows.length,
      averageDaysPerCycle: average(tracked.map((cycle) => rows.filter((row) => row.cycleStart === cycle.start).length)),
      cyclesWithSymptom: new Set(rows.map((row) => row.cycleStart)).size,
      typicalPhase,
      typicalPhaseLabel: phaseLabel(typicalPhase),
    };
  });

  const latest = tracked.at(-1);
  const baseline = latest ? tracked.filter((cycle) => cycle.start !== latest.start).slice(-5) : [];
  const comparison = latest && baseline.length >= 3 ? {
    latestCycleStart: latest.start,
    baselineCycles: baseline.length,
    rows: ranked.map(([key, rows]) => {
      const latestDays = rows.filter((row) => row.cycleStart === latest.start).length;
      const baselineAverageDays = average(baseline.map((cycle) => rows.filter((row) => row.cycleStart === cycle.start).length));
      return { key, name: names.get(key)!, latestDays, baselineAverageDays, difference: latestDays - baselineAverageDays };
    }).filter((row) => row.latestDays > 0 || row.baselineAverageDays > 0).sort((first, second) => Math.max(second.latestDays, second.baselineAverageDays) - Math.max(first.latestDays, first.baselineAverageDays)).slice(0, 4),
  } : undefined;

  const matrixCycles = tracked.slice(-3);
  const matrixKeys = ranked.slice(0, options.matrixLimit ?? 6).map(([key]) => key);
  const maxDay = matrixCycles.length ? Math.min(35, Math.max(...matrixCycles.map((cycle) => cycle.length))) : 0;
  const matrix = {
    maxDay,
    rows: matrixKeys.map((key) => ({
      key,
      name: names.get(key)!,
      days: Array.from({ length: maxDay }, (_, index) => {
        const day = index + 1;
        const rows = observations.get(key) ?? [];
        return {
          day,
          count: matrixCycles.filter((cycle) => rows.some((row) => row.cycleStart === cycle.start && row.day === day)).length,
          latest: Boolean(latest && rows.some((row) => row.cycleStart === latest.start && row.day === day)),
        };
      }),
    })),
  };

  return {
    evaluatedCycles: completed.length,
    trackedCycles: tracked.length,
    totalObservations: [...observations.values()].reduce((sum, rows) => sum + rows.length, 0),
    topSymptoms,
    comparison,
    matrix,
  };
}
