"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";

type PublicEventName = "landing_view" | "register_clicked" | "register_view";

function sendPublicEvent(name: PublicEventName, route: "/" | "/register") {
  void fetch("/api/public-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, route }),
    keepalive: true,
  }).catch(() => undefined);
}

export function PublicPageView({ name, route }: { name: PublicEventName; route: "/" | "/register" }) {
  useEffect(() => { sendPublicEvent(name, route); }, [name, route]);
  return null;
}

export function RegisterCta({ className, children }: { className?: string; children: ReactNode }) {
  return <Link className={className} href="/register" onClick={() => sendPublicEvent("register_clicked", "/")}>{children}</Link>;
}
