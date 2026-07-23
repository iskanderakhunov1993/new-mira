import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createTelegramSession, revokeTelegramSession } from "@/lib/server/app-session";
import { validateTelegramInitData } from "@/lib/server/telegram-init-data";
import { LEGAL_VERSION } from "@/lib/legal";

export const runtime = "nodejs";

const requestSchema = z.object({
  initData: z.string().min(1).max(16_000),
  termsConsent: z.literal(true).optional(),
  healthDataConsent: z.literal(true).optional(),
});

export async function GET(request: Request) {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME?.trim().replace(/^@/, "");
  if (!botUsername) return NextResponse.redirect(new URL("/telegram", request.url));
  return NextResponse.redirect(`https://t.me/${botUsername}?startapp=register`);
}

export async function POST(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return NextResponse.json({ error: "Telegram is not configured" }, { status: 503 });

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const telegram = validateTelegramInitData(parsed.data.initData, botToken);
  if (!telegram) return NextResponse.json({ error: "Telegram authorization expired or invalid" }, { status: 401 });

  const subject = String(telegram.user.id);
  const displayName = [telegram.user.first_name, telegram.user.last_name].filter(Boolean).join(" ");
  const existingIdentity = await prisma.externalIdentity.findUnique({
    where: { provider_subject: { provider: "telegram", subject } },
    select: { id: true },
  });
  if (!existingIdentity && (!parsed.data.termsConsent || !parsed.data.healthDataConsent)) {
    return NextResponse.json({ requiresConsent: true }, { status: 428 });
  }
  const identity = await prisma.$transaction(async (tx) => {
    let linkedProfileId: string | undefined;
    if (telegram.startParam?.startsWith("link_")) {
      const tokenHash = createHash("sha256").update(telegram.startParam.slice(5)).digest("hex");
      const link = await tx.accountLinkToken.findUnique({ where: { tokenHash } });
      if (link && !link.usedAt && link.expiresAt > new Date()) {
        linkedProfileId = link.profileId;
        await tx.accountLinkToken.update({ where: { id: link.id }, data: { usedAt: new Date() } });
      }
    }
    const existing = await tx.externalIdentity.findUnique({
      where: { provider_subject: { provider: "telegram", subject } },
    });
    if (existing) {
      if (linkedProfileId && existing.profileId !== linkedProfileId) {
        const [entryCount, assessmentCount] = await Promise.all([
          tx.entry.count({ where: { userId: existing.profileId } }),
          tx.healthAssessment.count({ where: { userId: existing.profileId } }),
        ]);
        if (entryCount || assessmentCount) throw new Error("TELEGRAM_PROFILE_HAS_DATA");
        await tx.externalIdentity.update({ where: { id: existing.id }, data: { profileId: linkedProfileId } });
        await tx.profile.delete({ where: { id: existing.profileId } });
      }
      return tx.externalIdentity.update({
        where: { id: existing.id },
        data: { displayName, username: telegram.user.username },
      });
    }
    if (linkedProfileId) {
      return tx.externalIdentity.create({
        data: { provider: "telegram", subject, profileId: linkedProfileId, displayName, username: telegram.user.username },
      });
    }
    const profileId = randomUUID();
    await tx.profile.create({
      data: {
        id: profileId,
        name: displayName || undefined,
        privacyConsent: true,
        healthDataConsent: true,
        consentAcceptedAt: new Date(),
        consentVersion: LEGAL_VERSION,
      },
    });
    return tx.externalIdentity.create({
      data: { provider: "telegram", subject, profileId, displayName, username: telegram.user.username },
    });
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message === "TELEGRAM_PROFILE_HAS_DATA") return null;
    throw error;
  });
  if (!identity) {
    return NextResponse.json({ error: "В Telegram уже есть отдельные записи. Автоматическое объединение отключено, чтобы не потерять данные." }, { status: 409 });
  }

  await createTelegramSession(identity.profileId);
  const profile = await prisma.profile.findUnique({
    where: { id: identity.profileId },
    select: { onboardingComplete: true },
  });
  return NextResponse.json({ success: true, next: profile?.onboardingComplete ? "/today" : "/onboarding" });
}

export async function DELETE() {
  await revokeTelegramSession();
  return NextResponse.json({ success: true });
}
