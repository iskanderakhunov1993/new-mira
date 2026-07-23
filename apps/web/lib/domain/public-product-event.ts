import { z } from "zod";

export const publicProductEventSchema = z.object({
  name: z.enum(["landing_view", "register_clicked", "register_view"]),
  route: z.enum(["/", "/register"]),
}).strict();

export type PublicProductEvent = z.infer<typeof publicProductEventSchema>;
