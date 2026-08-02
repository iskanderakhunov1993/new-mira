ALTER TABLE "entries"
ADD COLUMN "activityTypes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "contraceptionMethod" TEXT,
ADD COLUMN "contraceptionStatus" TEXT,
ADD COLUMN "pregnancyTest" TEXT,
ADD COLUMN "ovulationTest" TEXT,
ADD COLUMN "sexualActivity" TEXT,
ADD COLUMN "sexualComfort" TEXT;
