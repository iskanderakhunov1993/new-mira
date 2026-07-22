import assert from "node:assert/strict";
import test from "node:test";
import { buildKnowledgeRecommendations } from "./knowledge-recommendations";

test("recommends current phase and today's recorded state", () => {
  const recommendations = buildKnowledgeRecommendations({ entries: [{ date: "2026-07-22", energy: "low", symptoms: ["Усталость"] }], today: "2026-07-22", phase: "menstruation" });
  assert.deepEqual(recommendations.map((item) => item.articleId), ["daily-period-3", "relief-4", "cycle-basics-1"]);
});

test("prioritizes recorded heavy flow and pain without inventing causes", () => {
  const recommendations = buildKnowledgeRecommendations({ entries: [{ date: "2026-07-22", period: "heavy", pain: 6 }], today: "2026-07-22", phase: "menstruation" });
  assert.deepEqual(recommendations.map((item) => item.articleId), ["flow-1", "relief-1", "daily-period-3"]);
  assert.ok(recommendations.every((item) => !item.reason.toLowerCase().includes("причин")));
});

test("uses neutral starter materials without current data", () => {
  const recommendations = buildKnowledgeRecommendations({ entries: [], today: "2026-07-22" });
  assert.deepEqual(recommendations.map((item) => item.articleId), ["cycle-basics-1", "cycle-basics-2", "daily-period-1"]);
});
