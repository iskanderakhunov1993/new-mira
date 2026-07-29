import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { entryRangeSchema, serializeEntry } from "@/lib/contracts/entry";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const parsed = entryRangeSchema.safeParse({
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }
  const from = parsed.data.from ? new Date(`${parsed.data.from}T00:00:00.000Z`) : undefined;
  const to = parsed.data.to ? new Date(`${parsed.data.to}T00:00:00.000Z`) : undefined;
  const entries = await prisma.entry.findMany({
    where: {
      userId: user.id,
      date: from || to ? { gte: from, lte: to } : undefined,
    },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(entries.map(serializeEntry));
}

export async function DELETE() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.$transaction([
    prisma.entry.deleteMany({ where: { userId: user.id } }),
    prisma.healthAssessment.deleteMany({ where: { userId: user.id } }),
    prisma.profile.updateMany({ where: { id: user.id }, data: { lastPeriod: null } }),
  ]);
  return NextResponse.json({ success: true });
}
