import type { MiraProfile } from "@/lib/contracts/profile";
import { buildLocalDemoProfile } from "@/lib/demo/demo-profile";
import { requestJson } from "@/lib/client/http";
import {
  getCachedProfile,
  isLocalDemoMode,
  purgeLegacyBrowserData,
  setCachedProfile,
} from "@/lib/client/profile-state";

async function createEmptyProfile(): Promise<MiraProfile> {
  return requestJson<MiraProfile>("/api/users", { method: "POST", body: "{}" });
}

export async function getProfile(
  options: { refresh?: boolean; includeEntries?: boolean } = {},
): Promise<MiraProfile | null> {
  purgeLegacyBrowserData();
  if (isLocalDemoMode()) {
    if (!getCachedProfile() || options.refresh) setCachedProfile(buildLocalDemoProfile());
    return getCachedProfile();
  }
  const includeEntries = options.includeEntries ?? true;
  const cached = getCachedProfile();
  if (cached && !options.refresh && (!includeEntries || cached.entries !== undefined)) return cached;
  try {
    const profile = options.refresh || !cached
      ? await requestJson<MiraProfile>("/api/users")
      : cached;
    const entries = includeEntries
      ? await requestJson<MiraProfile["entries"]>("/api/entries")
      : cached?.entries;
    setCachedProfile({ ...profile, entries, assessments: cached?.assessments });
  } catch (error) {
    if (error instanceof Error && error.message === "Profile not found") {
      setCachedProfile(await createEmptyProfile());
    } else {
      throw error;
    }
  }
  return getCachedProfile();
}

export async function saveProfile(update: Partial<MiraProfile>): Promise<MiraProfile> {
  const current = getCachedProfile() ?? await getProfile();
  if (!current) throw new Error("Профиль не найден");
  const next = {
    ...current,
    ...update,
    preferences: update.preferences ? { ...current.preferences, ...update.preferences } : current.preferences,
    consents: update.consents ? { ...current.consents, ...update.consents } : current.consents,
  };
  const profileOnly = { ...next };
  delete profileOnly.entries;
  delete profileOnly.assessments;
  const profile = await requestJson<MiraProfile>("/api/users", {
    method: "POST",
    body: JSON.stringify(profileOnly),
  });
  const merged = {
    ...profile,
    entries: current.entries,
    assessments: current.assessments,
  };
  setCachedProfile(merged);
  return merged;
}

export async function clearHealthHistory(): Promise<MiraProfile> {
  await requestJson("/api/entries", { method: "DELETE" });
  const profile = await getProfile({ refresh: true });
  if (!profile) throw new Error("Профиль не найден");
  return profile;
}

export async function deleteLocalProfile(): Promise<void> {
  await requestJson("/api/users", { method: "DELETE" });
  setCachedProfile(null);
}

export async function syncProfileFromServer(): Promise<MiraProfile | null> {
  return getProfile({ refresh: true });
}
