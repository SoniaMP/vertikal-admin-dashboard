import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/settings";
import { LicenseTypesTable } from "@/components/admin/license-types-table";
import { CreateLicenseTypeButton } from "@/components/admin/create-license-type-button";
import { StandaloneSections } from "@/components/admin/standalone-sections";

export default async function FederationTypesPage() {
  const season = await getActiveSeason();

  const [licenseTypes, categories, supplements, supplementGroups] =
    await Promise.all([
      prisma.licenseType.findMany({
        include: {
          _count: { select: { memberships: true } },
          subtypes: {
            orderBy: { createdAt: "asc" },
            include: { _count: { select: { memberships: true } } },
          },
          offerings: {
            where: { seasonId: season.id },
            include: { category: true },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.category.findMany({
        include: {
          _count: { select: { memberships: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.supplement.findMany({
        include: {
          supplementGroup: true,
          prices: { where: { seasonId: season.id } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.supplementGroup.findMany({
        include: {
          supplements: true,
          groupPrices: { where: { seasonId: season.id } },
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión federativas deportivas</h1>
        <CreateLicenseTypeButton />
      </div>
      <LicenseTypesTable
        licenseTypes={licenseTypes}
        categories={categories}
        seasonId={season.id}
        seasonName={season.name}
      />
      <StandaloneSections
        categories={categories}
        supplements={supplements}
        supplementGroups={supplementGroups}
        seasonId={season.id}
      />
    </div>
  );
}
