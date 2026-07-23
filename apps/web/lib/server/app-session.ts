import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const TELEGRAM_SESSION_COOKIE = "mira_tg_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 90;

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createTelegramSession(profileId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  await prisma.appSession.create({
    data: { tokenHash: tokenHash(token), profileId, provider: "telegram", expiresAt },
  });
  const cookieStore = await cookies();
  cookieStore.set(TELEGRAM_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function getTelegramSessionProfile() {
  const token = (await cookies()).get(TELEGRAM_SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.appSession.findUnique({
    where: { tokenHash: tokenHash(token) },
    select: { id: true, profileId: true, expiresAt: true },
  });
  if (!session || session.expiresAt <= new Date()) return null;
  void prisma.appSession.update({
    where: { id: session.id },
    data: { lastSeenAt: new Date() },
  }).catch(() => undefined);
  return session.profileId;
}

export async function revokeTelegramSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TELEGRAM_SESSION_COOKIE)?.value;
  if (token) await prisma.appSession.deleteMany({ where: { tokenHash: tokenHash(token) } });
  cookieStore.delete(TELEGRAM_SESSION_COOKIE);
}
