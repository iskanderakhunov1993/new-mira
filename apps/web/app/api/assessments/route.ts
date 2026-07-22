import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { assessmentData, assessmentSchema, serializeAssessment } from "@/lib/server/assessment-contract";

export const runtime = "nodejs";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await prisma.healthAssessment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(rows.map(serializeAssessment));
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = assessmentSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid assessment data", details: parsed.error.flatten() }, { status: 400 });
  const row = await prisma.healthAssessment.create({ data: { userId: user.id, ...assessmentData(parsed.data) } });
  return NextResponse.json(serializeAssessment(row), { status: 201 });
}
