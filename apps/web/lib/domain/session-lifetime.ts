export const AUTH_SESSION_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

const REFRESH_WINDOW_SECONDS = 5 * 60;

export function shouldRefreshSession(expiresAt: number | undefined, nowSeconds = Math.floor(Date.now() / 1000)) {
  return typeof expiresAt === "number" && expiresAt <= nowSeconds + REFRESH_WINDOW_SECONDS;
}
