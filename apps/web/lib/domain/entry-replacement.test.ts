import test from "node:test";
import assert from "node:assert/strict";
import { entryUpdateSchema } from "../server/entry-contract";
import { buildEntryReplacementPayload } from "./entry-replacement";

test("diary replacement explicitly clears every optional entry field", () => {
  const payload = buildEntryReplacementPayload({ date: "2026-07-30" });

  assert.equal(payload.period, null);
  assert.equal(payload.pain, null);
  assert.equal(payload.notes, null);
  assert.equal(payload.medicationIntakes, null);
  assert.deepEqual(payload.symptoms, []);
  assert.deepEqual(payload.painLocations, []);
  assert.deepEqual(payload.activityTypes, []);
  assert.equal(payload.periodStarted, false);
  assert.equal(payload.periodEnded, false);
  assert.equal(entryUpdateSchema.safeParse(payload).success, true);
});

test("diary replacement preserves selected structured health data", () => {
  const payload = buildEntryReplacementPayload({
    date: "2026-07-30",
    period: "heavy",
    periodClots: true,
    pain: 8,
    painLocations: ["Низ живота"],
    symptoms: ["Усталость"],
    symptomIntensity: { "Усталость": 3 },
    waterMl: 1200,
    notes: "Запись для врача",
  });

  assert.equal(payload.period, "heavy");
  assert.equal(payload.periodClots, true);
  assert.equal(payload.pain, 8);
  assert.deepEqual(payload.symptomIntensity, { "Усталость": 3 });
  assert.equal(payload.waterMl, 1200);
  assert.equal(payload.notes, "Запись для врача");
  assert.equal(entryUpdateSchema.safeParse(payload).success, true);
});
