-- Replace the full unique index on CourseCatalog.slug with a partial one
-- that only enforces uniqueness for non-deleted rows. Soft-deleted courses
-- (deletedAt IS NOT NULL) keep their original slug for audit, but their
-- value no longer blocks new courses from reusing it.
DROP INDEX "CourseCatalog_slug_key";
CREATE UNIQUE INDEX "CourseCatalog_slug_key" ON "CourseCatalog"("slug") WHERE "deletedAt" IS NULL;
