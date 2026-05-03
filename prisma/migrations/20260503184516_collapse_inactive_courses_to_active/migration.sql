-- Collapse the legacy INACTIVE state into ACTIVE.
-- Soft-delete (deletedAt) and `courseDate < now()` already cover the cases
-- where INACTIVE was used; the state is being removed from the model.
UPDATE "CourseCatalog" SET "status" = 'ACTIVE' WHERE "status" = 'INACTIVE';
