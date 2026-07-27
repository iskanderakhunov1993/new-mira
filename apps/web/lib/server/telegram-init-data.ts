import { createHmac, timingSafeEqual } from "node:crypto";

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

export type ValidatedTelegramData = {
  authDate: number;
  queryId?: string;
  startParam?: string;
  user: TelegramUser;
};

export function validateTelegramInitData(
  initData: string,
  botToken: string,
  nowSeconds = Math.floor(Date.now() / 1000),
  maxAgeSeconds = 15 * 60,
): ValidatedTelegramData | null {
  if (!initData || !botToken) return null;
  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");
  if (!receivedHash || !/^[a-f0-9]{64}$/i.test(receivedHash)) return null;

  params.delete("hash");
  const dataCheckString = [...params.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const expectedHash = createHmac("sha256", secret).update(dataCheckString).digest();
  const actualHash = Buffer.from(receivedHash, "hex");
  if (actualHash.length !== expectedHash.length || !timingSafeEqual(actualHash, expectedHash)) return null;

  const authDate = Number(params.get("auth_date"));
  if (!Number.isSafeInteger(authDate) || authDate > nowSeconds + 30 || nowSeconds - authDate > maxAgeSeconds) return null;

  try {
    const user = JSON.parse(params.get("user") ?? "") as TelegramUser;
    if (!Number.isSafeInteger(user.id) || user.id <= 0 || typeof user.first_name !== "string") return null;
    return {
      authDate,
      queryId: params.get("query_id") ?? undefined,
      startParam: params.get("start_param") ?? undefined,
      user,
    };
  } catch {
    return null;
  }
}
