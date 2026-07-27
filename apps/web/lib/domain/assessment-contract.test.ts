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

test("assessment boundary accepts a complete discharge payload", () => {
  const parsed = assessmentSchema.safeParse({ date: "2026-07-22", type: "discharge", answers: { changes: ["smell"], itchOrSore: true, burningUrination: false, pelvicPain: 2, fever: false, unusualBleeding: false, pregnancyPossible: false, faintOrDizzy: false } });
  assert.equal(parsed.success, true);
});

test("assessment boundary accepts postcoital and weakness payloads", () => {
  const postcoital = assessmentSchema.safeParse({ date: "2026-07-22", type: "postcoital", answers: { pain: 3, painTiming: ["after"], bleeding: "spotting", dryness: false, dischargeOrBurning: false, pregnancyPossible: false, faintOrDizzy: false } });
  const weakness = assessmentSchema.safeParse({ date: "2026-07-22", type: "weakness", answers: { severity: "marked", dizzy: true, fainted: false, shortOfBreath: false, racingHeart: false, heavyBleeding: false, pain: 0, pregnancyPossible: false, unusualBleeding: false } });
  assert.equal(postcoital.success, true);
  assert.equal(weakness.success, true);
});

test("assessment boundary rejects arbitrary sensitive fields", () => {
  const parsed = assessmentSchema.safeParse({ date: "2026-07-22", type: "postcoital", answers: { pain: 0, painTiming: [], bleeding: "none", dryness: false, dischargeOrBurning: false, pregnancyPossible: false, faintOrDizzy: false, partnerName: "private" } });
  assert.equal(parsed.success, false);
});

test("assessment boundary keeps old payloads backward compatible with impact defaults", () => {
  const parsed = assessmentSchema.safeParse({ date: "2026-07-22", type: "weakness", answers: { severity: "mild", dizzy: false, fainted: false, shortOfBreath: false, racingHeart: false, heavyBleeding: false, pain: 0, pregnancyPossible: false, unusualBleeding: false } });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.answers.lifeImpact, "none");
    assert.deepEqual(parsed.data.answers.lifeEffects, []);
  }
});
