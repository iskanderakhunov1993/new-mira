import type { MedicationIntake } from "./medication";

export type PeriodFlow = "spotting" | "light" | "medium" | "heavy";
export type Mood = "low" | "calm" | "good";
export type Energy = "low" | "normal" | "high";

export type DomainEntry = {
  date: string;
  period?: PeriodFlow;
  periodStarted?: boolean;
  periodEnded?: boolean;
  mood?: Mood;
  energy?: Energy;
  pain?: number;
  symptoms?: string[];
  symptomIntensity?: Record<string, 1 | 2 | 3>;
  medicationIntakes?: MedicationIntake[];
  waterMl?: number;
  sleepHours?: number;
  notes?: string;
};

export type CyclePattern = "regular" | "irregular" | "unknown";
