import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Client generation does not need a live database; migrations still fail
    // clearly if the real DIRECT_URL is not configured.
    url: process.env.DIRECT_URL ?? "postgresql://localhost:5432/mira",
  },
});
