import assert from "node:assert/strict";
import test from "node:test";
import { buildCycleDynamics } from "./cycle-dynamics";

test("does not label a cycle as different before three completed cycles", () => {
  const result = buildCycleDynamics([28, 31]);
  assert.equal(result.remainingForChart, 1);
  assert.deepEqual(result.points.map((point) => point.attention), [false, false]);
});

test("compares a new cycle with the previous three completed cycles", () => {
  const result = buildCycleDynamics([28, 29, 27, 40]);
  assert.equal(result.remainingForChart, 0);
  assert.deepEqual(result.points.map((point) => point.attention), [false, false, false, true]);
  assert.deepEqual(result.baseline, { min: 27, max: 29 });
});

test("keeps only the six latest completed cycles", () => {
  const result = buildCycleDynamics([25, 26, 27, 28, 29, 30, 31]);
  assert.deepEqual(result.points.map((point) => point.length), [26, 27, 28, 29, 30, 31]);
});
