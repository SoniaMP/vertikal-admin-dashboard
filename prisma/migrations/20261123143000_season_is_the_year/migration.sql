-- The season is the calendar year, so a season has nothing to say about
-- itself beyond that year. `name`, `startDate` and `endDate` restated it in
-- three more places that could disagree, and `isActive` was a flag somebody
-- had to remember to move. Which season is in force is now calculated from
-- the calendar; see getActiveSeason().
--
-- `year` was already backfilled and made unique in 20261122181542, and every
-- read of the dropped columns was migrated first, so this drops data that
-- nothing depends on.

PRAGMA defer_foreign_keys = ON;
PRAGMA foreign_keys = OFF;

CREATE TABLE "new_Season" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_Season" ("id", "year", "createdAt", "updatedAt")
SELECT "id", "year", "createdAt", "updatedAt" FROM "Season";

DROP TABLE "Season";
ALTER TABLE "new_Season" RENAME TO "Season";

CREATE UNIQUE INDEX "Season_year_key" ON "Season"("year");

PRAGMA foreign_keys = ON;
PRAGMA defer_foreign_keys = OFF;
