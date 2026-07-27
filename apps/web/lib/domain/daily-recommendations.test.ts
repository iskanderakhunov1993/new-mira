import test from "node:test";
import assert from "node:assert/strict";
import { buildDailyRecommendations } from "./daily-recommendations";

test("always shows water, activity and first-aid kit without inventing a medication", () => {
  const cards = buildDailyRecommendations({ entries: [], today: "2026-07-22" });
  assert.deepEqual(cards.map((card) => card.kind), ["water", "movement", "kit"]);
});

test("asks to evaluate an already saved intake", () => {
  const cards = buildDailyRecommendations({ entries: [{ date: "2026-07-22", medicationIntakes: [{ id: "1", name: "Назначенный препарат", takenAt: "09:00", reason: "pain", prescribedByDoctor: true, effect: "pending" }] }], today: "2026-07-22" });
  assert.equal(cards[0].title, "Оценить эффект: Назначенный препарат");
});

test("reminds about a recent supplement as the user's plan", () => {
  const cards = buildDailyRecommendations({ entries: [{ date: "2026-07-21", medicationIntakes: [{ id: "1", name: "Витамин из плана", takenAt: "09:00", reason: "supplement", prescribedByDoctor: false, effect: "full" }] }], today: "2026-07-22" });
  assert.equal(cards[0].kind, "supplement");
  assert.match(cards[0].description, /не назначение Mira/);
});

test("keeps the activity module but routes severe pain to a safety check", () => {
  const cards = buildDailyRecommendations({ entries: [{ date: "2026-07-22", pain: 8 }], today: "2026-07-22" });
  const activity = cards.find((card) => card.kind === "movement");
  assert.equal(activity?.title, "Сначала оцените самочувствие");
  assert.equal(activity?.href, "/concerns/pain");
});
