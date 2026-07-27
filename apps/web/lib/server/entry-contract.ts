import { z } from "zod";

export const dateParamSchema = z.iso.date();
const medicationIntakeSchema = z.object({
  id: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(120),
  activeIngredient: z.string().trim().max(120).optional(),
  dose: z.string().trim().max(80).optional(),
  takenAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  reason: z.enum(["pain", "migraine", "iron", "contraception", "heavy_bleeding", "supplement", "other"]),
  prescribedByDoctor: z.boolean(),
  effect: z.enum(["pending", "full", "partial", "none", "worse"]),
  sideEffects: z.string().trim().max(500).optional(),
}).strict();

export const entryUpdateSchema = z.object({
  period: z.enum(["spotting", "light", "medium", "heavy"]).nullable().optional(),
  periodClots: z.boolean().nullable().optional(),
  periodLeak: z.boolean().nullable().optional(),
  periodNightChange: z.boolean().nullable().optional(),
  periodHourlyChange: z.boolean().nullable().optional(),
  periodStarted: z.boolean().optional(),
  periodEnded: z.boolean().optional(),
  pain: z.number().int().min(0).max(10).nullable().optional(),
  painLocations: z.array(z.string().max(80)).max(20).optional(),
  painTypes: z.array(z.string().max(80)).max(20).optional(),
  painImpact: z.enum(["none", "some", "strong"]).nullable().optional(),
  mood: z.enum(["low", "calm", "good"]).nullable().optional(),
  energy: z.enum(["low", "normal", "high"]).nullable().optional(),
  symptoms: z.array(z.string().max(80)).max(50).optional(),
  symptomIntensity: z.record(z.string(), z.number().int().min(1).max(3)).nullable().optional(),
  medicationIntakes: z.array(medicationIntakeSchema).max(20).nullable().optional(),
  sleepHours: z.number().min(0).max(24).nullable().optional(),
  waterMl: z.number().int().min(0).max(20000).nullable().optional(),
  weightKg: z.number().min(20).max(500).nullable().optional(),
  basalTemperature: z.number().min(30).max(45).nullable().optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
});

type SerializableEntry = {
  date: Date;
  period: string | null;
  periodClots: boolean | null;
  periodLeak: boolean | null;
  periodNightChange: boolean | null;
  periodHourlyChange: boolean | null;
  periodStarted: boolean;
  periodEnded: boolean;
  pain: number | null;
  painLocations: string[];
  painTypes: string[];
  painImpact: string | null;
  mood: string | null;
  energy: string | null;
  symptoms: string[];
  symptomIntensity: unknown;
  medicationIntakes: unknown;
  sleepHours: number | null;
  waterMl: number | null;
  weightKg: number | null;
  basalTemperature: number | null;
  notes: string | null;
};

export function serializeEntry(entry: SerializableEntry) {
  return {
    date: entry.date.toISOString().slice(0, 10),
    period: entry.period ?? undefined,
    periodClots: entry.periodClots ?? undefined,
    periodLeak: entry.periodLeak ?? undefined,
    periodNightChange: entry.periodNightChange ?? undefined,
    periodHourlyChange: entry.periodHourlyChange ?? undefined,
    periodStarted: entry.periodStarted || undefined,
    periodEnded: entry.periodEnded || undefined,
    pain: entry.pain ?? undefined,
    painLocations: entry.painLocations,
    painTypes: entry.painTypes,
    painImpact: entry.painImpact ?? undefined,
    mood: entry.mood ?? undefined,
    energy: entry.energy ?? undefined,
    symptoms: entry.symptoms,
    symptomIntensity: entry.symptomIntensity ?? undefined,
    medicationIntakes: entry.medicationIntakes ?? undefined,
    sleepHours: entry.sleepHours ?? undefined,
    waterMl: entry.waterMl ?? undefined,
    weightKg: entry.weightKg ?? undefined,
    basalTemperature: entry.basalTemperature ?? undefined,
    notes: entry.notes ?? undefined,
  };
}
