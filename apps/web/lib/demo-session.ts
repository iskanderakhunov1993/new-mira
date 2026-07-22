import { createClient } from "@/lib/supabase/client";

export type MiraProfile = {
  email: string;
  name?: string;
  lastPeriod?: string;
  cycleLength?: number;
  cyclePattern?: "regular" | "irregular" | "unknown";
  periodLength?: number;
  weightKg?: number;
  goal?: string;
  onboardingComplete?: boolean;
  onboardingStep?: number;
  firstPromptDismissed?: boolean;
  entries?: CycleEntry[];
  preferences?: {
    cycleForecasts?: boolean;
    privateInsights?: boolean;
  };
  consents?: {
    healthData?: boolean;
    privacyPolicy?: boolean;
    sensitiveInsights?: boolean;
    acceptedAt?: string;
    version?: string;
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

type ApiResult = Record<string, unknown>;

// This cache lives only in memory for the current page lifetime. PostgreSQL is
// the sole persistent source of truth; no health data is written to web storage.
let memoryProfile: MiraProfile | null = null;
let legacyStoragePurged = false;

function purgeLegacyBrowserData(): void {
  if (legacyStoragePurged || typeof window === "undefined") return;
  window.localStorage.removeItem("mira_demo_profile");
  window.localStorage.removeItem("mira_current_user");
  legacyStoragePurged = true;
}

async function fetchJson(url: string, options?: RequestInit): Promise<ApiResult> {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const result = await response.json() as ApiResult;
  if (!response.ok) {
    const error = typeof result.error === "string" ? result.error : "Не удалось сохранить данные";
    throw new Error(error);
  }
  return result;
}

async function createEmptyProfile(): Promise<MiraProfile> {
  return await fetchJson("/api/users", { method: "POST", body: "{}" }) as MiraProfile;
}

export async function getProfile(options: { refresh?: boolean } = {}): Promise<MiraProfile | null> {
  purgeLegacyBrowserData();
  if (memoryProfile && !options.refresh) return memoryProfile;
  try {
    memoryProfile = await fetchJson("/api/users") as MiraProfile;
  } catch (error) {
    if (error instanceof Error && error.message === "Profile not found") {
      memoryProfile = await createEmptyProfile();
    } else {
      throw error;
    }
  }
  return memoryProfile;
}

export async function saveProfile(update: Partial<MiraProfile>): Promise<MiraProfile> {
  const current = memoryProfile ?? await getProfile();
  if (!current) throw new Error("Профиль не найден");
  const next = {
    ...current,
    ...update,
    preferences: update.preferences ? { ...current.preferences, ...update.preferences } : current.preferences,
    consents: update.consents ? { ...current.consents, ...update.consents } : current.consents,
  };
  memoryProfile = await fetchJson("/api/users", {
    method: "POST",
    body: JSON.stringify(next),
  }) as MiraProfile;
  return memoryProfile;
}

export async function clearHealthHistory(): Promise<MiraProfile> {
  const current = memoryProfile ?? await getProfile();
  if (!current) throw new Error("Профиль не найден");
  memoryProfile = await fetchJson("/api/users", {
    method: "POST",
    body: JSON.stringify({ ...current, entries: [], lastPeriod: null }),
  }) as MiraProfile;
  return memoryProfile;
}

export async function deleteLocalProfile(): Promise<void> {
  await fetchJson("/api/users", { method: "DELETE" });
  memoryProfile = null;
}

export async function saveEntry(entry: CycleEntry): Promise<MiraProfile> {
  const profile = memoryProfile ?? await getProfile();
  if (!profile) throw new Error("Профиль не найден");
  const entries = [...(profile.entries ?? [])];
  const existingIndex = entries.findIndex((item) => item.date === entry.date);
  if (existingIndex >= 0) entries[existingIndex] = entry;
  else entries.push(entry);
  entries.sort((a, b) => a.date.localeCompare(b.date));
  return saveProfile({ entries });
}

export async function setPeriodForDate(date: string, period?: CycleEntry["period"]): Promise<MiraProfile> {
  const profile = memoryProfile ?? await getProfile();
  if (!profile) throw new Error("Профиль не найден");
  const entries = [...(profile.entries ?? [])];
  const existingIndex = entries.findIndex((item) => item.date === date);
  const nextEntry: CycleEntry = { ...(existingIndex >= 0 ? entries[existingIndex] : { date }) };
  if (period) nextEntry.period = period;
  else delete nextEntry.period;

  if (existingIndex >= 0) {
    if (Object.keys(nextEntry).some((key) => key !== "date")) entries[existingIndex] = nextEntry;
    else entries.splice(existingIndex, 1);
  } else if (period) entries.push(nextEntry);
  entries.sort((a, b) => a.date.localeCompare(b.date));

  const previous = new Date(`${date}T12:00:00`);
  previous.setDate(previous.getDate() - 1);
  const previousKey = previous.toISOString().slice(0, 10);
  const startsNewPeriod = Boolean(period) && !entries.some((item) => item.date === previousKey && item.period);
  let lastPeriod = startsNewPeriod ? date : profile.lastPeriod;
  if (!period && profile.lastPeriod === date) {
    const marked = entries.filter((item) => item.period).map((item) => item.date);
    lastPeriod = marked.at(-1);
    if (lastPeriod) {
      const cursor = new Date(`${lastPeriod}T12:00:00`);
      while (true) {
        cursor.setDate(cursor.getDate() - 1);
        const key = cursor.toISOString().slice(0, 10);
        if (!marked.includes(key)) break;
        lastPeriod = key;
      }
    }
  }
  return saveProfile({ entries, lastPeriod });
}

export async function loginAccount(email: string, password: string): Promise<MiraProfile> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error("Неверный email или пароль");
  if (!data.user?.email) throw new Error("Ошибка входа");
  memoryProfile = null;
  return (await getProfile({ refresh: true }))!;
}

export async function registerAccount(email: string, password: string): Promise<{ profile: MiraProfile | null; requiresEmailConfirmation: boolean }> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      data: { privacy_policy_consent: true, consent_version: "2026-07-22" },
    },
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Ошибка регистрации");
  memoryProfile = null;
  const profile = data.session ? await getProfile({ refresh: true }) : null;
  return { profile, requiresEmailConfirmation: !data.session };
}

export async function syncProfileFromServer(): Promise<MiraProfile | null> {
  return getProfile({ refresh: true });
}

export async function signOutAccount(): Promise<void> {
  memoryProfile = null;
  const supabase = createClient();
  await supabase.auth.signOut();
}
