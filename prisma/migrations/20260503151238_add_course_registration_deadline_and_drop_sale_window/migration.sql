-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- CourseCatalog: add registrationDeadline (NOT NULL), backfill from courseDate
CREATE TABLE "new_CourseCatalog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "courseDate" DATETIME NOT NULL,
    "registrationDeadline" DATETIME NOT NULL,
    "courseTypeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "instructorId" TEXT,
    "maxCapacity" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "CourseCatalog_courseTypeId_fkey" FOREIGN KEY ("courseTypeId") REFERENCES "CourseType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CourseCatalog_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_CourseCatalog" ("id", "title", "slug", "courseDate", "registrationDeadline", "courseTypeId", "status", "instructorId", "maxCapacity", "createdAt", "updatedAt", "deletedAt")
SELECT "id", "title", "slug", "courseDate", "courseDate", "courseTypeId", "status", "instructorId", "maxCapacity", "createdAt", "updatedAt", "deletedAt"
FROM "CourseCatalog";

DROP TABLE "CourseCatalog";
ALTER TABLE "new_CourseCatalog" RENAME TO "CourseCatalog";

CREATE UNIQUE INDEX "CourseCatalog_slug_key" ON "CourseCatalog"("slug");
CREATE INDEX "CourseCatalog_courseDate_idx" ON "CourseCatalog"("courseDate");
CREATE INDEX "CourseCatalog_status_courseDate_idx" ON "CourseCatalog"("status", "courseDate");
CREATE INDEX "CourseCatalog_instructorId_idx" ON "CourseCatalog"("instructorId");

-- CoursePrice: drop saleStart and saleEnd
CREATE TABLE "new_CoursePrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseCatalogId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "CoursePrice_courseCatalogId_fkey" FOREIGN KEY ("courseCatalogId") REFERENCES "CourseCatalog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_CoursePrice" ("id", "courseCatalogId", "name", "amountCents", "isActive")
SELECT "id", "courseCatalogId", "name", "amountCents", "isActive"
FROM "CoursePrice";

DROP TABLE "CoursePrice";
ALTER TABLE "new_CoursePrice" RENAME TO "CoursePrice";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
