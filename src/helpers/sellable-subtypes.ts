type OfferingReference = {
  subtypeId: string;
  category: { active: boolean } | null;
};

/**
 * Keeps only the modalities a member can actually buy this season: one with no
 * priced offering reaches the public wizard the moment it is created, before
 * anybody has filled in its price grid, and every choice under it dead-ends.
 * An offering on a retired category does not count, because the wizard hides
 * those categories.
 */
export function selectSellableSubtypes<T extends { id: string }>(
  subtypes: T[],
  offerings: OfferingReference[],
): T[] {
  const sellableIds = new Set(
    offerings
      .filter((offering) => offering.category?.active)
      .map((offering) => offering.subtypeId),
  );

  return subtypes.filter((subtype) => sellableIds.has(subtype.id));
}
