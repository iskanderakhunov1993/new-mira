import test from "node:test";
import assert from "node:assert/strict";
import { buildCycleRecords } from "./cycle-engine";
import { buildSymptomAnalytics } from "./symptom-analytics";
import type { DomainEntry } from "./types";

const period = (date: string): DomainEntry => ({ date, period: "medium", periodStarted: true });

function cycles(entries: DomainEntry[]) {
  return buildCycleRecords(entries, "2026-05-20");
}

test("builds ranked symptom metrics from completed tracked cycles", () => {
  const result = buildSymptomAnalytics(cycles([
    period("2026-01-01"), { date: "2026-01-02", period: "medium", symptoms: ["Спазмы", "Усталость"] }, { date: "2026-01-03", symptoms: ["Спазмы"] },
    period("2026-01-29"), { date: "2026-01-30", period: "medium", symptoms: ["Спазмы"] },
    period("2026-02-26"), { date: "2026-02-27", period: "medium", symptoms: ["Спазмы", "Усталость"] },
    period("2026-03-26"), { date: "2026-03-27", period: "medium", symptoms: ["Спазмы"] },
    period("2026-04-23"),
  ]));
  assert.equal(result.trackedCycles, 4);
  assert.equal(result.topSymptoms[0].name, "Спазмы");
  assert.equal(result.topSymptoms[0].totalDays, 5);
  assert.equal(result.topSymptoms[0].cyclesWithSymptom, 4);
  assert.equal(result.topSymptoms[0].typicalPhaseLabel, "чаще во время месячных");
});

test("compares latest tracked cycle with at least three previous tracked cycles", () => {
  const result = buildSymptomAnalytics(cycles([
    period("2026-01-01"), { date: "2026-01-02", symptoms: ["Головная боль"] },
    period("2026-01-29"), { date: "2026-01-30", symptoms: ["Головная боль"] },
    period("2026-02-26"), { date: "2026-02-27", symptoms: ["Головная боль"] },
    period("2026-03-26"), { date: "2026-03-27", symptoms: ["Головная боль"] }, { date: "2026-03-28", symptoms: ["Головная боль"] },
    period("2026-04-23"),
  ]));
  assert.equal(result.comparison?.baselineCycles, 3);
  assert.equal(result.comparison?.rows[0].latestDays, 2);
  assert.equal(result.comparison?.rows[0].baselineAverageDays, 1);
  assert.equal(result.comparison?.rows[0].difference, 1);
});

test("does not treat sensitive values as symptoms and does not compare sparse tracking", () => {
  const result = buildSymptomAnalytics(cycles([
    period("2026-01-01"), { date: "2026-01-02", symptoms: ["Секс был", "Усталость"] },
    period("2026-01-29"), period("2026-02-26"), period("2026-03-26"),
  ]));
  assert.deepEqual(result.topSymptoms.map((item) => item.name), ["Усталость"]);
  assert.equal(result.trackedCycles, 1);
  assert.equal(result.comparison, undefined);
});

test("marks latest-cycle observations in the matrix", () => {
  const result = buildSymptomAnalytics(cycles([
    period("2026-01-01"), { date: "2026-01-03", symptoms: ["Усталость"] },
    period("2026-01-29"), { date: "2026-01-31", symptoms: ["Усталость"] },
    period("2026-02-26"), { date: "2026-02-28", symptoms: ["Усталость"] },
    period("2026-03-26"),
  ]));
  assert.equal(result.matrix.rows[0].days[2].count, 3);
  assert.equal(result.matrix.rows[0].days[2].latest, true);
});
