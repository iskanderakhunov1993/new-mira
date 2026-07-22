import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { serializeEntry } from "@/lib/server/entry-contract";

const schema = z.object({ date: z.iso.date(), flow: z.enum(["spotting", "light", "medium", "heavy"]) });

export async function PATCH(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid period data" }, { status: 400 });
  const endDate = new Date(`${parsed.data.date}T00:00:00.000Z`);
  const start = await prisma.entry.findFirst({ where: { userId: user.id, periodStarted: true, date: { lte: endDate } }, orderBy: { date: "desc" } });
  if (!start) return NextResponse.json({ error: "Текущие месячные не найдены" }, { status: 404 });
  const entry = await prisma.$transaction(async (tx) => {
    await tx.entry.updateMany({ where: { userId: user.id, date: { gte: start.date, lte: endDate } }, data: { periodEnded: false } });
    return tx.entry.upsert({
      where: { userId_date: { userId: user.id, date: endDate } },
      create: { userId: user.id, date: endDate, period: parsed.data.flow, periodEnded: true, painLocations: [], painTypes: [], symptoms: [] },
      update: { period: parsed.data.flow, periodEnded: true },
    });
  });
  return NextResponse.json(serializeEntry(entry));
}
