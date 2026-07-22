ALTER TABLE "profiles"
ADD COLUMN "spotlightStatus" TEXT NOT NULL DEFAULT 'pending';

ALTER TABLE "entries"
ADD COLUMN "energy" TEXT,
ADD COLUMN "periodStarted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "periodEnded" BOOLEAN NOT NULL DEFAULT false;

WITH period_rows AS (
  SELECT
    "id",
    "date",
    LAG("date") OVER (PARTITION BY "user_id" ORDER BY "date") AS previous_date,
    LEAD("date") OVER (PARTITION BY "user_id" ORDER BY "date") AS next_date
  FROM "entries"
  WHERE "period" IS NOT NULL
)
UPDATE "entries" AS entry
SET
  "periodStarted" = period_rows.previous_date IS NULL OR period_rows."date" - period_rows.previous_date > 1,
  "periodEnded" = period_rows.next_date IS NULL OR period_rows.next_date - period_rows."date" > 1
FROM period_rows
WHERE entry."id" = period_rows."id";

CREATE TABLE "product_events" (
  "id" TEXT NOT NULL,
  "user_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "route" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "product_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_events_user_id_createdAt_idx"
ON "product_events"("user_id", "createdAt");

ALTER TABLE "product_events"
ADD CONSTRAINT "product_events_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "profiles"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_events" ENABLE ROW LEVEL SECURITY;
