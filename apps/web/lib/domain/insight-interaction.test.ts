import assert from "node:assert/strict";
import test from "node:test";
import { applyInsightInteraction, insightInteractionRequestSchema } from "./insight-interaction";

test("rejects unknown actions and invalid insight keys", () => {
  assert.equal(insightInteractionRequestSchema.safeParse({ action: "delete", insightKey: "pattern-1" }).success, false);
  assert.equal(insightInteractionRequestSchema.safeParse({ action: "read", insightKey: "" }).success, false);
  assert.equal(insightInteractionRequestSchema.safeParse({ action: "dismiss", insightKey: "a".repeat(201) }).success, false);
});

test("read preserves the first read timestamp", () => {
  const first = new Date("2026-08-02T10:00:00.000Z");
  const second = new Date("2026-08-02T11:00:00.000Z");
  const state = applyInsightInteraction(undefined, "read", first);
  assert.deepEqual(applyInsightInteraction(state, "read", second), state);
});

test("dismiss marks the insight read and restore only clears dismissal", () => {
  const now = new Date("2026-08-02T10:00:00.000Z");
  const dismissed = applyInsightInteraction(undefined, "dismiss", now);
  assert.equal(dismissed.readAt, now);
  assert.equal(dismissed.dismissedAt, now);
  assert.deepEqual(applyInsightInteraction(dismissed, "restore", new Date()), {
    readAt: now,
    dismissedAt: null,
  });
});
