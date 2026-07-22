import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { assessmentData, assessmentSchema, serializeAssessment } from "@/lib/server/assessment-contract";

export const runtime = "nodejs";

async function auth(params: Promise<{ id: string }>) {
  const user = await getAuthenticatedUser();
  if (!user) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { user, id: (await params).id };
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const current = await auth(context.params); if ("response" in current) return current.response;
  const row = await prisma.healthAssessment.findFirst({ where: { id: current.id, userId: current.user.id } });
  return row ? NextResponse.json(serializeAssessment(row)) : NextResponse.json({ error: "Assessment not found" }, { status: 404 });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const current = await auth(context.params); if ("response" in current) return current.response;
  const parsed = assessmentSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid assessment data", details: parsed.error.flatten() }, { status: 400 });
  const exists = await prisma.healthAssessment.findFirst({ where: { id: current.id, userId: current.user.id } });
  if (!exists) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  const row = await prisma.healthAssessment.update({ where: { id: current.id }, data: assessmentData(parsed.data) });
  return NextResponse.json(serializeAssessment(row));
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const current = await auth(context.params); if ("response" in current) return current.response;
  const result = await prisma.healthAssessment.deleteMany({ where: { id: current.id, userId: current.user.id } });
  return result.count ? NextResponse.json({ success: true }) : NextResponse.json({ error: "Assessment not found" }, { status: 404 });
}
