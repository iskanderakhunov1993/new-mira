import test from "node:test";
import assert from "node:assert/strict";
import { cyclePhaseForDate } from "./cycle-phase";

const base = { entries: [{ date: "2026-07-01", period: "medium" as const, periodStarted: true }], cycleLength: 28, periodLength: 5 };

test("maps the four approximate calendar phases", () => {
  assert.equal(cyclePhaseForDate({ ...base, date: "2026-07-03" }), "menstruation");
  assert.equal(cyclePhaseForDate({ ...base, date: "2026-07-08" }), "follicular");
  assert.equal(cyclePhaseForDate({ ...base, date: "2026-07-15" }), "ovulation-window");
  assert.equal(cyclePhaseForDate({ ...base, date: "2026-07-22" }), "luteal");
});

test("does not invent a phase beyond the configured cycle", () => {
  assert.equal(cyclePhaseForDate({ ...base, date: "2026-08-01" }), undefined);
});

test("uses actual next start for a completed cycle", () => {
  const entries = [...base.entries, { date: "2026-07-31", period: "medium" as const, periodStarted: true }];
  assert.equal(cyclePhaseForDate({ entries, periodLength: 5, date: "2026-07-29" }), "luteal");
});
