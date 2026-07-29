import { z } from "zod";
import type { HealthAssessment } from "../domain/assessment";
import type { CycleEntry } from "./entry";

export const profileUpdateSchema = z.object({
  email: z.email().optional(),
  name: z.string().trim().min(1).max(80).optional(),
  onboardingComplete: z.boolean().optional(),
  onboardingStep: z.number().int().min(1).max(4).optional(),
  goal: z.string().max(80).optional(),
  lastPeriod: z.iso.date().nullable().optional(),
  cycleLength: z.number().int().min(15).max(60).optional(),
  cyclePattern: z.enum(["regular", "irregular", "unknown"]).optional(),
  periodLength: z.number().int().min(1).max(14).optional(),
  weightKg: z.number().min(20).max(500).optional(),
  preferences: z.object({
    cycleForecasts: z.boolean().optional(),
    privateInsights: z.boolean().optional(),
  }).optional(),
  consents: z.object({
    healthData: z.boolean().optional(),
    privacyPolicy: z.boolean().optional(),
    sensitiveInsights: z.boolean().optional(),
  }).optional(),
  firstPromptDismissed: z.boolean().optional(),
  spotlightStatus: z.enum(["pending", "shown", "skipped", "completed"]).optional(),
});

type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

export type MiraProfile = Omit<ProfileUpdate, "lastPeriod" | "consents"> & {
  lastPeriod?: string;
  entries?: CycleEntry[];
  assessments?: HealthAssessment[];
  consents?: NonNullable<ProfileUpdate["consents"]> & {
    acceptedAt?: string;
    version?: string;
  };
};
