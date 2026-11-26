/** Why an extra is not on sale, in the order an admin should hear it. */
export type SupplementBlocker = "retired" | "unpriced" | "no-federations";

type SellableSupplement = {
  id: string;
  active: boolean;
  supplementGroup: { id: string; active: boolean } | null;
};

export type SellabilityLookups = {
  priceBySupplementId: Map<string, number>;
  priceByGroupId: Map<string, number>;
  /** Ids of standalone supplements that are offered in at least one federation. */
  linkedSupplementIds: Set<string>;
  /** Ids of groups that are offered in at least one federation. */
  linkedGroupIds: Set<string>;
};

/**
 * Why this extra cannot be sold this season, or null when it can.
 *
 * One predicate decides it, because the member's wizard, the admin's panel and
 * the checkout all have to agree on what "on sale" means. Three separate
 * conditions look identical from the wizard — the extra is simply not there —
 * so the reason travels with the answer and the panel can say which one it is.
 *
 * A grouped supplement answers for its group in everything: the group carries
 * the price and the federations, and its own rows are ignored even when
 * somebody filled them in. The group's retirement counts as its own, which is
 * what keeps a retired group from being sold through its live members.
 *
 * Retirement comes first because it is the admin's deliberate act; an unpriced
 * or unassigned extra is setup left unfinished, and the club sells nothing for
 * free and nothing nowhere.
 */
export function supplementBlockReason(
  supplement: SellableSupplement,
  lookups: SellabilityLookups,
): SupplementBlocker | null {
  const group = supplement.supplementGroup;

  if (!supplement.active) return "retired";
  if (group !== null && !group.active) return "retired";

  const hasPrice = group
    ? lookups.priceByGroupId.has(group.id)
    : lookups.priceBySupplementId.has(supplement.id);
  if (!hasPrice) return "unpriced";

  const isOffered = group
    ? lookups.linkedGroupIds.has(group.id)
    : lookups.linkedSupplementIds.has(supplement.id);
  if (!isOffered) return "no-federations";

  return null;
}
