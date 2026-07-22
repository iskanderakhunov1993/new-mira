ALTER TABLE "profiles"
ADD COLUMN "cyclePattern" TEXT NOT NULL DEFAULT 'regular',
ADD COLUMN "firstPromptDismissed" BOOLEAN NOT NULL DEFAULT false;
