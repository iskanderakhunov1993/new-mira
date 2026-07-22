import type { DomainEntry } from "./types";

export function hasDailyEntry(entry?: DomainEntry) {
  return Boolean(entry && (entry.period || entry.mood || entry.energy || typeof entry.pain === "number" || entry.symptoms?.length || entry.notes));
}

export function summarizeEntry(entry?: DomainEntry) {
  if (!hasDailyEntry(entry)) return { hasEntry: false, labels: [] as string[] };
  const labels: string[] = [];
  if (entry?.mood) labels.push(entry.mood === "good" ? "Хорошее настроение" : entry.mood === "calm" ? "Спокойное настроение" : "Тяжёлое настроение");
  if (entry?.energy) labels.push(entry.energy === "high" ? "Много энергии" : entry.energy === "normal" ? "Обычная энергия" : "Мало энергии");
  if (typeof entry?.pain === "number") labels.push(entry.pain ? `Боль ${entry.pain}/10` : "Без боли");
  if (entry?.period) labels.push("Есть выделения");
  if (entry?.symptoms?.length) labels.push(`${entry.symptoms.length} симптома`);
  return { hasEntry: true, labels };
}
