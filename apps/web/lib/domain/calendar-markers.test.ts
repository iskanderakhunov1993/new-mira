import test from "node:test";
import assert from "node:assert/strict";
import { buildCalendarMarkers } from "./calendar-markers";

test("returns ordered category markers for a daily entry", () => {
  const markers = buildCalendarMarkers({ date: "2026-07-22", period: "medium", mood: "low", pain: 5, symptoms: ["Спазмы"], energy: "low", sleepHours: 6, notes: "Важно" });
  assert.deepEqual(markers.map((item) => item.key), ["period", "mood", "symptoms", "energy", "sleep", "notes"]);
});

test("combines pain and symptom details into one calendar category", () => {
  const markers = buildCalendarMarkers({ date: "2026-07-22", pain: 4, symptoms: ["Спазмы", "Вздутие"] });
  assert.deepEqual(markers.map((item) => item.emoji), ["🤕"]);
});

test("does not invent markers for an empty entry", () => {
  assert.deepEqual(buildCalendarMarkers({ date: "2026-07-22" }), []);
});
