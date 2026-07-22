import { z } from "zod";
import { evaluateAssessment, type AssessmentType, type AssessmentAnswers } from "../domain/assessment";

const base = { date: z.iso.date() };
const delay = z.object({ ...base, type: z.literal("delay"), answers: z.object({ delayedDays: z.number().int().min(0).max(365), pregnancyPossible: z.boolean(), pregnancyTest: z.enum(["not_taken", "negative", "positive", "unknown"]), pain: z.number().int().min(0).max(10), unusualBleeding: z.boolean(), faintOrDizzy: z.boolean(), shoulderPain: z.boolean(), factors: z.array(z.enum(["stress", "illness", "routine_change"])).max(3) }).strict() }).strict();
const pain = z.object({ ...base, type: z.literal("pain"), answers: z.object({ intensity: z.number().int().min(0).max(10), locations: z.array(z.enum(["lower_abdomen", "left", "right", "back", "other"])).min(1).max(5), duration: z.enum(["hours", "one_day", "several_days"]), pattern: z.enum(["constant", "waves"]), impact: z.enum(["none", "some", "strong"]), worsening: z.boolean(), faintOrDizzy: z.boolean(), feverOrVomiting: z.boolean(), pregnancyPossible: z.boolean(), unusualBleeding: z.boolean(), actions: z.array(z.enum(["rest", "heat", "medicine", "none"])).max(4) }).strict() }).strict();
const heavyFlow = z.object({ ...base, type: z.literal("heavy_flow"), answers: z.object({ heavierThanUsual: z.boolean(), changeFrequency: z.enum(["four_plus_hours", "two_to_three_hours", "one_to_two_hours", "hourly_several_hours"]), nightChanges: z.boolean(), leaks: z.boolean(), clots: z.boolean(), durationDays: z.number().int().min(1).max(30), weakOrDizzy: z.boolean(), pain: z.number().int().min(0).max(10), pregnancyPossible: z.boolean() }).strict() }).strict();

export const assessmentSchema = z.discriminatedUnion("type", [delay, pain, heavyFlow]);

export function assessmentData(value: z.infer<typeof assessmentSchema>) {
  return { date: new Date(`${value.date}T00:00:00.000Z`), type: value.type, answers: value.answers, resultCode: evaluateAssessment(value.type as AssessmentType, value.answers as AssessmentAnswers) };
}

export function serializeAssessment(value: { id: string; date: Date; type: string; answers: unknown; resultCode: string; createdAt: Date; updatedAt: Date }) {
  return { id: value.id, date: value.date.toISOString().slice(0, 10), type: value.type, answers: value.answers, resultCode: value.resultCode, createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString() };
}
