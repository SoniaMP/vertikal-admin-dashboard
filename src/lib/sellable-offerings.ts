import { prisma } from "@/lib/prisma";

/**
 * How many prices a season could actually sell today.
 *
 * Deliberately the same conditions the public wizard applies in
 * `fetchLicenseCatalog()` and `selectSellableSubtypes()`: a published and
 * active federation, a published and active modality, a category still on
 * offer, and a price joining them. Counting plain offerings instead would
 * tell the club everything is fine while the member sees an empty wizard.
 */
export async function countSellableOfferings(
  seasonId: string,
): Promise<number> {
  if (!seasonId) return 0;

  return prisma.licenseOffering.count({
    where: {
      seasonId,
      type: { active: true, publishedAt: { not: null } },
      subtype: { active: true, publishedAt: { not: null } },
      category: { active: true },
    },
  });
}
