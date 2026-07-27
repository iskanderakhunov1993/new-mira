import test from "node:test";
import assert from "node:assert/strict";
import { evaluateAssessment } from "./assessment";

test("delay does not infer pregnancy and keeps low-risk answers in self care", () => {
  assert.equal(evaluateAssessment("delay", { delayedDays: 2, pregnancyPossible: false, pregnancyTest: "unknown", pain: 0, unusualBleeding: false, faintOrDizzy: false, shoulderPain: false, factors: [] }), "self_care");
});

test("possible pregnancy with pain and bleeding escalates", () => {
  assert.equal(evaluateAssessment("delay", { delayedDays: 3, pregnancyPossible: true, pregnancyTest: "not_taken", pain: 7, unusualBleeding: true, faintOrDizzy: false, shoulderPain: false, factors: [] }), "emergency");
});

test("severe worsening pain is urgent", () => {
  assert.equal(evaluateAssessment("pain", { intensity: 8, locations: ["Низ живота"], duration: "hours", pattern: "waves", impact: "strong", worsening: true, faintOrDizzy: false, feverOrVomiting: false, pregnancyPossible: false, unusualBleeding: false, actions: [] }), "urgent_care");
});

test("hourly bleeding with dizziness is emergency", () => {
  assert.equal(evaluateAssessment("heavy_flow", { heavierThanUsual: true, changeFrequency: "hourly_several_hours", nightChanges: true, leaks: true, clots: true, durationDays: 3, weakOrDizzy: true, pain: 5, pregnancyPossible: false }), "emergency");
});

test("changed discharge without red flags recommends routine care", () => {
  assert.equal(evaluateAssessment("discharge", { changes: ["smell"], itchOrSore: false, burningUrination: false, pelvicPain: 0, fever: false, unusualBleeding: false, pregnancyPossible: false, faintOrDizzy: false }), "routine_care");
});

test("changed discharge with fever requires assessment today", () => {
  assert.equal(evaluateAssessment("discharge", { changes: ["color"], itchOrSore: true, burningUrination: false, pelvicPain: 3, fever: true, unusualBleeding: false, pregnancyPossible: false, faintOrDizzy: false }), "urgent_care");
});

test("spotting after sex recommends routine care", () => {
  assert.equal(evaluateAssessment("postcoital", { pain: 0, painTiming: [], bleeding: "spotting", dryness: false, dischargeOrBurning: false, pregnancyPossible: false, faintOrDizzy: false }), "routine_care");
});

test("possible pregnancy with postcoital bleeding and severe pain escalates", () => {
  assert.equal(evaluateAssessment("postcoital", { pain: 8, painTiming: ["deep"], bleeding: "spotting", dryness: false, dischargeOrBurning: false, pregnancyPossible: true, faintOrDizzy: false }), "emergency");
});

test("fainting escalates weakness to emergency", () => {
  assert.equal(evaluateAssessment("weakness", { severity: "marked", dizzy: true, fainted: true, shortOfBreath: false, racingHeart: false, heavyBleeding: false, pain: 0, pregnancyPossible: false, unusualBleeding: false }), "emergency");
});

test("mild weakness without warning signs remains self care", () => {
  assert.equal(evaluateAssessment("weakness", { severity: "mild", dizzy: false, fainted: false, shortOfBreath: false, racingHeart: false, heavyBleeding: false, pain: 0, pregnancyPossible: false, unusualBleeding: false }), "self_care");
});

test("strong impact on daily life recommends discussing an otherwise mild symptom", () => {
  assert.equal(evaluateAssessment("pain", { intensity: 2, locations: ["lower_abdomen"], duration: "hours", pattern: "constant", impact: "none", worsening: false, faintOrDizzy: false, feverOrVomiting: false, pregnancyPossible: false, unusualBleeding: false, actions: [], lifeImpact: "strong", lifeEffects: ["sleep_disrupted"] }), "routine_care");
});

test("inability to function requires assessment today", () => {
  assert.equal(evaluateAssessment("discharge", { changes: [], itchOrSore: false, burningUrination: false, pelvicPain: 0, fever: false, unusualBleeding: false, pregnancyPossible: false, faintOrDizzy: false, lifeImpact: "cannot_function", lifeEffects: [] }), "urgent_care");
});
