import assert from "node:assert/strict";
import test from "node:test";
import { knowledgeArticles, knowledgeEditorialStatus, knowledgeTopics } from "../knowledge-library";

test("uses exactly ten visual topics for the article library", () => {
  assert.equal(knowledgeTopics.length, 10);
  assert.equal(new Set(knowledgeTopics.map((topic) => topic.id)).size, 10);
});

test("assigns every article to an existing visual topic", () => {
  const topicIds = new Set(knowledgeTopics.map((topic) => topic.id));

  assert.ok(knowledgeArticles.length > 0);
  assert.ok(knowledgeArticles.every((article) => topicIds.has(article.topicId)));
});

test("keeps editorial trust status explicit while articles are drafts", () => {
  assert.equal(knowledgeEditorialStatus.label, "В медицинской редакции");
  assert.match(knowledgeEditorialStatus.review, /не проверено врачом/i);
  assert.match(knowledgeEditorialStatus.sources, /после рецензирования/i);
});
