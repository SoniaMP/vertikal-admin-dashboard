type GroupedSupplement = {
  id: string;
  supplementGroupId: string | null;
};

/**
 * Keeps only the supplements a member can actually be charged for this season.
 * The club sells nothing for free, so one with no price reaching the wizard
 * reads as "included" and then dead-ends at a checkout that refuses it. A
 * grouped supplement is sold through its group, so the group's price is the
 * one that decides.
 */
export function selectSellableSupplements<T extends GroupedSupplement>(
  supplements: T[],
  priceBySupplementId: Map<string, number>,
  priceByGroupId: Map<string, number>,
): T[] {
  return supplements.filter((supplement) =>
    supplement.supplementGroupId === null
      ? priceBySupplementId.has(supplement.id)
      : priceByGroupId.has(supplement.supplementGroupId),
  );
}
