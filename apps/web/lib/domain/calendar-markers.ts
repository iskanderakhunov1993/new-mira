import type { DomainEntry } from "./types";

export type CalendarMarker = { key: string; emoji: string; label: string };

const moodMarkers = {
  low: { emoji: "😔", label: "сниженное настроение" },
  calm: { emoji: "😌", label: "спокойное настроение" },
  good: { emoji: "🙂", label: "хорошее настроение" },
} as const;

export function buildCalendarMarkers(entry?: DomainEntry): CalendarMarker[] {
  if (!entry) return [];
  const markers: CalendarMarker[] = [];
  if (entry.period) markers.push({ key: "period", emoji: "🩸", label: "месячные" });
  if (entry.mood) markers.push({ key: "mood", ...moodMarkers[entry.mood] });
  if ((entry.pain ?? 0) > 0 || entry.symptoms?.length) markers.push({ key: "symptoms", emoji: "🤕", label: "боль или симптомы" });
  if (entry.energy) markers.push({ key: "energy", emoji: "⚡", label: "энергия отмечена" });
  if (entry.sleepHours !== undefined) markers.push({ key: "sleep", emoji: "😴", label: "сон отмечен" });
  if (entry.notes?.trim()) markers.push({ key: "notes", emoji: "📝", label: "есть заметка" });
  return markers;
}
