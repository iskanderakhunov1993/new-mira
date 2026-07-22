import assert from "node:assert/strict";
import test from "node:test";
import { buildTodayCards } from "./today-cards";

test("hides the observation card when there are fewer than three check-ins", () => {
  const cards = buildTodayCards({ entries: [], today: "2026-07-22", hasCycleData: false });
  assert.equal(cards[0].title, "Прогноз месячных");
  assert.equal(cards.some((card) => card.kind === "observation"), false);
  assert.equal(cards.some((card) => card.kind === "action"), false);
  assert.equal(cards[1].kind, "article");
});

test("formats the first card as a concise forecast range", () => {
  const cards = buildTodayCards({ entries: [], today: "2026-07-22", hasCycleData: true, cycleDay: 1, phase: "menstruation", expectedStart: "2026-08-19", uncertaintyDays: 3 });
  assert.equal(cards[0].title, "Месячные: 16–22 августа");
  assert.equal(cards[0].description, "Открыть прогноз");
  assert.equal(cards[0].href, "/calendar");
});

test("shows a weekly fact only after three check-ins", () => {
  const cards = buildTodayCards({
    entries: [
      { date: "2026-07-20", symptoms: ["Спазмы"] },
      { date: "2026-07-21", symptoms: ["Спазмы"] },
      { date: "2026-07-22", mood: "calm" },
    ],
    today: "2026-07-22",
    hasCycleData: true,
    cycleDay: 8,
    phase: "follicular",
  });
  assert.equal(cards[1].title, "Спазмы — 2 раза");
  assert.match(cards[1].description, /3 отметках/);
});

test("prioritizes a strong-pain flow over educational content", () => {
  const cards = buildTodayCards({ entries: [{ date: "2026-07-22", pain: 8 }], today: "2026-07-22", hasCycleData: true, cycleDay: 3, phase: "menstruation" });
  assert.equal(cards[1].href, "/concerns/pain");
  assert.equal(cards[1].title, "Важно проверить!");
});

test("keeps a minimal reading card when the observation card is hidden", () => {
  const cards = buildTodayCards({ entries: [], today: "2026-07-22", hasCycleData: true, cycleDay: 20, phase: "luteal" });
  assert.equal(cards[1].href, "/knowledge");
  assert.equal(cards[1].title, "Для прочтения");
  assert.equal(cards[1].eyebrow, "Для прочтения");
});
