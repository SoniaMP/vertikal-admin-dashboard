-- AlterTable
ALTER TABLE "LicenseSubtype" ADD COLUMN "publishedAt" DATETIME;

-- AlterTable
ALTER TABLE "LicenseType" ADD COLUMN "publishedAt" DATETIME;

-- Everything that already exists was reachable by members before this column
-- existed, so it counts as published. Only rows created from now on start as
-- drafts; `createdAt` keeps the date honest instead of stamping today.
UPDATE "LicenseType" SET "publishedAt" = "createdAt" WHERE "publishedAt" IS NULL;
UPDATE "LicenseSubtype" SET "publishedAt" = "createdAt" WHERE "publishedAt" IS NULL;
