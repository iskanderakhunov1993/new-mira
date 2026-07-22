import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { dateParamSchema } from "@/lib/server/entry-contract";
import { z } from "zod";

const updateSchema = z.object({ startDate: z.iso.date(), endDate: z.iso.date().optional(), flow: z.enum(["spotting", "light", "medium", "heavy"]) }).refine((value) => !value.endDate || value.endDate >= value.startDate, { message: "End date must be after start date" });

export async function PATCH(request: Request, context: { params: Promise<{ start: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const oldParsed = dateParamSchema.safeParse((await context.params).start);
  const parsed = updateSchema.safeParse(await request.json());
  if (!oldParsed.success || !parsed.success) return NextResponse.json({ error: "Invalid period data" }, { status: 400 });
  const oldStart = new Date(`${oldParsed.data}T00:00:00.000Z`);
  const newStart = new Date(`${parsed.data.startDate}T00:00:00.000Z`);
  const newEnd = parsed.data.endDate ? new Date(`${parsed.data.endDate}T00:00:00.000Z`) : undefined;
  const existing = await prisma.entry.findFirst({ where: { userId: user.id, date: oldStart, periodStarted: true } });
  if (!existing) return NextResponse.json({ error: "Период не найден" }, { status: 404 });
  const next = await prisma.entry.findFirst({ where: { userId: user.id, periodStarted: true, date: { gt: oldStart } }, orderBy: { date: "asc" } });
  const oldEnd = await prisma.entry.findFirst({ where: { userId: user.id, periodEnded: true, date: { gte: oldStart, ...(next ? { lt: next.date } : {}) } }, orderBy: { date: "asc" } });
  await prisma.$transaction(async (tx) => {
    await tx.entry.updateMany({ where: { userId: user.id, date: { in: [oldStart, ...(oldEnd ? [oldEnd.date] : [])] } }, data: { period: null, periodStarted: false, periodEnded: false } });
    await tx.entry.upsert({ where: { userId_date: { userId: user.id, date: newStart } }, create: { userId: user.id, date: newStart, period: parsed.data.flow, periodStarted: true, periodEnded: !newEnd || newEnd.getTime() === newStart.getTime(), painLocations: [], painTypes: [], symptoms: [] }, update: { period: parsed.data.flow, periodStarted: true, periodEnded: !newEnd || newEnd.getTime() === newStart.getTime() } });
    if (newEnd && newEnd.getTime() !== newStart.getTime()) await tx.entry.upsert({ where: { userId_date: { userId: user.id, date: newEnd } }, create: { userId: user.id, date: newEnd, period: parsed.data.flow, periodEnded: true, painLocations: [], painTypes: [], symptoms: [] }, update: { period: parsed.data.flow, periodEnded: true } });
    await tx.profile.updateMany({ where: { id: user.id, lastPeriod: oldStart }, data: { lastPeriod: newStart } });
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(_: Request, context: { params: Promise<{ start: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = dateParamSchema.safeParse((await context.params).start);
  if (!parsed.success) return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  const start = new Date(`${parsed.data}T00:00:00.000Z`);
  const next = await prisma.entry.findFirst({ where: { userId: user.id, periodStarted: true, date: { gt: start } }, orderBy: { date: "asc" } });
  await prisma.$transaction(async (tx) => {
    await tx.entry.updateMany({ where: { userId: user.id, date: { gte: start, ...(next ? { lt: next.date } : {}) } }, data: { period: null, periodStarted: false, periodEnded: false, periodClots: null, periodLeak: null, periodNightChange: null, periodHourlyChange: null } });
    const latest = await tx.entry.findFirst({ where: { userId: user.id, periodStarted: true, date: { lt: start } }, orderBy: { date: "desc" } });
    await tx.profile.update({ where: { id: user.id }, data: { lastPeriod: latest?.date ?? null } });
  });
  return NextResponse.json({ success: true });
}
