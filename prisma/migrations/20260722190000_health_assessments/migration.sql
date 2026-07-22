CREATE TABLE "health_assessments" (
  "id" TEXT NOT NULL,
  "user_id" UUID NOT NULL,
  "date" DATE NOT NULL,
  "type" TEXT NOT NULL,
  "answers" JSONB NOT NULL,
  "result_code" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "health_assessments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "health_assessments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "health_assessments_user_id_date_idx" ON "health_assessments"("user_id", "date");
CREATE INDEX "health_assessments_user_id_type_idx" ON "health_assessments"("user_id", "type");
