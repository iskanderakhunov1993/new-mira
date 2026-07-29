import { z } from "zod";

export const dateParamSchema = z.iso.date();
export const entryRangeSchema = z.object({
  from: dateParamSchema.optional(),
  to: dateParamSchema.optional(),
}).refine(
  ({ from, to }) => !from || !to || from <= to,
  { message: "from must be before or equal to to" },
);

export const medicationIntakeSchema = z.object({
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

export const cycleEntrySchema = z.object({
  date: dateParamSchema,
  period: z.enum(["spotting", "light", "medium", "heavy"]).optional(),
  periodClots: z.boolean().optional(),
  periodLeak: z.boolean().optional(),
  periodNightChange: z.boolean().optional(),
  periodHourlyChange: z.boolean().optional(),
  periodStarted: z.boolean().optional(),
  periodEnded: z.boolean().optional(),
  pain: z.number().int().min(0).max(10).optional(),
  painLocations: z.array(z.string().max(80)).max(20).optional(),
  painTypes: z.array(z.string().max(80)).max(20).optional(),
  painImpact: z.enum(["none", "some", "strong"]).optional(),
  mood: z.enum(["low", "calm", "good"]).optional(),
  energy: z.enum(["low", "normal", "high"]).optional(),
  symptoms: z.array(z.string().max(80)).max(50).optional(),
  symptomIntensity: z.record(
    z.string(),
    z.union([z.literal(1), z.literal(2), z.literal(3)]),
  ).optional(),
  medicationIntakes: z.array(medicationIntakeSchema).max(20).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  waterMl: z.number().int().min(0).max(20000).optional(),
  weightKg: z.number().min(20).max(500).optional(),
  basalTemperature: z.number().min(30).max(45).optional(),
  notes: z.string().trim().max(4000).optional(),
});

export const entryUpdateSchema = cycleEntrySchema.omit({ date: true }).extend({
  period: cycleEntrySchema.shape.period.nullable(),
  periodClots: cycleEntrySchema.shape.periodClots.nullable(),
  periodLeak: cycleEntrySchema.shape.periodLeak.nullable(),
  periodNightChange: cycleEntrySchema.shape.periodNightChange.nullable(),
  periodHourlyChange: cycleEntrySchema.shape.periodHourlyChange.nullable(),
  pain: cycleEntrySchema.shape.pain.nullable(),
  painImpact: cycleEntrySchema.shape.painImpact.nullable(),
  mood: cycleEntrySchema.shape.mood.nullable(),
  energy: cycleEntrySchema.shape.energy.nullable(),
  symptomIntensity: cycleEntrySchema.shape.symptomIntensity.nullable(),
  medicationIntakes: cycleEntrySchema.shape.medicationIntakes.nullable(),
  sleepHours: cycleEntrySchema.shape.sleepHours.nullable(),
  waterMl: cycleEntrySchema.shape.waterMl.nullable(),
  weightKg: cycleEntrySchema.shape.weightKg.nullable(),
  basalTemperature: cycleEntrySchema.shape.basalTemperature.nullable(),
  notes: cycleEntrySchema.shape.notes.nullable(),
});

export type CycleEntry = z.infer<typeof cycleEntrySchema>;
export type MedicationIntake = z.infer<typeof medicationIntakeSchema>;

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

export function serializeEntry(entry: SerializableEntry): CycleEntry {
  return {
    date: entry.date.toISOString().slice(0, 10),
    period: (entry.period ?? undefined) as CycleEntry["period"],
    periodClots: entry.periodClots ?? undefined,
    periodLeak: entry.periodLeak ?? undefined,
    periodNightChange: entry.periodNightChange ?? undefined,
    periodHourlyChange: entry.periodHourlyChange ?? undefined,
    periodStarted: entry.periodStarted || undefined,
    periodEnded: entry.periodEnded || undefined,
    pain: entry.pain ?? undefined,
    painLocations: entry.painLocations,
    painTypes: entry.painTypes,
    painImpact: (entry.painImpact ?? undefined) as CycleEntry["painImpact"],
    mood: (entry.mood ?? undefined) as CycleEntry["mood"],
    energy: (entry.energy ?? undefined) as CycleEntry["energy"],
    symptoms: entry.symptoms,
    symptomIntensity: (entry.symptomIntensity ?? undefined) as CycleEntry["symptomIntensity"],
    medicationIntakes: (entry.medicationIntakes ?? undefined) as CycleEntry["medicationIntakes"],
    sleepHours: entry.sleepHours ?? undefined,
    waterMl: entry.waterMl ?? undefined,
    weightKg: entry.weightKg ?? undefined,
    basalTemperature: entry.basalTemperature ?? undefined,
    notes: entry.notes ?? undefined,
  };
}
