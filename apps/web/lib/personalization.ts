import { CycleEntry } from "./demo-session";
import { buildCycles, CycleRecord, daysBetween } from "./cycle-analytics";

const excludedSymptoms = new Set(["Всё в порядке", "Без изменений", "Выделений нет", "Секса не было", "Ничего не принимала"]);
const sensitivePrefixes = ["Секс ", "Оральный", "Анальный", "Мастурбация", "Интимные", "Секс-игрушки", "Оргазм"];

export type SymptomPattern = {
  name: string;
  occurrences: number;
  matchedCycles: number;
  typicalDay: number;
  phase: string;
  cycles: { cycle: CycleRecord; days: number[]; averageIntensity?: number }[];
};

export type Personalization = {
  completed: CycleRecord[];
  current?: CycleRecord;
  patterns: SymptomPattern[];
  sleep: { average: number; lowEnergyAverage: number; difference?: number; entries: number };
  relief: { label: string; averagePain: number; comparedWith?: number; entries: number }[];
  fingerprint: { label: string; value: string }[];
  currentComparison?: { label: string; text: string; tone: "good" | "neutral" | "attention" };
};

function phaseForDay(day: number, cycle: CycleRecord) {
  if (day <= cycle.periodDays) return "во время месячных";
  const ovulationDay = Math.max(cycle.periodDays + 2, cycle.length - 14);
  if (Math.abs(day - ovulationDay) <= 2) return "около овуляции";
  if (day > ovulationDay + 2) return "во второй половине цикла";
  return "в первой половине цикла";
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined;
}

function symptomPatterns(cycles: CycleRecord[]) {
  const occurrences = new Map<string, Map<string, { days: number[]; intensity: number[] }>>();
  cycles.forEach((cycle) => cycle.entries.forEach((entry) => entry.symptoms?.forEach((name) => {
    if (excludedSymptoms.has(name) || sensitivePrefixes.some((prefix) => name.startsWith(prefix))) return;
    const matches = occurrences.get(name) ?? new Map();
    const match = matches.get(cycle.start) ?? { days: [], intensity: [] };
    match.days.push(daysBetween(cycle.start, entry.date) + 1);
    const intensity = entry.symptomIntensity?.[name];
    if (intensity) match.intensity.push(intensity);
    matches.set(cycle.start, match);
    occurrences.set(name, matches);
  })));

  return [...occurrences.entries()].map(([name, matches]) => {
    const matched = cycles.filter((cycle) => matches.has(cycle.start)).map((cycle) => {
      const match = matches.get(cycle.start)!;
      return { cycle, days: match.days, averageIntensity: average(match.intensity) };
    });
    const allDays = matched.flatMap((item) => item.days);
    const typicalDay = Math.round(average(allDays) ?? 1);
    return { name, occurrences: allDays.length, matchedCycles: matched.length, typicalDay, phase: phaseForDay(typicalDay, matched[0]?.cycle ?? cycles[0]), cycles: matched };
  }).filter((pattern) => pattern.matchedCycles >= 2)
    .sort((first, second) => second.matchedCycles - first.matchedCycles || second.occurrences - first.occurrences);
}

function buildRelief(cycles: CycleRecord[]) {
  const methods = new Map<string, number[]>();
  const reliefOptions = new Set(["Обезболивающее", "Йога", "Ходьба", "Медитация", "Плавание"]);
  cycles.flatMap((cycle) => cycle.entries).forEach((entry) => {
    const pain = entry.pain;
    if (!pain) return;
    const labels = entry.symptoms?.filter((symptom) => reliefOptions.has(symptom)) ?? [];
    labels.forEach((label) => methods.set(label, [...(methods.get(label) ?? []), pain]));
  });
  const overall = average([...methods.values()].flat()) ?? 0;
  return [...methods.entries()].filter(([, values]) => values.length >= 2).map(([label, values]) => ({ label, averagePain: average(values) ?? 0, comparedWith: overall, entries: values.length })).sort((first, second) => first.averagePain - second.averagePain).slice(0, 3);
}

export function buildPersonalization(entries: CycleEntry[]): Personalization {
  const allCycles = buildCycles(entries);
  const completed = allCycles.filter((cycle) => !cycle.current).slice(-3);
  const current = allCycles.find((cycle) => cycle.current);
  const patterns = completed.length >= 3 ? symptomPatterns(completed) : [];
  const sleepEntries = completed.flatMap((cycle) => cycle.entries).filter((entry) => entry.sleepHours !== undefined);
  const lowEnergySleep = sleepEntries.filter((entry) => entry.symptoms?.some((symptom) => symptom === "Усталость" || symptom === "Мало энергии"));
  const sleepAverage = average(sleepEntries.map((entry) => entry.sleepHours!)) ?? 0;
  const lowEnergyAverage = average(lowEnergySleep.map((entry) => entry.sleepHours!)) ?? 0;
  const averageLength = average(completed.map((cycle) => cycle.length)) ?? 0;
  const averagePeriod = average(completed.map((cycle) => cycle.periodDays)) ?? 0;
  const mostFrequent = patterns[0];
  const painAverage = average(completed.flatMap((cycle) => cycle.entries.map((entry) => entry.pain).filter((pain): pain is number => pain !== undefined))) ?? 0;
  const currentPain = current ? average(current.entries.map((entry) => entry.pain).filter((pain): pain is number => pain !== undefined)) : undefined;
  const currentComparison = current && completed.length >= 3 ? currentPain === undefined ? { label: "Боль", text: "В текущем цикле пока нет отметок боли для сравнения.", tone: "neutral" as const } : Math.abs(currentPain - painAverage) < 1 ? { label: "Боль", text: "Интенсивность боли пока близка к вашему типичному циклу.", tone: "good" as const } : { label: "Боль", text: `Средняя отмеченная боль ${currentPain > painAverage ? "выше" : "ниже"} типичной на ${Math.abs(currentPain - painAverage).toFixed(1)} пункта.`, tone: currentPain > painAverage ? "attention" as const : "good" as const } : undefined;

  return {
    completed,
    current,
    patterns,
    sleep: { average: sleepAverage, lowEnergyAverage, difference: sleepAverage && lowEnergyAverage ? sleepAverage - lowEnergyAverage : undefined, entries: sleepEntries.length },
    relief: buildRelief(completed),
    fingerprint: [
      { label: "Типичная длина", value: averageLength ? `${Math.round(averageLength)} дней` : "Недостаточно данных" },
      { label: "Месячные", value: averagePeriod ? `${Math.round(averagePeriod)} дней` : "Недостаточно данных" },
      { label: "Частый симптом", value: mostFrequent?.name ?? "Пока не выделен" },
      { label: "Боль", value: painAverage ? `${painAverage.toFixed(1)} из 10` : "Не отмечалась" },
    ],
    currentComparison,
  };
}

export function findSymptomPattern(entries: CycleEntry[], name: string) {
  return buildPersonalization(entries).patterns.find((pattern) => pattern.name === name);
}
