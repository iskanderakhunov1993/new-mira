import { AUTH_SESSION_MAX_AGE_SECONDS } from "@/lib/domain/session-lifetime";

export const authCookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
};
