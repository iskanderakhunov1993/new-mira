import type { CycleEntry } from "../demo-session";

/**
 * The diary edits the whole selected day. Sending explicit empty values is
 * important: omitted JSON fields mean "leave unchanged" to the entry API.
 */
export function buildEntryReplacementPayload(entry: CycleEntry) {
  return {
    period: entry.period ?? null,
    periodClots: entry.periodClots ?? null,
    periodLeak: entry.periodLeak ?? null,
    periodNightChange: entry.periodNightChange ?? null,
    periodHourlyChange: entry.periodHourlyChange ?? null,
    periodStarted: entry.periodStarted ?? false,
    periodEnded: entry.periodEnded ?? false,
    pain: entry.pain ?? null,
    painLocations: entry.painLocations ?? [],
    painTypes: entry.painTypes ?? [],
    painImpact: entry.painImpact ?? null,
    mood: entry.mood ?? null,
    energy: entry.energy ?? null,
    symptoms: entry.symptoms ?? [],
    symptomIntensity: entry.symptomIntensity ?? null,
    medicationIntakes: entry.medicationIntakes ?? null,
    activityTypes: entry.activityTypes ?? [],
    contraceptionMethod: entry.contraceptionMethod ?? null,
    contraceptionStatus: entry.contraceptionStatus ?? null,
    pregnancyTest: entry.pregnancyTest ?? null,
    ovulationTest: entry.ovulationTest ?? null,
    sexualActivity: entry.sexualActivity ?? null,
    sexualComfort: entry.sexualComfort ?? null,
    sleepHours: entry.sleepHours ?? null,
    waterMl: entry.waterMl ?? null,
    weightKg: entry.weightKg ?? null,
    basalTemperature: entry.basalTemperature ?? null,
    notes: entry.notes ?? null,
  };
}

export type EntryReplacementPayload = ReturnType<typeof buildEntryReplacementPayload>;
