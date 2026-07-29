import test from "node:test";
import assert from "node:assert/strict";
import { profileUpdateSchema } from "../contracts/profile";

test("profile boundary accepts profile settings without health history", () => {
  const parsed = profileUpdateSchema.safeParse({
    name: "Анна",
    cycleLength: 28,
    preferences: { cycleForecasts: true },
    consents: { healthData: true, privacyPolicy: true },
  });

  assert.equal(parsed.success, true);
});

test("profile boundary does not accept diary entries", () => {
  const parsed = profileUpdateSchema.strict().safeParse({
    name: "Анна",
    entries: [{ date: "2026-07-29", pain: 5 }],
  });

  assert.equal(parsed.success, false);
});
