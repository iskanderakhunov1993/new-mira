import assert from "node:assert/strict";
import test from "node:test";
import { buildInsightFeed, buildVersionedInsightKey } from "./insight-feed";

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
      confidence: "first_signs",
    },
  });
  assert.equal(feed[0].tag, "Повторяется");
  assert.match(feed[0].description, /2 из 3 циклов/);
  assert.equal(feed[0].confidenceLabel, "Первые признаки повторения");
  assert.deepEqual(feed[0].sample, { matchedCycles: 2, evaluatedCycles: 3 });
  assert.doesNotMatch(feed[0].description, /причин|диагноз/);
});

test("changes the versioned key only when evidence changes", () => {
  const evidence = { name: "Усталость", matchedCycles: 3, evaluatedCycles: 4 };
  assert.equal(buildVersionedInsightKey("pattern", evidence), buildVersionedInsightKey("pattern", evidence));
  assert.notEqual(
    buildVersionedInsightKey("pattern", evidence),
    buildVersionedInsightKey("pattern", { ...evidence, matchedCycles: 4 }),
  );
});

test("maps pattern thresholds to calm confidence language", () => {
  const levels = ["first_signs", "moderate", "strong"] as const;
  const labels = levels.map((confidence) => buildInsightFeed({
    completedCycles: 5,
    pattern: {
      name: "Усталость",
      matchedCycles: 4,
      evaluatedCycles: 5,
      dayRange: { min: 1, max: 3 },
      confidence,
    },
  })[0].confidenceLabel);
  assert.deepEqual(labels, ["Первые признаки повторения", "Повторение заметно", "Устойчивое повторение"]);
  assert.equal(labels.every((label) => !/диагноз|болезн|причин/i.test(label)), true);
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
