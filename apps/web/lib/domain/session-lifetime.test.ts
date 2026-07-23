import assert from "node:assert/strict";
import test from "node:test";
import { AUTH_SESSION_MAX_AGE_SECONDS, shouldRefreshSession } from "./session-lifetime";

test("auth cookie keeps a returning PWA signed in well beyond two days", () => {
  assert.equal(AUTH_SESSION_MAX_AGE_SECONDS, 90 * 24 * 60 * 60);
});

test("session is refreshed shortly before access token expiry", () => {
  const now = 1_800_000_000;
  assert.equal(shouldRefreshSession(now + 60, now), true);
  assert.equal(shouldRefreshSession(now + 60 * 60, now), false);
  assert.equal(shouldRefreshSession(undefined, now), false);
});
