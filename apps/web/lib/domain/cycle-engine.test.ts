import test from "node:test";
import assert from "node:assert/strict";
import { addDays, buildCycleHistorySummary, buildCycleRecords, calculateCycle, completedCycles, periodStarts } from "./cycle-engine";

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

test("uses explicit period markers when an old period day is missing", () => {
  const entries = [
    { date: "2026-01-01", period: "medium" as const, periodStarted: true },
    { date: "2026-01-03", period: "light" as const },
    { date: "2026-01-05", period: "light" as const, periodEnded: true },
    { date: "2026-01-29", period: "medium" as const, periodStarted: true },
  ];

  assert.deepEqual(periodStarts(entries), ["2026-01-01", "2026-01-29"]);
  const cycles = buildCycleRecords(entries, "2026-02-01");
  assert.deepEqual(cycles.map((cycle) => cycle.length), [28, 4]);
  assert.equal(cycles[0].periodDays, 5);
});

test("derives observed period duration from explicit start and end dates", () => {
  const entries = [
    { date: "2026-01-01", period: "medium" as const, periodStarted: true },
    { date: "2026-01-05", period: "light" as const, periodEnded: true },
    { date: "2026-01-29", period: "medium" as const, periodStarted: true },
  ];
  const cycles = buildCycleRecords(entries, "2026-02-01");

  assert.equal(cycles[0].periodDays, 5);
});

test("builds one cycle summary for Today and Analytics", () => {
  const entries = [
    { date: "2026-01-01", period: "medium" as const, periodStarted: true },
    { date: "2026-01-04", period: "light" as const, periodEnded: true },
    { date: "2026-01-29", period: "medium" as const, periodStarted: true },
    { date: "2026-02-02", period: "light" as const, periodEnded: true },
    { date: "2026-02-28", period: "medium" as const, periodStarted: true },
    { date: "2026-03-04", period: "light" as const, periodEnded: true },
    { date: "2026-03-30", period: "medium" as const, periodStarted: true },
  ];
  const summary = buildCycleHistorySummary(entries, "2026-04-03");

  assert.equal(summary.latestCompleted?.length, 30);
  assert.equal(summary.latestCompleted?.periodDays, 5);
  assert.deepEqual(summary.recentRange, { min: 28, max: 30, sampleSize: 3 });
  assert.equal(summary.remainingForRange, 0);
  assert.equal(summary.current?.length, 5);
});

test("does not invent a range before three completed cycles", () => {
  const entries = [
    { date: "2026-01-01", period: "medium" as const, periodStarted: true },
    { date: "2026-01-29", period: "medium" as const, periodStarted: true },
  ];
  const summary = buildCycleHistorySummary(entries, "2026-02-01");

  assert.equal(summary.recentRange, undefined);
  assert.equal(summary.remainingForRange, 2);
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
