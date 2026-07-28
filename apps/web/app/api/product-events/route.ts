import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

const eventNames = ["onboarding_started", "onboarding_step_completed", "onboarding_completed", "today_view", "today_primary_action_clicked", "spotlight_shown", "spotlight_skipped", "spotlight_completed", "checkin_started", "checkin_completed", "entry_updated", "entry_deleted", "period_started", "period_ended", "period_updated", "period_deleted"] as const;
const schema = z.object({ name: z.enum(eventNames), route: z.string().startsWith("/").max(120) });

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  await prisma.productEvent.create({ data: { userId: user.id, ...parsed.data } });
  return NextResponse.json({ success: true }, { status: 201 });
}
