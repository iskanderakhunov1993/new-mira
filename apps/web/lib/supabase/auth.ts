import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getTelegramSessionProfile } from "@/lib/server/app-session";

export type AuthenticatedUser = Pick<User, "id" | "email" | "user_metadata"> & {
  provider: "supabase" | "telegram";
};

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (!error && data.user) return { ...data.user, provider: "supabase" };
  const profileId = await getTelegramSessionProfile();
  if (!profileId) return null;
  return { id: profileId, email: undefined, user_metadata: {}, provider: "telegram" };
}
