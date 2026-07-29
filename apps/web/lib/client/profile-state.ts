import type { MiraProfile } from "@/lib/contracts/profile";

let memoryProfile: MiraProfile | null = null;
let legacyStoragePurged = false;

export function getCachedProfile(): MiraProfile | null {
  return memoryProfile;
}

export function setCachedProfile(profile: MiraProfile | null): void {
  memoryProfile = profile;
}

export function isLocalDemoMode(): boolean {
  return process.env.NODE_ENV === "development"
    && typeof document !== "undefined"
    && document.cookie.split("; ").includes("mira-local-demo=1");
}

export function purgeLegacyBrowserData(): void {
  if (legacyStoragePurged || typeof window === "undefined") return;
  window.localStorage.removeItem("mira_demo_profile");
  window.localStorage.removeItem("mira_current_user");
  legacyStoragePurged = true;
}
