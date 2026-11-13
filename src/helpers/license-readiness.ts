export type PublishReadiness = {
  /** Modality x category combinations a member could actually buy. */
  sellableCount: number;
  /** Combinations with no price for the active season. */
  gapCount: number;
  /**
   * False only when nothing at all is priced. A partially priced catalog is
   * publishable: gaps are often deliberate, since a federation may not issue
   * every modality to every age group.
   */
  canPublish: boolean;
};

type OfferingReference = {
  subtypeId: string;
  categoryId: string;
};

export function checkPublishReadiness(
  subtypeIds: string[],
  categoryIds: string[],
  offerings: OfferingReference[],
): PublishReadiness {
  const pricedKeys = new Set(
    offerings.map((offering) => `${offering.subtypeId}:${offering.categoryId}`),
  );

  let sellableCount = 0;
  for (const subtypeId of subtypeIds) {
    for (const categoryId of categoryIds) {
      if (pricedKeys.has(`${subtypeId}:${categoryId}`)) sellableCount++;
    }
  }

  return {
    sellableCount,
    gapCount: subtypeIds.length * categoryIds.length - sellableCount,
    canPublish: sellableCount > 0,
  };
}
