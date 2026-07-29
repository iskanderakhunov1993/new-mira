import test from "node:test";
import assert from "node:assert/strict";
import { entryUpdateSchema } from "../server/entry-contract";
import { cycleEntrySchema, entryRangeSchema } from "../contracts/entry";

test("entry boundary accepts a structured medication intake", () => {
  const parsed = entryUpdateSchema.safeParse({
    medicationIntakes: [{
      id: "intake-1",
      name: "Препарат из назначения",
      activeIngredient: "Действующее вещество",
      dose: "200 мг",
      takenAt: "09:30",
      reason: "pain",
      prescribedByDoctor: true,
      effect: "partial",
      sideEffects: "Не отмечены",
    }],
  });
  assert.equal(parsed.success, true);
});

test("entry boundary rejects invalid time and unlisted medication fields", () => {
  const parsed = entryUpdateSchema.safeParse({
    medicationIntakes: [{
      id: "intake-1",
      name: "Препарат",
      takenAt: "утром",
      reason: "pain",
      prescribedByDoctor: false,
      effect: "pending",
      recommendedByMira: true,
    }],
  });
  assert.equal(parsed.success, false);
});

test("client entry and server update share the same field constraints", () => {
  const entry = {
    date: "2026-07-29",
    pain: 11,
    waterMl: 500,
  };

  assert.equal(cycleEntrySchema.safeParse(entry).success, false);
  assert.equal(entryUpdateSchema.safeParse({ pain: entry.pain, waterMl: entry.waterMl }).success, false);
});

test("entry range rejects reversed dates", () => {
  assert.equal(entryRangeSchema.safeParse({ from: "2026-07-30", to: "2026-07-01" }).success, false);
  assert.equal(entryRangeSchema.safeParse({ from: "2026-07-01", to: "2026-07-30" }).success, true);
});
