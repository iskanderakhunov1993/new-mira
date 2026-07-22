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
