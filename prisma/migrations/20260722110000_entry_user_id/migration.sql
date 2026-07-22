ALTER TABLE "entries" RENAME COLUMN "profileId" TO "user_id";

ALTER INDEX "entries_profileId_date_key" RENAME TO "entries_user_id_date_key";
ALTER INDEX "entries_profileId_date_idx" RENAME TO "entries_user_id_date_idx";

ALTER TABLE "entries"
RENAME CONSTRAINT "entries_profileId_fkey" TO "entries_user_id_fkey";
