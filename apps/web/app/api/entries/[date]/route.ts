import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { dateParamSchema, entryUpdateSchema, serializeEntry } from "@/lib/server/entry-contract";
import { Prisma } from "@/generated/prisma/client";

export const runtime = "nodejs";

async function context(requestContext: { params: Promise<{ date: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const parsedDate = dateParamSchema.safeParse((await requestContext.params).date);
  if (!parsedDate.success) return { response: NextResponse.json({ error: "Invalid date" }, { status: 400 }) };
  return { user, date: parsedDate.data, dateValue: new Date(`${parsedDate.data}T00:00:00.000Z`) };
}

export async function GET(_: Request, requestContext: { params: Promise<{ date: string }> }) {
  const current = await context(requestContext);
  if ("response" in current) return current.response;
  const entry = await prisma.entry.findUnique({ where: { userId_date: { userId: current.user.id, date: current.dateValue } } });
  return NextResponse.json(entry ? serializeEntry(entry) : null);
}

export async function PUT(request: Request, requestContext: { params: Promise<{ date: string }> }) {
  const current = await context(requestContext);
  if ("response" in current) return current.response;
  const parsed = entryUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid entry data", details: parsed.error.flatten() }, { status: 400 });
  const payload = parsed.data;
  const data = {
    ...payload,
    symptomIntensity: payload.symptomIntensity === null ? Prisma.JsonNull : payload.symptomIntensity,
    medicationIntakes: payload.medicationIntakes === null ? Prisma.JsonNull : payload.medicationIntakes,
  };
  const entry = await prisma.entry.upsert({
    where: { userId_date: { userId: current.user.id, date: current.dateValue } },
    create: { userId: current.user.id, date: current.dateValue, painLocations: [], painTypes: [], symptoms: [], ...data },
    update: data,
  });
  return NextResponse.json(serializeEntry(entry));
}

export async function DELETE(_: Request, requestContext: { params: Promise<{ date: string }> }) {
  const current = await context(requestContext);
  if ("response" in current) return current.response;
  await prisma.entry.deleteMany({ where: { userId: current.user.id, date: current.dateValue } });
  return NextResponse.json({ success: true });
}
