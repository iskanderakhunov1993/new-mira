import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authCookieOptions } from "@/lib/supabase/cookie-options";

const protectedPaths = ["/today", "/track", "/check-in", "/period", "/concerns", "/result", "/diary", "/calendar", "/analytics", "/insights", "/profile", "/onboarding"];
const authPaths = ["/login", "/register"];
const telegramSessionCookie = "mira_tg_session";

function copySessionCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  target.headers.set("Cache-Control", "private, no-store");
  return target;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return response;

  const supabase = createServerClient(
    url,
    publishableKey,
    {
      cookieOptions: authCookieOptions,
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const hasTelegramSession = Boolean(request.cookies.get(telegramSessionCookie)?.value);
  const isProtected = protectedPaths.some((path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`));
  const isAuthPage = authPaths.includes(request.nextUrl.pathname);

  if (isProtected && !user && !hasTelegramSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return copySessionCookies(response, NextResponse.redirect(loginUrl));
  }

  if (isAuthPage && (user || hasTelegramSession)) {
    const appUrl = request.nextUrl.clone();
    appUrl.pathname = "/today";
    appUrl.search = "";
    return copySessionCookies(response, NextResponse.redirect(appUrl));
  }

  if (isProtected || isAuthPage) response.headers.set("Cache-Control", "private, no-store");

  return response;
}
