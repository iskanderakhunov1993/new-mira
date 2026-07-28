import assert from "node:assert/strict";
import test from "node:test";
import { publicProductEventSchema } from "./public-product-event";

test("public analytics accepts the allow-listed landing event", () => {
  const result = publicProductEventSchema.safeParse({
    name: "landing_view",
    route: "/",
  });

  assert.equal(result.success, true);
});

test("public analytics rejects health data and identifiers", () => {
  const result = publicProductEventSchema.safeParse({
    name: "register_clicked",
    route: "/",
    pain: 8,
    symptoms: ["cramps"],
    email: "person@example.com",
  });

  assert.equal(result.success, false);
});

test("public analytics rejects unknown events and routes", () => {
  assert.equal(publicProductEventSchema.safeParse({ name: "note_saved", route: "/" }).success, false);
  assert.equal(publicProductEventSchema.safeParse({ name: "landing_view", route: "/today" }).success, false);
});

test("public analytics accepts demo funnel events without health payload", () => {
  assert.equal(publicProductEventSchema.safeParse({ name: "demo_started", route: "/demo" }).success, true);
  assert.equal(publicProductEventSchema.safeParse({ name: "demo_completed", route: "/demo" }).success, true);
  assert.equal(publicProductEventSchema.safeParse({
    name: "demo_completed",
    route: "/demo",
    goal: "pain",
  }).success, false);
});
