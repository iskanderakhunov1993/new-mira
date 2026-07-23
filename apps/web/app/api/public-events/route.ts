import { NextResponse } from "next/server";
import { publicProductEventSchema } from "@/lib/domain/public-product-event";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = publicProductEventSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "Invalid event" }, { status: 400 });

  try {
    await prisma.publicProductEvent.create({ data: parsed.data });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    // Landing conversion tracking is best-effort and must never block the product flow.
    return NextResponse.json({ error: "Analytics temporarily unavailable" }, { status: 503 });
  }
}
