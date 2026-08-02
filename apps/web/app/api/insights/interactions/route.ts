import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyInsightInteraction, insightInteractionRequestSchema } from "@/lib/domain/insight-interaction";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

function serializeInteraction(interaction: {
  insightKey: string;
  readAt: Date | null;
  dismissedAt: Date | null;
}) {
  return {
    insightKey: interaction.insightKey,
    readAt: interaction.readAt?.toISOString() ?? null,
    dismissedAt: interaction.dismissedAt?.toISOString() ?? null,
  };
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const interactions = await prisma.insightInteraction.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: { insightKey: true, readAt: true, dismissedAt: true },
  });

  return NextResponse.json(interactions.map(serializeInteraction));
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid interaction" }, { status: 400 });
  }
  const parsed = insightInteractionRequestSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "Invalid interaction" }, { status: 400 });

  const current = await prisma.insightInteraction.findUnique({
    where: { userId_insightKey: { userId: user.id, insightKey: parsed.data.insightKey } },
    select: { readAt: true, dismissedAt: true },
  });
  const next = applyInsightInteraction(current ?? undefined, parsed.data.action, new Date());
  const interaction = await prisma.insightInteraction.upsert({
    where: { userId_insightKey: { userId: user.id, insightKey: parsed.data.insightKey } },
    create: { userId: user.id, insightKey: parsed.data.insightKey, ...next },
    update: next,
    select: { insightKey: true, readAt: true, dismissedAt: true },
  });

  return NextResponse.json(serializeInteraction(interaction));
}
