ALTER TABLE "profiles" ALTER COLUMN "email" DROP NOT NULL;

CREATE TABLE "external_identities" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "profile_id" UUID NOT NULL,
  "display_name" TEXT,
  "username" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "external_identities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "app_sessions" (
  "id" TEXT NOT NULL,
  "token_hash" TEXT NOT NULL,
  "profile_id" UUID NOT NULL,
  "provider" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "app_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "account_link_tokens" (
  "id" TEXT NOT NULL,
  "token_hash" TEXT NOT NULL,
  "profile_id" UUID NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "used_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "account_link_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "external_identities_provider_subject_key"
  ON "external_identities"("provider", "subject");
CREATE INDEX "external_identities_profile_id_idx"
  ON "external_identities"("profile_id");
CREATE UNIQUE INDEX "app_sessions_token_hash_key"
  ON "app_sessions"("token_hash");
CREATE INDEX "app_sessions_profile_id_expires_at_idx"
  ON "app_sessions"("profile_id", "expires_at");
CREATE INDEX "app_sessions_expires_at_idx"
  ON "app_sessions"("expires_at");
CREATE UNIQUE INDEX "account_link_tokens_token_hash_key"
  ON "account_link_tokens"("token_hash");
CREATE INDEX "account_link_tokens_expires_at_idx"
  ON "account_link_tokens"("expires_at");

ALTER TABLE "external_identities"
  ADD CONSTRAINT "external_identities_profile_id_fkey"
  FOREIGN KEY ("profile_id") REFERENCES "profiles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "app_sessions"
  ADD CONSTRAINT "app_sessions_profile_id_fkey"
  FOREIGN KEY ("profile_id") REFERENCES "profiles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "account_link_tokens"
  ADD CONSTRAINT "account_link_tokens_profile_id_fkey"
  FOREIGN KEY ("profile_id") REFERENCES "profiles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "external_identities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "app_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account_link_tokens" ENABLE ROW LEVEL SECURITY;
