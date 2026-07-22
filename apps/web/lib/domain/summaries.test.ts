import test from "node:test";
import assert from "node:assert/strict";
import { buildAnalyticsSummary } from "./analytics-summary";
import { hasDailyEntry } from "./entry-summary";
import { buildCheckInResult } from "./result-builder";

test("does not invent sleep or an entry from an empty object", () => {
  assert.equal(hasDailyEntry({ date: "2026-07-22" }), false);
});

test("hides patterns with insufficient completed cycles", () => {
  const summary = buildAnalyticsSummary([{ date: "2026-01-01", period: "medium", periodStarted: true }], "2026-01-10");
  assert.equal(summary.enoughForPatterns, false);
});

test("counts frequent symptoms", () => {
  const summary = buildAnalyticsSummary([
    { date: "2026-01-01", symptoms: ["Спазмы"] },
    { date: "2026-01-02", symptoms: ["Спазмы", "Усталость"] },
  ], "2026-01-03");
  assert.deepEqual(summary.frequentSymptoms, [["Спазмы", 2]]);
});

test("creates cautious result and safety copy", () => {
  const result = buildCheckInResult({ date: "2026-07-22", pain: 8, energy: "low" }, []);
  assert.ok(result.attention?.includes("сильную боль"));
  assert.ok(result.change.includes("мало данных"));
});
