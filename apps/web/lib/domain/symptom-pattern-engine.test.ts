import test from "node:test";
import assert from "node:assert/strict";
import { buildSymptomPatternEvidence } from "./symptom-pattern-engine";
import type { DomainEntry } from "./types";

const period = (date: string): DomainEntry => ({ date, period: "medium", periodStarted: true });

test("finds a symptom repeated on similar cycle days", () => {
  const entries: DomainEntry[] = [period("2026-01-01"), { date: "2026-01-24", symptoms: ["Усталость"] }, period("2026-01-29"), { date: "2026-02-21", symptoms: ["Усталость"] }, period("2026-02-26"), { date: "2026-03-21", symptoms: ["Усталость"] }, period("2026-03-26")];
  const pattern = buildSymptomPatternEvidence(entries)[0];
  assert.equal(pattern.name, "Усталость");
  assert.equal(pattern.matchedCycles, 3);
  assert.equal(pattern.typicalDay, 24);
  assert.equal(pattern.recurrenceRate, 1);
});

test("counts recurrence by cycle rather than repeated days", () => {
  const entries: DomainEntry[] = [period("2026-01-01"), { date: "2026-01-10", symptoms: ["Спазмы"] }, { date: "2026-01-11", symptoms: ["Спазмы"] }, period("2026-01-29"), period("2026-02-26"), { date: "2026-03-07", symptoms: ["Спазмы"] }, period("2026-03-26")];
  const pattern = buildSymptomPatternEvidence(entries)[0];
  assert.equal(pattern.occurrences, 3);
  assert.equal(pattern.matchedCycles, 2);
  assert.equal(pattern.recurrenceRate, 2 / 3);
});

test("normalizes labels and excludes sensitive diary values", () => {
  const entries: DomainEntry[] = [period("2026-01-01"), { date: "2026-01-05", symptoms: [" Головная   боль ", "Секс был"] }, period("2026-01-29"), { date: "2026-02-02", symptoms: ["головная боль", "Секс был"] }, period("2026-02-26"), period("2026-03-26")];
  const patterns = buildSymptomPatternEvidence(entries);
  assert.equal(patterns.length, 1);
  assert.equal(patterns[0].name, "Головная боль");
});

test("returns no patterns before three completed cycles", () => {
  assert.deepEqual(buildSymptomPatternEvidence([period("2026-01-01"), { date: "2026-01-05", symptoms: ["Боль"] }, period("2026-01-29"), period("2026-02-26")]), []);
});
