import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function POST() {
  const user = await getAuthenticatedUser();
  if (!user || user.provider !== "supabase") {
    return NextResponse.json({ error: "Open this action from your Mira web account" }, { status: 401 });
  }
  const botUsername = process.env.TELEGRAM_BOT_USERNAME?.trim().replace(/^@/, "");
  if (!botUsername) return NextResponse.json({ error: "Telegram bot is not configured" }, { status: 503 });
  const miniAppShortName = process.env.TELEGRAM_MINI_APP_SHORT_NAME?.trim() || "mira";

  const token = randomBytes(24).toString("base64url");
  await prisma.accountLinkToken.create({
    data: {
      tokenHash: createHash("sha256").update(token).digest("hex"),
      profileId: user.id,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });
  return NextResponse.json({
    url: `https://t.me/${botUsername}/${miniAppShortName}?startapp=${encodeURIComponent(`link_${token}`)}`,
    expiresInSeconds: 600,
  });
}
