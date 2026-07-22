import assert from "node:assert/strict";
import test from "node:test";
import { buildTodayCards } from "./today-cards";

test("builds an honest empty state without cycle data", () => {
  const cards = buildTodayCards({ entries: [], today: "2026-07-22", hasCycleData: false });
  assert.equal(cards[0].title, "Отметьте начало месячных");
  assert.equal(cards[1].title, "Пока мало данных");
  assert.equal(cards[2].href, "/track");
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
  assert.equal(cards[2].href, "/concerns/pain");
  assert.equal(cards[2].title, "Оценить сильную боль");
});

test("uses a phase article when no attention flow is needed", () => {
  const cards = buildTodayCards({ entries: [], today: "2026-07-22", hasCycleData: true, cycleDay: 20, phase: "luteal" });
  assert.equal(cards[2].href, "/knowledge/pms-1");
  assert.equal(cards[2].title, "Лютеиновая фаза");
});
