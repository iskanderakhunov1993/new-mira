CREATE TABLE "profiles" (
  "id" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
  "goal" TEXT,
  "lastPeriod" DATE,
  "cycleLength" INTEGER NOT NULL DEFAULT 28,
  "periodLength" INTEGER NOT NULL DEFAULT 5,
  "weightKg" DOUBLE PRECISION,
  "cycleForecasts" BOOLEAN NOT NULL DEFAULT true,
  "privateInsights" BOOLEAN NOT NULL DEFAULT false,
  "consentAcceptedAt" TIMESTAMP(3),
  "consentVersion" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "entries" (
  "id" TEXT NOT NULL,
  "profileId" UUID NOT NULL,
  "date" DATE NOT NULL,
  "period" TEXT,
  "periodClots" BOOLEAN,
  "periodLeak" BOOLEAN,
  "periodNightChange" BOOLEAN,
  "periodHourlyChange" BOOLEAN,
  "pain" INTEGER,
  "painLocations" TEXT[] NOT NULL,
  "painTypes" TEXT[] NOT NULL,
  "painImpact" TEXT,
  "mood" TEXT,
  "symptoms" TEXT[] NOT NULL,
  "symptomIntensity" JSONB,
  "sleepHours" DOUBLE PRECISION,
  "waterMl" INTEGER,
  "weightKg" DOUBLE PRECISION,
  "basalTemperature" DOUBLE PRECISION,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");
CREATE UNIQUE INDEX "entries_profileId_date_key" ON "entries"("profileId", "date");
CREATE INDEX "entries_profileId_date_idx" ON "entries"("profileId", "date");

ALTER TABLE "entries"
ADD CONSTRAINT "entries_profileId_fkey"
FOREIGN KEY ("profileId") REFERENCES "profiles"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Browser clients never access health data directly. Prisma uses a dedicated
-- BYPASSRLS role while Supabase Data API roles are denied by default.
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "entries" ENABLE ROW LEVEL SECURITY;
