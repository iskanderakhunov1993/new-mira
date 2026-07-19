export type MiraProfile = {
  email: string;
  name?: string;
  lastPeriod?: string;
  cycleLength?: number;
  periodLength?: number;
  weightKg?: number;
  goal?: string;
  onboardingComplete?: boolean;
  entries?: CycleEntry[];
  preferences?: {
    cycleForecasts?: boolean;
    privateInsights?: boolean;
  };
};

export type CycleEntry = {
  date: string;
  period?: "spotting" | "light" | "medium" | "heavy";
  periodClots?: boolean;
  periodLeak?: boolean;
  periodNightChange?: boolean;
  periodHourlyChange?: boolean;
  pain?: number;
  painLocations?: string[];
  painTypes?: string[];
  painImpact?: "none" | "some" | "strong";
  mood?: "low" | "calm" | "good";
  symptoms?: string[];
  symptomIntensity?: Record<string, 1 | 2 | 3>;
  sleepHours?: number;
  waterMl?: number;
  weightKg?: number;
  basalTemperature?: number;
  notes?: string;
};

export const TEST_ACCOUNT = {
  email: "demo@mira.local",
  password: "mira-demo-2026",
};

const PROFILE_KEY = "mira_demo_profile";

export function getProfile(): MiraProfile | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(PROFILE_KEY);
  if (!value) return null;

  try {
    return JSON.parse(value) as MiraProfile;
  } catch {
    return null;
  }
}

export function saveProfile(update: Partial<MiraProfile>): MiraProfile {
  const profile = { ...getProfile(), ...update } as MiraProfile;
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export function clearHealthHistory(): MiraProfile {
  return saveProfile({ entries: [], lastPeriod: undefined });
}

export function deleteLocalProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROFILE_KEY);
}

export function saveEntry(entry: CycleEntry): MiraProfile {
  const profile = getProfile();
  if (!profile) throw new Error("Профиль не найден");
  const entries = [...(profile.entries ?? [])];
  const existingIndex = entries.findIndex((item) => item.date === entry.date);
  if (existingIndex >= 0) entries[existingIndex] = entry;
  else entries.push(entry);
  entries.sort((a, b) => a.date.localeCompare(b.date));
  return saveProfile({ entries });
}

export function setPeriodForDate(date: string, period?: CycleEntry["period"]): MiraProfile {
  const profile = getProfile();
  if (!profile) throw new Error("Профиль не найден");
  const entries = [...(profile.entries ?? [])];
  const existingIndex = entries.findIndex((item) => item.date === date);
  const existing = existingIndex >= 0 ? entries[existingIndex] : { date };
  const nextEntry: CycleEntry = { ...existing };

  if (period) nextEntry.period = period;
  else delete nextEntry.period;

  if (existingIndex >= 0) {
    const hasDetails = Object.keys(nextEntry).some((key) => key !== "date");
    if (hasDetails) entries[existingIndex] = nextEntry;
    else entries.splice(existingIndex, 1);
  } else if (period) entries.push(nextEntry);

  entries.sort((a, b) => a.date.localeCompare(b.date));
  const previousDate = new Date(`${date}T12:00:00`);
  previousDate.setDate(previousDate.getDate() - 1);
  const previousKey = previousDate.toISOString().slice(0, 10);
  const startsNewPeriod = Boolean(period) && !entries.some((item) => item.date === previousKey && item.period);
  let lastPeriod = startsNewPeriod ? date : profile.lastPeriod;

  if (!period && profile.lastPeriod === date) {
    const markedDates = entries.filter((item) => item.period).map((item) => item.date);
    const latestMarkedDate = markedDates.at(-1);
    if (!latestMarkedDate) lastPeriod = undefined;
    else {
      lastPeriod = latestMarkedDate;
      const cursor = new Date(`${latestMarkedDate}T12:00:00`);
      while (true) {
        cursor.setDate(cursor.getDate() - 1);
        const key = cursor.toISOString().slice(0, 10);
        if (!markedDates.includes(key)) break;
        lastPeriod = key;
      }
    }
  }

  return saveProfile({
    entries,
    lastPeriod,
  });
}

export function createTestAccount(): MiraProfile {
  const entries: CycleEntry[] = [
    { date: "2026-05-26", period: "medium", pain: 5, painLocations: ["Низ живота"], painTypes: ["Тянущая"], painImpact: "some", mood: "low", symptoms: ["Спазмы", "Усталость"], symptomIntensity: { "Спазмы": 2, "Усталость": 2 }, sleepHours: 6 },
    { date: "2026-05-27", period: "heavy", periodClots: true, pain: 6, painLocations: ["Низ живота", "Поясница"], painTypes: ["Спазмы"], painImpact: "some", mood: "low", symptoms: ["Спазмы", "Головная боль"], symptomIntensity: { "Спазмы": 3, "Головная боль": 2 }, sleepHours: 6.5 },
    { date: "2026-05-28", period: "medium", pain: 3, mood: "calm", symptoms: ["Усталость"], sleepHours: 7 },
    { date: "2026-05-29", period: "light", pain: 2, mood: "calm", symptoms: ["Вздутие"], sleepHours: 7.5 },
    { date: "2026-05-30", period: "light", pain: 1, mood: "good", sleepHours: 8 },
    { date: "2026-06-02", mood: "good", symptoms: ["Высокая энергия"], sleepHours: 8 },
    { date: "2026-06-08", mood: "good", symptoms: ["Чувствительная грудь"], sleepHours: 7.5 },
    { date: "2026-06-17", pain: 2, mood: "low", symptoms: ["Вздутие", "Тяга к сладкому"], sleepHours: 6 },
    { date: "2026-06-19", pain: 3, mood: "low", symptoms: ["Головная боль", "Раздражительность"], sleepHours: 5.5 },
    { date: "2026-06-21", pain: 4, mood: "low", symptoms: ["Спазмы", "Усталость"], sleepHours: 6 },
    { date: "2026-06-23", period: "medium", pain: 5, painLocations: ["Низ живота"], painTypes: ["Тянущая"], painImpact: "some", mood: "low", symptoms: ["Спазмы", "Усталость"], symptomIntensity: { "Спазмы": 2, "Усталость": 2 }, sleepHours: 6 },
    { date: "2026-06-24", period: "heavy", periodNightChange: true, pain: 6, painLocations: ["Низ живота", "Поясница"], painTypes: ["Спазмы"], painImpact: "some", mood: "low", symptoms: ["Спазмы", "Головная боль"], symptomIntensity: { "Спазмы": 3, "Головная боль": 2 }, sleepHours: 6.5 },
    { date: "2026-06-25", period: "medium", pain: 4, mood: "calm", symptoms: ["Усталость"], sleepHours: 7 },
    { date: "2026-06-26", period: "light", pain: 2, mood: "calm", symptoms: ["Вздутие"], sleepHours: 7.5 },
    { date: "2026-06-27", period: "light", pain: 1, mood: "good", sleepHours: 8 },
    { date: "2026-07-01", mood: "good", symptoms: ["Высокая энергия"], sleepHours: 8 },
    { date: "2026-07-07", mood: "good", symptoms: ["Чувствительная грудь"], sleepHours: 7.5 },
    { date: "2026-07-14", pain: 2, mood: "calm", symptoms: ["Вздутие"], sleepHours: 7 },
    { date: "2026-07-17", pain: 3, mood: "low", symptoms: ["Головная боль", "Раздражительность"], sleepHours: 5.5 },
    { date: "2026-07-18", pain: 4, mood: "low", symptoms: ["Спазмы", "Усталость"], sleepHours: 6 },
  ];

  const profile: MiraProfile = {
    email: TEST_ACCOUNT.email,
    name: "Анна",
    lastPeriod: "2026-06-23",
    cycleLength: 28,
    periodLength: 5,
    goal: "cycle",
    onboardingComplete: true,
    entries,
  };
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}
