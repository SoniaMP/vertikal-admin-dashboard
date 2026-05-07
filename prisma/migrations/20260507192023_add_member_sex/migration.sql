/*
  Adds the required column `sex` to `Member`.

  Existing rows are preserved: they receive an empty-string sentinel (`''`) so the
  NOT NULL constraint passes. The Zod validator restricts `sex` to "M" or "F",
  so any pre-existing member edited via the admin UI will be forced to pick a
  real value before saving. Backfill the sentinel manually after deploy.
*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dni" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Member" ("address", "city", "createdAt", "dateOfBirth", "dni", "email", "firstName", "id", "lastName", "phone", "postalCode", "province", "sex", "updatedAt") SELECT "address", "city", "createdAt", "dateOfBirth", "dni", "email", "firstName", "id", "lastName", "phone", "postalCode", "province", '', "updatedAt" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_dni_key" ON "Member"("dni");
CREATE INDEX "Member_dni_idx" ON "Member"("dni");
CREATE INDEX "Member_email_idx" ON "Member"("email");
CREATE INDEX "Member_lastName_firstName_idx" ON "Member"("lastName", "firstName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
