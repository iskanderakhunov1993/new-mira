import assert from "node:assert/strict";
import test from "node:test";
import { buildCycleAttention, buildCyclePeriodStats, buildCycleReliability } from "./cycle-period-stats";

const cycles = [
  { completed: true, start: "2025-10-01", length: 30, periodDays: 4 },
  { completed: true, start: "2026-01-15", length: 28, periodDays: 5 },
  { completed: true, start: "2026-04-20", length: 32, periodDays: 4 },
  { completed: true, start: "2026-06-02", length: 31, periodDays: 5 },
  { completed: false, start: "2026-07-03", length: 27, periodDays: 3 },
];

test("filters completed cycles by selected period and calculates metrics", () => {
  const summary = buildCyclePeriodStats(cycles, "3m", "2026-07-30");
  assert.deepEqual(summary.cycles.map((cycle) => cycle.start), ["2026-06-02"]);
  assert.equal(summary.averageCycleLength, 31);
  assert.equal(summary.averagePeriodLength, 5);
  assert.deepEqual(summary.range, { min: 31, max: 31 });
});

test("all time includes every completed cycle but never the current one", () => {
  const summary = buildCyclePeriodStats(cycles, "all", "2026-07-30");
  assert.equal(summary.completedCount, 4);
  assert.deepEqual(summary.range, { min: 28, max: 32 });
});

test("returns unknown metrics instead of zero when the period is empty", () => {
  const summary = buildCyclePeriodStats(cycles, "3m", "2025-03-01");
  assert.equal(summary.completedCount, 0);
  assert.equal(summary.averageCycleLength, undefined);
  assert.equal(summary.averagePeriodLength, undefined);
  assert.equal(summary.range, undefined);
});

test("shows attention only for a meaningful cycle-length change", () => {
  const stable = cycles.slice(0, 4);
  assert.equal(buildCycleAttention(stable), undefined);
  const changed = [...stable.slice(0, 3), { ...stable[3], length: 42 }];
  assert.equal(buildCycleAttention(changed)?.type, "cycle-change");
});

test("prioritizes repeated strong pain over a cycle-length observation", () => {
  const attention = buildCycleAttention([
    ...cycles.slice(0, 3),
    {
      ...cycles[3],
      entries: [
        { date: "2026-06-03", pain: 7 },
        { date: "2026-06-04", pain: 8 },
      ],
    },
  ]);
  assert.equal(attention?.type, "repeated-pain");
});

test("recognizes a recorded period longer than seven days", () => {
  const attention = buildCycleAttention([
    ...cycles.slice(0, 3),
    { ...cycles[3], periodDays: 8 },
  ]);
  assert.equal(attention?.type, "long-period");
});

test("describes reliability honestly for sparse and mature histories", () => {
  assert.deepEqual(buildCycleReliability(0), {
    label: "Пока мало данных",
    text: "0 из 3 циклов для первого сравнения",
  });
  assert.equal(buildCycleReliability(1).label, "Пока мало данных");
  assert.equal(buildCycleReliability(2).text, "2 из 3 циклов для первого сравнения");
  assert.equal(buildCycleReliability(3).label, "Первые наблюдения");
  assert.equal(buildCycleReliability(5).label, "Первые наблюдения");
  assert.equal(buildCycleReliability(6).label, "Более устойчивая картина");
});
