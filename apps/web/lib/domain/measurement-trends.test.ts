import test from "node:test";
import assert from "node:assert/strict";
import { buildMeasurementTrend } from "./measurement-trends";

test("builds an ordered measurement trend and factual change", () => {
  const trend = buildMeasurementTrend([
    { date: "2026-07-03", weightKg: 61.2 },
    { date: "2026-07-01", weightKg: 61.5 },
    { date: "2026-07-02" },
  ], "weightKg");
  assert.deepEqual(trend.points.map((point) => point.date), ["2026-07-01", "2026-07-03"]);
  assert.equal(trend.latest, 61.2);
  assert.ok(Math.abs((trend.change ?? 0) + 0.3) < 0.000001);
});

test("does not invent a change from one basal-temperature value", () => {
  const trend = buildMeasurementTrend([{ date: "2026-07-01", basalTemperature: 36.55 }], "basalTemperature");
  assert.equal(trend.latest, 36.55);
  assert.equal(trend.change, undefined);
});
