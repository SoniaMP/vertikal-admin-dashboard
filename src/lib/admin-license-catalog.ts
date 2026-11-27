import { prisma } from "@/lib/prisma";

/**
 * Everything the licence admin screen shows for one season.
 *
 * Unlike `fetchLicenseCatalog()`, which serves the public wizard and only ever
 * reads the season in force, this takes the season explicitly: the admin needs
 * to price next year before next year arrives, and to look back at a closed
 * one without the catalog shifting under them.
 */
export async function fetchAdminLicenseCatalog(seasonId: string) {
  const [licenseTypes, categories, supplements, supplementGroups] =
    await Promise.all([
      prisma.licenseType.findMany({
        where: { seasonId },
        include: {
          _count: { select: { memberships: true } },
          subtypes: {
            orderBy: { createdAt: "asc" },
            include: { _count: { select: { memberships: true } } },
          },
          offerings: {
            where: { seasonId },
            include: { category: true },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.category.findMany({
        where: { seasonId },
        include: { _count: { select: { memberships: true } } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.supplement.findMany({
        where: { seasonId },
        include: {
          supplementGroup: true,
          prices: { where: { seasonId } },
          typeLinks: true,
          // What a member was charged for is history, not catalog: the panel
          // needs the count to know whether deleting is still allowed.
          _count: { select: { membershipSupplements: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.supplementGroup.findMany({
        where: { seasonId },
        include: {
          // The members carry the same sold count as the standalone rows, so a
          // row inside a group knows on its own whether it can still be
          // deleted.
          supplements: {
            include: { _count: { select: { membershipSupplements: true } } },
          },
          groupPrices: { where: { seasonId } },
          typeLinks: true,
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

  return { licenseTypes, categories, supplements, supplementGroups };
}
