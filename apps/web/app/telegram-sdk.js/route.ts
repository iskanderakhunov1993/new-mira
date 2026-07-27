import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 86_400;

export async function GET() {
  try {
    const response = await fetch("https://telegram.org/js/telegram-web-app.js?61", {
      next: { revalidate },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`Telegram SDK returned ${response.status}`);
    return new NextResponse(await response.text(), {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("/* Telegram SDK is temporarily unavailable. */", {
      status: 502,
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
}
