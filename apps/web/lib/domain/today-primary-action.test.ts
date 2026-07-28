import assert from "node:assert/strict";
import test from "node:test";
import { buildTodayPrimaryAction } from "./today-primary-action";

test("uses the selected product goal when there is no entry today", () => {
  const result = buildTodayPrimaryAction({
    goal: "medication",
    today: "2026-07-28",
    entries: [],
  });

  assert.equal(result.href, "/diary?section=medication");
  assert.equal(result.title, "Запишите приём и эффект");
});

test("safety check takes priority over the selected goal", () => {
  const result = buildTodayPrimaryAction({
    goal: "understand",
    today: "2026-07-28",
    entries: [{ date: "2026-07-28", pain: 8 }],
  });

  assert.equal(result.tone, "attention");
  assert.equal(result.href, "/concerns/pain");
});

test("saved state closes the daily tracking loop", () => {
  const result = buildTodayPrimaryAction({
    goal: "pain",
    today: "2026-07-28",
    entries: [{ date: "2026-07-28", mood: "calm" }],
  });

  assert.equal(result.eyebrow, "Отметка сохранена");
  assert.equal(result.actionLabel, "Дополнить запись");
});
