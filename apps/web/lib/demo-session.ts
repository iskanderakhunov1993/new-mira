import { createClient } from "@/lib/supabase/client";

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

const PROFILE_KEY = "mira_demo_profile";
const CURRENT_USER_EMAIL_KEY = "mira_current_user";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getCurrentUserEmail(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(CURRENT_USER_EMAIL_KEY);
}

function setCurrentUserEmail(email: string | null): void {
  if (!isBrowser()) return;
  if (email) {
    window.localStorage.setItem(CURRENT_USER_EMAIL_KEY, email);
  } else {
    window.localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
  }
}

type ApiResult = Record<string, unknown>;

async function fetchJson(url: string, options?: RequestInit): Promise<ApiResult> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const result = await res.json() as ApiResult;
  if (!res.ok && !result.error) result.error = "Request failed";
  return result;
}

export function getProfile(): MiraProfile | null {
  if (!isBrowser()) return null;
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
  void persistProfileToServer(profile);
  return profile;
}

export function clearHealthHistory(): MiraProfile {
  const profile = saveProfile({ entries: [], lastPeriod: undefined });
  return profile;
}

export async function deleteLocalProfile(): Promise<void> {
  const email = getCurrentUserEmail();
  if (email) {
    try {
      await fetchJson("/api/users", { method: "DELETE" });
    } catch {
      // ignore remote delete failure in this prototype
    }
  }

  if (!isBrowser()) return;
  window.localStorage.removeItem(PROFILE_KEY);
  setCurrentUserEmail(null);
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

function getPersistableEmail(profile: Partial<MiraProfile> = {}): string | null {
  return profile.email?.trim().toLowerCase() ?? getCurrentUserEmail();
}

async function persistProfileToServer(profile: MiraProfile): Promise<void> {
  const email = getPersistableEmail(profile);
  if (!email) return;

  setCurrentUserEmail(email);

  try {
    await fetchJson("/api/users", {
      method: "POST",
      body: JSON.stringify({ ...profile, email }),
    });
  } catch {
    // ignore server persistence failure in this prototype
  }
}

export async function loginAccount(email: string, password: string): Promise<MiraProfile> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error("Неверный email или пароль");
  if (!data.user?.email) throw new Error("Ошибка входа");

  setCurrentUserEmail(email.toLowerCase());
  const remote = await syncProfileFromServer();
  return remote ?? saveProfile({ email: data.user.email });
}

export async function registerAccount(email: string, password: string): Promise<{ profile: MiraProfile; requiresEmailConfirmation: boolean }> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
    },
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Ошибка регистрации");

  setCurrentUserEmail(email.toLowerCase());
  const profile = saveProfile({ email: email.toLowerCase(), onboardingComplete: false, entries: [] });
  return { profile, requiresEmailConfirmation: !data.session };
}

export async function syncProfileFromServer(): Promise<MiraProfile | null> {
  const email = getCurrentUserEmail();
  if (!email) return null;

  try {
    const result = await fetchJson("/api/users");
    if (result.error) return null;
    if (result.email) {
      const profile = saveProfile(result as MiraProfile);
      return profile;
    }
  } catch {
    // ignore sync failure
  }

  return null;
}

export async function signOutAccount(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  if (!isBrowser()) return;
  window.localStorage.removeItem(PROFILE_KEY);
  setCurrentUserEmail(null);
}
