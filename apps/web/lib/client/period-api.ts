import type { CycleEntry } from "@/lib/contracts/entry";
import { requestJson } from "@/lib/client/http";
import { getProfile } from "@/lib/client/profile-api";

export async function startPeriod(date: string, flow: CycleEntry["period"] = "medium") {
  await requestJson("/api/periods/start", { method: "POST", body: JSON.stringify({ date, flow }) });
  return getProfile({ refresh: true });
}

export async function endPeriod(date: string, flow: CycleEntry["period"] = "light") {
  await requestJson("/api/periods/current", { method: "PATCH", body: JSON.stringify({ date, flow }) });
  return getProfile({ refresh: true });
}

export async function deletePeriod(start: string) {
  await requestJson(`/api/periods/${start}`, { method: "DELETE" });
  return getProfile({ refresh: true });
}

export async function updatePeriod(
  start: string,
  update: { startDate: string; endDate?: string; flow: NonNullable<CycleEntry["period"]> },
) {
  await requestJson(`/api/periods/${start}`, { method: "PATCH", body: JSON.stringify(update) });
  return getProfile({ refresh: true });
}
