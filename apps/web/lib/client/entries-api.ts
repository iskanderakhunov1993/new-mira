import type { CycleEntry } from "@/lib/contracts/entry";
import type { MiraProfile } from "@/lib/contracts/profile";
import { requestJson } from "@/lib/client/http";
import { getProfile } from "@/lib/client/profile-api";
import { getCachedProfile, isLocalDemoMode, setCachedProfile } from "@/lib/client/profile-state";

async function refreshProfile(): Promise<MiraProfile> {
  const profile = await getProfile({ refresh: true });
  if (!profile) throw new Error("Профиль не найден");
  return profile;
}

export async function saveEntry(entry: CycleEntry): Promise<MiraProfile> {
  if (isLocalDemoMode()) {
    const current = getCachedProfile() ?? await getProfile();
    if (!current) throw new Error("Профиль не найден");
    const entries = [...(current.entries ?? []).filter((item) => item.date !== entry.date), entry]
      .sort((a, b) => a.date.localeCompare(b.date));
    const profile = { ...current, entries };
    setCachedProfile(profile);
    return profile;
  }
  const { date, ...payload } = entry;
  await requestJson(`/api/entries/${date}`, { method: "PUT", body: JSON.stringify(payload) });
  return refreshProfile();
}

export async function deleteEntry(date: string): Promise<MiraProfile> {
  await requestJson(`/api/entries/${date}`, { method: "DELETE" });
  return refreshProfile();
}

export async function setPeriodForDate(date: string, period?: CycleEntry["period"]): Promise<MiraProfile> {
  await requestJson(`/api/entries/${date}`, { method: "PUT", body: JSON.stringify({ period: period ?? null }) });
  return refreshProfile();
}
