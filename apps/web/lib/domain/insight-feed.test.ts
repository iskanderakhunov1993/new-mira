import assert from "node:assert/strict";
import test from "node:test";
import { buildInsightFeed } from "./insight-feed";

test("keeps an empty feed before there is enough personal evidence", () => {
  assert.deepEqual(buildInsightFeed({ completedCycles: 1 }), []);
});

test("builds a cautious pattern from explicit recurrence counts", () => {
  const feed = buildInsightFeed({
    completedCycles: 3,
    pattern: {
      name: "Усталость",
      matchedCycles: 2,
      evaluatedCycles: 3,
      dayRange: { min: 1, max: 3 },
    },
  });
  assert.equal(feed[0].tag, "Повторяется");
  assert.match(feed[0].description, /2 из 3 циклов/);
  assert.match(feed[0].confidence, /2 совпадения/);
  assert.doesNotMatch(feed[0].description, /причин|диагноз/);
});

test("does not duplicate the cycle forecast in insights", () => {
  const feed = buildInsightFeed({ completedCycles: 6 });
  assert.equal(feed.length, 0);
});

test("prioritizes a factual attention item in the feed", () => {
  const feed = buildInsightFeed({
    completedCycles: 4,
    attention: {
      cycleStart: "2026-04-01",
      title: "Последний цикл заметно отличался",
      text: "42 дня против среднего 29 дней.",
    },
  });
  assert.equal(feed[0].tag, "Изменилось");
  assert.match(feed[0].basis, /не диагноз/);
  assert.match(feed[0].nextStep, /отчёт для врача/);
});
