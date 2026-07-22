import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { serializeEntry } from "@/lib/server/entry-contract";

const schema = z.object({ date: z.iso.date(), flow: z.enum(["spotting", "light", "medium", "heavy"]) });

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid period data" }, { status: 400 });
  const date = new Date(`${parsed.data.date}T00:00:00.000Z`);
  const ongoing = await prisma.entry.findFirst({ where: { userId: user.id, periodStarted: true, periodEnded: false }, orderBy: { date: "desc" } });
  if (ongoing && ongoing.date.getTime() !== date.getTime()) return NextResponse.json({ error: "Сначала отметьте окончание текущих месячных" }, { status: 409 });
  const entry = await prisma.$transaction(async (tx) => {
    const saved = await tx.entry.upsert({
      where: { userId_date: { userId: user.id, date } },
      create: { userId: user.id, date, period: parsed.data.flow, periodStarted: true, painLocations: [], painTypes: [], symptoms: [] },
      update: { period: parsed.data.flow, periodStarted: true, periodEnded: false },
    });
    await tx.profile.update({ where: { id: user.id }, data: { lastPeriod: date } });
    return saved;
  });
  return NextResponse.json(serializeEntry(entry));
}
