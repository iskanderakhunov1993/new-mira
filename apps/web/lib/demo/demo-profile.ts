import type { CycleEntry } from "@/lib/contracts/entry";
import type { MiraProfile } from "@/lib/contracts/profile";

function localDate(offset: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

export function buildLocalDemoProfile(): MiraProfile {
  const starts = [-118, -90, -59, -31, -5];
  const flows: NonNullable<CycleEntry["period"]>[] = ["medium", "heavy", "medium", "light"];
  const entries = starts.flatMap((startOffset, cycleIndex) => (
    flows.map((period, dayIndex) => ({
      date: localDate(startOffset + dayIndex),
      period,
      periodStarted: dayIndex === 0,
      periodEnded: dayIndex === flows.length - 1,
      pain: dayIndex === 0 ? (cycleIndex % 3) + 3 : undefined,
      mood: dayIndex === 1 ? "low" as const : undefined,
      energy: dayIndex === 1 ? "low" as const : undefined,
      symptoms: dayIndex === 1 ? ["Усталость"] : [],
      sleepHours: dayIndex === 1 ? 6.5 : undefined,
    }))
  ));
  return {
    email: "demo@mira.local",
    name: "Анна",
    onboardingComplete: true,
    onboardingStep: 4,
    lastPeriod: localDate(starts.at(-1)!),
    cycleLength: 28,
    cyclePattern: "irregular",
    periodLength: 4,
    entries,
    assessments: [],
    preferences: { cycleForecasts: true, privateInsights: false },
    consents: { healthData: true, privacyPolicy: true, sensitiveInsights: false },
  };
}
