"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";

export type PublicEventName = "landing_view" | "demo_started" | "demo_step_completed" | "demo_completed" | "register_clicked" | "register_view" | "register_submitted";
export type PublicEventRoute = "/" | "/demo" | "/register";

export function sendPublicEvent(name: PublicEventName, route: PublicEventRoute) {
  void fetch("/api/public-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, route }),
    keepalive: true,
  }).catch(() => undefined);
}

export function PublicPageView({ name, route }: { name: PublicEventName; route: PublicEventRoute }) {
  useEffect(() => { sendPublicEvent(name, route); }, [name, route]);
  return null;
}

export function RegisterCta({ className, children }: { className?: string; children: ReactNode }) {
  return <Link className={className} href="/register" onClick={() => sendPublicEvent("register_clicked", "/")}>{children}</Link>;
}

export function DemoCta({ className, children }: { className?: string; children: ReactNode }) {
  return <Link className={className} href="/demo" onClick={() => sendPublicEvent("demo_started", "/")}>{children}</Link>;
}
