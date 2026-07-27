import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { validateTelegramInitData } from "../server/telegram-init-data";

function signedData(botToken: string, values: Record<string, string>) {
  const dataCheckString = Object.entries(values).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("\n");
  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const hash = createHmac("sha256", secret).update(dataCheckString).digest("hex");
  return new URLSearchParams({ ...values, hash }).toString();
}

test("validates authentic and fresh Telegram init data", () => {
  const now = 1_800_000_000;
  const result = validateTelegramInitData(signedData("bot-token", {
    auth_date: String(now - 20),
    query_id: "query",
    user: JSON.stringify({ id: 42, first_name: "Мира", username: "mira_user" }),
  }), "bot-token", now);
  assert.equal(result?.user.id, 42);
  assert.equal(result?.user.username, "mira_user");
});

test("rejects a modified payload and an expired payload", () => {
  const now = 1_800_000_000;
  const valid = signedData("bot-token", {
    auth_date: String(now - 20),
    user: JSON.stringify({ id: 42, first_name: "Мира" }),
  });
  assert.equal(validateTelegramInitData(valid.replace("42", "43"), "bot-token", now), null);
  const expired = signedData("bot-token", {
    auth_date: String(now - 901),
    user: JSON.stringify({ id: 42, first_name: "Мира" }),
  });
  assert.equal(validateTelegramInitData(expired, "bot-token", now), null);
});
