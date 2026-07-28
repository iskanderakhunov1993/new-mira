import { z } from "zod";

export const publicProductEventSchema = z.object({
  name: z.enum([
    "landing_view",
    "demo_started",
    "demo_step_completed",
    "demo_completed",
    "register_clicked",
    "register_view",
    "register_submitted",
  ]),
  route: z.enum(["/", "/demo", "/register"]),
}).strict();

export type PublicProductEvent = z.infer<typeof publicProductEventSchema>;
