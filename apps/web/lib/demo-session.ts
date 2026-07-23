import { createClient } from "@/lib/supabase/client";
import type { AssessmentAnswers, AssessmentType, HealthAssessment } from "@/lib/domain/assessment";

export type MiraProfile = {
  email?: string;
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
  spotlightStatus?: "pending" | "shown" | "skipped" | "completed";
  entries?: CycleEntry[];
  assessments?: HealthAssessment[];
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
  periodStarted?: boolean;
  periodEnded?: boolean;
  pain?: number;
  painLocations?: string[];
  painTypes?: string[];
  painImpact?: "none" | "some" | "strong";
  mood?: "low" | "calm" | "good";
  energy?: "low" | "normal" | "high";
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
  const profileOnly = { ...next };
  delete profileOnly.entries;
  memoryProfile = await fetchJson("/api/users", {
    method: "POST",
    body: JSON.stringify(profileOnly),
  }) as MiraProfile;
  return memoryProfile;
}

export async function clearHealthHistory(): Promise<MiraProfile> {
  await fetchJson("/api/entries", { method: "DELETE" });
  memoryProfile = await getProfile({ refresh: true });
  if (!memoryProfile) throw new Error("Профиль не найден");
  return memoryProfile;
}

export async function deleteLocalProfile(): Promise<void> {
  await fetchJson("/api/users", { method: "DELETE" });
  memoryProfile = null;
}

export async function saveEntry(entry: CycleEntry): Promise<MiraProfile> {
  const { date, ...payload } = entry;
  await fetchJson(`/api/entries/${date}`, { method: "PUT", body: JSON.stringify(payload) });
  const profile = await getProfile({ refresh: true });
  if (!profile) throw new Error("Профиль не найден");
  return profile;
}

export async function deleteEntry(date: string): Promise<MiraProfile> {
  await fetchJson(`/api/entries/${date}`, { method: "DELETE" });
  const profile = await getProfile({ refresh: true });
  if (!profile) throw new Error("Профиль не найден");
  return profile;
}

export async function setPeriodForDate(date: string, period?: CycleEntry["period"]): Promise<MiraProfile> {
  await fetchJson(`/api/entries/${date}`, { method: "PUT", body: JSON.stringify({ period: period ?? null }) });
  const profile = await getProfile({ refresh: true });
  if (!profile) throw new Error("Профиль не найден");
  return profile;
}

export async function startPeriod(date: string, flow: CycleEntry["period"] = "medium") {
  await fetchJson("/api/periods/start", { method: "POST", body: JSON.stringify({ date, flow }) });
  return getProfile({ refresh: true });
}

export async function endPeriod(date: string, flow: CycleEntry["period"] = "light") {
  await fetchJson("/api/periods/current", { method: "PATCH", body: JSON.stringify({ date, flow }) });
  return getProfile({ refresh: true });
}

export async function deletePeriod(start: string) {
  await fetchJson(`/api/periods/${start}`, { method: "DELETE" });
  return getProfile({ refresh: true });
}

export async function getAssessments(): Promise<HealthAssessment[]> {
  return await fetchJson("/api/assessments") as unknown as HealthAssessment[];
}

export async function getAssessment(id: string): Promise<HealthAssessment> {
  return await fetchJson(`/api/assessments/${id}`) as unknown as HealthAssessment;
}

export async function saveAssessment(input: { date: string; type: AssessmentType; answers: AssessmentAnswers }): Promise<HealthAssessment> {
  return await fetchJson("/api/assessments", { method: "POST", body: JSON.stringify(input) }) as unknown as HealthAssessment;
}

export async function deleteAssessment(id: string): Promise<void> {
  await fetchJson(`/api/assessments/${id}`, { method: "DELETE" });
}

export async function updatePeriod(start: string, update: { startDate: string; endDate?: string; flow: NonNullable<CycleEntry["period"]> }) {
  await fetchJson(`/api/periods/${start}`, { method: "PATCH", body: JSON.stringify(update) });
  return getProfile({ refresh: true });
}

export type ProductEventName = "onboarding_started" | "onboarding_step_completed" | "onboarding_completed" | "spotlight_shown" | "spotlight_skipped" | "spotlight_completed" | "checkin_started" | "checkin_completed" | "entry_updated" | "entry_deleted" | "period_started" | "period_ended" | "period_updated" | "period_deleted";

export async function trackProductEvent(name: ProductEventName, route: string) {
  try { await fetchJson("/api/product-events", { method: "POST", body: JSON.stringify({ name, route }) }); } catch { /* аналитика не блокирует основной сценарий */ }
}

export async function loginAccount(email: string, password: string): Promise<MiraProfile> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error("Неверный email или пароль");
  if (!data.user?.email) throw new Error("Ошибка входа");
  memoryProfile = null;
  return (await getProfile({ refresh: true }))!;
}

export async function registerAccount(
  email: string,
  password: string,
  consents: { terms: true; privacyPolicy: true; healthData: true; version: string },
): Promise<{ profile: MiraProfile | null; requiresEmailConfirmation: boolean }> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      data: {
        terms_accepted: consents.terms,
        privacy_policy_consent: consents.privacyPolicy,
        health_data_consent: consents.healthData,
        consent_version: consents.version,
        consent_accepted_at: new Date().toISOString(),
      },
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
  await fetch("/api/auth/telegram", { method: "DELETE" }).catch(() => undefined);
  const supabase = createClient();
  await supabase.auth.signOut();
}
