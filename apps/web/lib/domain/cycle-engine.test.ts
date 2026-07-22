import test from "node:test";
import assert from "node:assert/strict";
import { addDays, calculateCycle, completedCycles } from "./cycle-engine";

test("calculates first configured cycle as a range", () => {
  const result = calculateCycle({ entries: [], lastPeriod: "2026-07-05", cycleLength: 28, periodLength: 5, cyclePattern: "regular", today: "2026-07-22" });
  assert.equal(result.cycleDay, 18);
  assert.equal(result.expectedStart, "2026-08-02");
  assert.equal(result.rangeStart, "2026-07-30");
  assert.equal(result.rangeEnd, "2026-08-05");
});

test("widens forecast for irregular cycle", () => {
  const regular = calculateCycle({ entries: [], lastPeriod: "2026-07-01", cyclePattern: "regular", today: "2026-07-10" });
  const irregular = calculateCycle({ entries: [], lastPeriod: "2026-07-01", cyclePattern: "irregular", today: "2026-07-10" });
  assert.ok(irregular.uncertaintyDays > regular.uncertaintyDays);
});

test("builds completed cycles from period starts", () => {
  const entries = [
    { date: "2026-01-01", period: "medium" as const, periodStarted: true },
    { date: "2026-01-02", period: "light" as const },
    { date: "2026-01-29", period: "medium" as const, periodStarted: true },
  ];
  assert.deepEqual(completedCycles(entries, "2026-02-01").map((cycle) => cycle.length), [28]);
});

test("handles year boundary and missing data", () => {
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2028-02-28", 1), "2028-02-29");
  assert.equal(calculateCycle({ entries: [], today: "2026-07-22" }).hasData, false);
});

test("marks a forecast delayed only outside its range", () => {
  const result = calculateCycle({ entries: [], lastPeriod: "2026-06-01", cycleLength: 28, cyclePattern: "regular", today: "2026-07-05" });
  assert.equal(result.delayed, true);
});
