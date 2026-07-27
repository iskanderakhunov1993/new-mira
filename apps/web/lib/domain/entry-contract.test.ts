import test from "node:test";
import assert from "node:assert/strict";
import { entryUpdateSchema } from "../server/entry-contract";

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
