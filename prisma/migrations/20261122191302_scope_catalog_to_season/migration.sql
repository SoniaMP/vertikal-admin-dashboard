-- Scope the catalog to a season, and give every row a lineage.
--
-- Until now only prices were per season: the federations, modalities,
-- categories and supplements were global. Renaming one, or retiring it to
-- prepare next year, silently changed every other year — including the one
-- still selling. From here each season owns its own catalog rows, and
-- `lineageId` is what still ties them together across years, so a federation
-- can be followed through renames and reprices.
--
-- Three steps per table so no row is ever left without a value: add the
-- columns nullable, backfill them, then redefine the table with NOT NULL.

-- AlterTable
ALTER TABLE "LicenseType" ADD COLUMN "seasonId" TEXT;
ALTER TABLE "LicenseType" ADD COLUMN "lineageId" TEXT;
ALTER TABLE "LicenseSubtype" ADD COLUMN "seasonId" TEXT;
ALTER TABLE "LicenseSubtype" ADD COLUMN "lineageId" TEXT;
ALTER TABLE "Category" ADD COLUMN "seasonId" TEXT;
ALTER TABLE "Category" ADD COLUMN "lineageId" TEXT;
ALTER TABLE "SupplementGroup" ADD COLUMN "seasonId" TEXT;
ALTER TABLE "SupplementGroup" ADD COLUMN "lineageId" TEXT;
ALTER TABLE "Supplement" ADD COLUMN "seasonId" TEXT;
ALTER TABLE "Supplement" ADD COLUMN "lineageId" TEXT;

-- Backfill. Everything that exists today was built for the season in force, so
-- that is where it lands; each row starts a lineage of its own. A database with
-- no active season leaves NULLs here and fails the redefinition below rather
-- than guessing a season.
UPDATE "LicenseType" SET "seasonId" = (SELECT "id" FROM "Season" WHERE "isActive" = 1 LIMIT 1), "lineageId" = "id";
UPDATE "LicenseSubtype" SET "seasonId" = (SELECT "id" FROM "Season" WHERE "isActive" = 1 LIMIT 1), "lineageId" = "id";
UPDATE "Category" SET "seasonId" = (SELECT "id" FROM "Season" WHERE "isActive" = 1 LIMIT 1), "lineageId" = "id";
UPDATE "SupplementGroup" SET "seasonId" = (SELECT "id" FROM "Season" WHERE "isActive" = 1 LIMIT 1), "lineageId" = "id";
UPDATE "Supplement" SET "seasonId" = (SELECT "id" FROM "Season" WHERE "isActive" = 1 LIMIT 1), "lineageId" = "id";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_LicenseType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seasonId" TEXT NOT NULL,
    "lineageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LicenseType_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LicenseType" ("id","seasonId","lineageId","name","description","active","publishedAt","createdAt","updatedAt")
SELECT "id","seasonId","lineageId","name","description","active","publishedAt","createdAt","updatedAt" FROM "LicenseType";
DROP TABLE "LicenseType";
ALTER TABLE "new_LicenseType" RENAME TO "LicenseType";
CREATE INDEX "LicenseType_seasonId_idx" ON "LicenseType"("seasonId");
CREATE INDEX "LicenseType_lineageId_idx" ON "LicenseType"("lineageId");

CREATE TABLE "new_LicenseSubtype" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seasonId" TEXT NOT NULL,
    "lineageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" DATETIME,
    "licenseTypeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LicenseSubtype_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LicenseSubtype_licenseTypeId_fkey" FOREIGN KEY ("licenseTypeId") REFERENCES "LicenseType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LicenseSubtype" ("id","seasonId","lineageId","name","description","active","publishedAt","licenseTypeId","createdAt","updatedAt")
SELECT "id","seasonId","lineageId","name","description","active","publishedAt","licenseTypeId","createdAt","updatedAt" FROM "LicenseSubtype";
DROP TABLE "LicenseSubtype";
ALTER TABLE "new_LicenseSubtype" RENAME TO "LicenseSubtype";
CREATE INDEX "LicenseSubtype_seasonId_idx" ON "LicenseSubtype"("seasonId");
CREATE INDEX "LicenseSubtype_lineageId_idx" ON "LicenseSubtype"("lineageId");

CREATE TABLE "new_Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seasonId" TEXT NOT NULL,
    "lineageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Category_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Category" ("id","seasonId","lineageId","name","description","active","createdAt","updatedAt")
SELECT "id","seasonId","lineageId","name","description","active","createdAt","updatedAt" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE INDEX "Category_seasonId_idx" ON "Category"("seasonId");
CREATE INDEX "Category_lineageId_idx" ON "Category"("lineageId");

CREATE TABLE "new_SupplementGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seasonId" TEXT NOT NULL,
    "lineageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupplementGroup_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SupplementGroup" ("id","seasonId","lineageId","name","active","createdAt","updatedAt")
SELECT "id","seasonId","lineageId","name","active","createdAt","updatedAt" FROM "SupplementGroup";
DROP TABLE "SupplementGroup";
ALTER TABLE "new_SupplementGroup" RENAME TO "SupplementGroup";
CREATE INDEX "SupplementGroup_seasonId_idx" ON "SupplementGroup"("seasonId");
CREATE INDEX "SupplementGroup_lineageId_idx" ON "SupplementGroup"("lineageId");

CREATE TABLE "new_Supplement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seasonId" TEXT NOT NULL,
    "lineageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "supplementGroupId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Supplement_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Supplement_supplementGroupId_fkey" FOREIGN KEY ("supplementGroupId") REFERENCES "SupplementGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Supplement" ("id","seasonId","lineageId","name","description","active","supplementGroupId","createdAt","updatedAt")
SELECT "id","seasonId","lineageId","name","description","active","supplementGroupId","createdAt","updatedAt" FROM "Supplement";
DROP TABLE "Supplement";
ALTER TABLE "new_Supplement" RENAME TO "Supplement";
CREATE INDEX "Supplement_seasonId_idx" ON "Supplement"("seasonId");
CREATE INDEX "Supplement_lineageId_idx" ON "Supplement"("lineageId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
