import test from "node:test";
import assert from "node:assert/strict";
import { assessmentSchema } from "../server/assessment-contract";

test("assessment boundary accepts a complete pain payload", () => {
  const parsed = assessmentSchema.safeParse({ date: "2026-07-22", type: "pain", answers: { intensity: 5, locations: ["lower_abdomen"], duration: "hours", pattern: "waves", impact: "some", worsening: false, faintOrDizzy: false, feverOrVomiting: false, pregnancyPossible: false, unusualBleeding: false, actions: [] } });
  assert.equal(parsed.success, true);
});

test("assessment boundary rejects out-of-range pain and arbitrary fields", () => {
  const parsed = assessmentSchema.safeParse({ date: "2026-07-22", type: "pain", answers: { intensity: 12, locations: [], duration: "hours", pattern: "waves", impact: "some", worsening: false, faintOrDizzy: false, feverOrVomiting: false, pregnancyPossible: false, unusualBleeding: false, actions: [], diagnosis: "invented" } });
  assert.equal(parsed.success, false);
});

test("assessment boundary rejects unknown scenario types", () => {
  assert.equal(assessmentSchema.safeParse({ date: "2026-07-22", type: "other", answers: {} }).success, false);
});
