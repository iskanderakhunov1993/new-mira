import { z } from "zod";

export const insightInteractionActionSchema = z.enum(["read", "dismiss", "restore"]);

export const insightInteractionRequestSchema = z.object({
  action: insightInteractionActionSchema,
  insightKey: z.string().trim().min(1).max(200),
});

export type InsightInteractionAction = z.infer<typeof insightInteractionActionSchema>;

export type InsightInteractionState = {
  readAt: Date | null;
  dismissedAt: Date | null;
};

export function applyInsightInteraction(
  current: InsightInteractionState | undefined,
  action: InsightInteractionAction,
  now: Date,
): InsightInteractionState {
  const state = current ?? { readAt: null, dismissedAt: null };
  if (action === "read") return { ...state, readAt: state.readAt ?? now };
  if (action === "dismiss") return { readAt: state.readAt ?? now, dismissedAt: now };
  return { ...state, dismissedAt: null };
}
