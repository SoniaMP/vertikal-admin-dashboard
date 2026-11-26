-- CreateTable
CREATE TABLE "LicenseTypeSupplement" (
    "typeId" TEXT NOT NULL,
    "supplementId" TEXT NOT NULL,

    PRIMARY KEY ("typeId", "supplementId"),
    CONSTRAINT "LicenseTypeSupplement_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "LicenseType" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LicenseTypeSupplement_supplementId_fkey" FOREIGN KEY ("supplementId") REFERENCES "Supplement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LicenseTypeSupplementGroup" (
    "typeId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    PRIMARY KEY ("typeId", "groupId"),
    CONSTRAINT "LicenseTypeSupplementGroup_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "LicenseType" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LicenseTypeSupplementGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "SupplementGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "LicenseTypeSupplement_supplementId_idx" ON "LicenseTypeSupplement"("supplementId");

-- CreateIndex
CREATE INDEX "LicenseTypeSupplementGroup_groupId_idx" ON "LicenseTypeSupplementGroup"("groupId");
