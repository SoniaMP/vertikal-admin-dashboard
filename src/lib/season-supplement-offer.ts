import { prisma } from "@/lib/prisma";
import type { SellabilityLookups } from "@/helpers/supplement-block-reason";
import {
  buildSupplementOfferByType,
  type SupplementOfferByType,
} from "@/helpers/supplement-offer-by-type";

/** typeId lists keyed by the id of the supplement or group they point at. */
function indexTypeIds(
  rows: { typeId: string; linkedId: string }[],
): Map<string, string[]> {
  const typeIdsByLinkedId = new Map<string, string[]>();

  for (const row of rows) {
    const typeIds = typeIdsByLinkedId.get(row.linkedId) ?? [];
    typeIds.push(row.typeId);
    typeIdsByLinkedId.set(row.linkedId, typeIds);
  }

  return typeIdsByLinkedId;
}

/**
 * Reads a season's extras and returns what each of its federations offers.
 *
 * Retired rows are loaded on purpose: `supplementBlockReason()` is the only
 * thing that decides what is on sale, and a group retired on its own would
 * otherwise slip through its live members.
 */
export async function fetchSeasonSupplementOffer(
  seasonId: string,
): Promise<SupplementOfferByType> {
  const [supplements, prices, groupPrices, links, groupLinks] =
    await Promise.all([
      prisma.supplement.findMany({
        where: { seasonId },
        include: { supplementGroup: true },
        orderBy: { name: "asc" },
      }),
      prisma.supplementPrice.findMany({ where: { seasonId } }),
      prisma.supplementGroupPrice.findMany({ where: { seasonId } }),
      prisma.licenseTypeSupplement.findMany({ where: { type: { seasonId } } }),
      prisma.licenseTypeSupplementGroup.findMany({
        where: { type: { seasonId } },
      }),
    ]);

  const typeIdsBySupplementId = indexTypeIds(
    links.map((link) => ({ typeId: link.typeId, linkedId: link.supplementId })),
  );
  const typeIdsByGroupId = indexTypeIds(
    groupLinks.map((link) => ({ typeId: link.typeId, linkedId: link.groupId })),
  );

  const lookups: SellabilityLookups = {
    priceBySupplementId: new Map(prices.map((p) => [p.supplementId, p.price])),
    priceByGroupId: new Map(groupPrices.map((p) => [p.groupId, p.price])),
    linkedSupplementIds: new Set(typeIdsBySupplementId.keys()),
    linkedGroupIds: new Set(typeIdsByGroupId.keys()),
  };

  return buildSupplementOfferByType(supplements, lookups, {
    typeIdsBySupplementId,
    typeIdsByGroupId,
  });
}
