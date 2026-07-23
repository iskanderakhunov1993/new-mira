CREATE TABLE "public_product_events" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "route" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "public_product_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "public_product_events_name_created_at_idx"
ON "public_product_events"("name", "created_at");
