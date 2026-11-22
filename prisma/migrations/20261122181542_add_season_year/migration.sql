-- Add Season.year: the season IS the calendar year.
-- Three steps so no row is ever left without a value: add the column nullable,
-- backfill it from the existing name, then redefine the table with NOT NULL.
-- `name` stays for now; UC-SET-01 drops it once every read has moved to `year`.

-- AlterTable
ALTER TABLE "Season" ADD COLUMN "year" INTEGER;

-- Backfill. The season is named by the year it ends in, so the last four
-- characters are the year in both shapes the column ever held: "2026" and
-- "2025-2026". A name that yields no number leaves NULL here and makes the
-- redefinition below fail loudly rather than inventing a year.
UPDATE "Season" SET "year" = CAST(substr("name", -4) AS INTEGER);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Season" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Season" ("createdAt", "endDate", "id", "isActive", "name", "startDate", "updatedAt", "year")
SELECT "createdAt", "endDate", "id", "isActive", "name", "startDate", "updatedAt", "year" FROM "Season";
DROP TABLE "Season";
ALTER TABLE "new_Season" RENAME TO "Season";
CREATE UNIQUE INDEX "Season_year_key" ON "Season"("year");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
