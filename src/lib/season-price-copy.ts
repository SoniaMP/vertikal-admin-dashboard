import type { Prisma } from "@prisma/client";
import type { CatalogIdMaps } from "@/lib/season-entity-copy";

/**
 * Rebuilds one season's prices against another season's copied catalog.
 *
 * A row whose entity did not make it across is dropped rather than pointed at
 * the original: a price belongs to the season it was copied into, or it does
 * not exist.
 */
export async function copySeasonPrices(
  tx: Prisma.TransactionClient,
  sourceId: string,
  seasonId: string,
  maps: CatalogIdMaps,
): Promise<void> {
  const [offerings, supplementPrices, groupPrices] = await Promise.all([
    tx.licenseOffering.findMany({ where: { seasonId: sourceId } }),
    tx.supplementPrice.findMany({ where: { seasonId: sourceId } }),
    tx.supplementGroupPrice.findMany({ where: { seasonId: sourceId } }),
  ]);

  const offeringData = offerings.flatMap((row) => {
    const typeId = maps.types.get(row.typeId);
    const subtypeId = maps.subtypes.get(row.subtypeId);
    const categoryId = maps.categories.get(row.categoryId);
    if (!typeId || !subtypeId || !categoryId) return [];
    return [{ seasonId, typeId, subtypeId, categoryId, price: row.price }];
  });

  const supplementData = supplementPrices.flatMap((row) => {
    const supplementId = maps.supplements.get(row.supplementId);
    return supplementId ? [{ seasonId, supplementId, price: row.price }] : [];
  });

  const groupData = groupPrices.flatMap((row) => {
    const groupId = maps.groups.get(row.groupId);
    return groupId ? [{ seasonId, groupId, price: row.price }] : [];
  });

  if (offeringData.length > 0) {
    await tx.licenseOffering.createMany({ data: offeringData });
  }
  if (supplementData.length > 0) {
    await tx.supplementPrice.createMany({ data: supplementData });
  }
  if (groupData.length > 0) {
    await tx.supplementGroupPrice.createMany({ data: groupData });
  }
}
