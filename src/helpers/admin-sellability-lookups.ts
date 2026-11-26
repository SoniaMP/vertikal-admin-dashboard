import type { SellabilityLookups } from "@/helpers/supplement-block-reason";

type AdminSupplement = {
  id: string;
  prices: { price: number }[];
  typeLinks: { typeId: string }[];
};

type AdminGroup = {
  id: string;
  groupPrices: { price: number }[];
  typeLinks: { typeId: string }[];
};

/**
 * Turns the admin screen's rows into the lookups `supplementBlockReason()`
 * reads, so the panel judges what is on sale with the very same rule as the
 * member's wizard instead of a second opinion of its own.
 *
 * The rows arrive already scoped to the season on screen, prices included,
 * which is why a single price per row is all there is to read.
 */
export function buildAdminSellabilityLookups(
  supplements: AdminSupplement[],
  groups: AdminGroup[],
): SellabilityLookups {
  const priceBySupplementId = new Map<string, number>();
  const linkedSupplementIds = new Set<string>();

  for (const supplement of supplements) {
    const price = supplement.prices[0]?.price;
    if (price !== undefined) priceBySupplementId.set(supplement.id, price);
    if (supplement.typeLinks.length > 0) linkedSupplementIds.add(supplement.id);
  }

  const priceByGroupId = new Map<string, number>();
  const linkedGroupIds = new Set<string>();

  for (const group of groups) {
    const price = group.groupPrices[0]?.price;
    if (price !== undefined) priceByGroupId.set(group.id, price);
    if (group.typeLinks.length > 0) linkedGroupIds.add(group.id);
  }

  return {
    priceBySupplementId,
    priceByGroupId,
    linkedSupplementIds,
    linkedGroupIds,
  };
}
