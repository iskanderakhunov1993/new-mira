ALTER TABLE "profiles"
ADD COLUMN "healthDataConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "privacyConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "sensitiveConsent" BOOLEAN NOT NULL DEFAULT false;
