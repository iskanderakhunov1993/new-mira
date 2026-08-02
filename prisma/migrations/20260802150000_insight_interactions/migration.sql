CREATE TABLE "insight_interactions" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "insight_key" VARCHAR(200) NOT NULL,
    "read_at" TIMESTAMP(3),
    "dismissed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insight_interactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "insight_interactions_user_id_insight_key_key"
ON "insight_interactions"("user_id", "insight_key");

CREATE INDEX "insight_interactions_user_id_updated_at_idx"
ON "insight_interactions"("user_id", "updated_at");

ALTER TABLE "insight_interactions"
ADD CONSTRAINT "insight_interactions_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
