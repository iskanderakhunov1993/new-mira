import { requestJson } from "@/lib/client/http";

export type ProductEventName =
  | "onboarding_started"
  | "onboarding_step_completed"
  | "onboarding_completed"
  | "spotlight_shown"
  | "spotlight_skipped"
  | "spotlight_completed"
  | "checkin_started"
  | "checkin_completed"
  | "entry_updated"
  | "entry_deleted"
  | "period_started"
  | "period_ended"
  | "period_updated"
  | "period_deleted";

export async function trackProductEvent(name: ProductEventName, route: string) {
  try {
    await requestJson("/api/product-events", {
      method: "POST",
      body: JSON.stringify({ name, route }),
    });
  } catch {
    // Аналитика не блокирует основной пользовательский сценарий.
  }
}
