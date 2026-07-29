import { createClient } from "@/lib/supabase/client";
import type { MiraProfile } from "@/lib/contracts/profile";
import { getProfile } from "@/lib/client/profile-api";
import { setCachedProfile } from "@/lib/client/profile-state";

export async function loginAccount(email: string, password: string): Promise<MiraProfile> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error("Неверный email или пароль");
  if (!data.user?.email) throw new Error("Ошибка входа");
  setCachedProfile(null);
  return (await getProfile({ refresh: true, includeEntries: false }))!;
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
  setCachedProfile(null);
  const profile = data.session
    ? await getProfile({ refresh: true, includeEntries: false })
    : null;
  return { profile, requiresEmailConfirmation: !data.session };
}

export async function signOutAccount(): Promise<void> {
  setCachedProfile(null);
  await fetch("/api/auth/telegram", { method: "DELETE" }).catch(() => undefined);
  const supabase = createClient();
  await supabase.auth.signOut();
}
