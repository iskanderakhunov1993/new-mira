import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

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
