import test from "node:test";
import assert from "node:assert/strict";
import { buildAssistantGuidance } from "./assistant-guidance";

test("assistant routes strong pain to the safety flow", () => {
  const result = buildAssistantGuidance([{ date: "2026-07-29", pain: 8 }], "2026-07-29");
  assert.equal(result.href, "/concerns/pain");
  assert.equal(result.tone, "attention");
});

test("assistant describes a symptom without inventing a cause", () => {
  const result = buildAssistantGuidance([{ date: "2026-07-29", symptoms: ["Головная боль"] }], "2026-07-29");
  assert.match(result.title, /головная боль/i);
  assert.match(result.message, /не показывает причину/i);
});

test("assistant gives an honest empty state", () => {
  const result = buildAssistantGuidance([], "2026-07-29");
  assert.equal(result.href, "/diary?section=symptoms");
  assert.match(result.message, /Если данных мало/i);
});
