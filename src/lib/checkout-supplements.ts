import { prisma } from "@/lib/prisma";
import { CheckoutError } from "@/lib/checkout-error";
import {
  supplementBlockReason,
  type SellabilityLookups,
} from "@/helpers/supplement-block-reason";
import {
  priceSupplements,
  type SupplementLineItem,
  type SupplementPricing,
} from "@/helpers/supplement-pricing";

export type { SupplementLineItem };

const EMPTY: SupplementPricing = {
  supplementsTotal: 0,
  lineItems: [],
  supplements: [],
};

type CheckoutSupplement = {
  id: string;
  name: string;
  active: boolean;
  supplementGroupId: string | null;
  supplementGroup: { id: string; name: string; active: boolean } | null;
};

/**
 * Prices and federation links for exactly what the member picked.
 *
 * The links are read by federation rather than by season: a `LicenseType`
 * belongs to one season, and the caller has already matched this one against
 * the season's offerings, so a link found here is this season's link.
 */
async function fetchCheckoutLookups(
  selected: CheckoutSupplement[],
  seasonId: string,
  typeId: string,
): Promise<SellabilityLookups> {
  const supplementIds = selected.map((supplement) => supplement.id);
  const groupIds = [
    ...new Set(
      selected
        .map((supplement) => supplement.supplementGroupId)
        .filter((id): id is string => id !== null),
    ),
  ];

  const [prices, groupPrices, links, groupLinks] = await Promise.all([
    prisma.supplementPrice.findMany({
      where: { seasonId, supplementId: { in: supplementIds } },
    }),
    prisma.supplementGroupPrice.findMany({
      where: { seasonId, groupId: { in: groupIds } },
    }),
    prisma.licenseTypeSupplement.findMany({
      where: { typeId, supplementId: { in: supplementIds } },
    }),
    prisma.licenseTypeSupplementGroup.findMany({
      where: { typeId, groupId: { in: groupIds } },
    }),
  ]);

  return {
    priceBySupplementId: new Map(prices.map((p) => [p.supplementId, p.price])),
    priceByGroupId: new Map(groupPrices.map((p) => [p.groupId, p.price])),
    linkedSupplementIds: new Set(links.map((link) => link.supplementId)),
    linkedGroupIds: new Set(groupLinks.map((link) => link.groupId)),
  };
}

/**
 * Refuses to charge for anything the wizard would not have offered.
 *
 * The same predicate the wizard filters with decides it here, so a submission
 * that names a retired extra, or one the chosen federation does not offer,
 * cannot buy it by skipping the form. The message stays as vague as the one for
 * an extra that does not exist: the member picked from a list, so being told
 * which item is wrong is all they can act on.
 */
function requireOnSale(
  selected: CheckoutSupplement[],
  lookups: SellabilityLookups,
) {
  for (const supplement of selected) {
    const blocker = supplementBlockReason(supplement, lookups);
    // An unpriced extra falls through to the pricing step on purpose: that is
    // the club's own setup left unfinished, and it says which extra and why.
    if (blocker === null || blocker === "unpriced") continue;
    throw new CheckoutError("Suplementos inválidos");
  }
}

/**
 * Prices the chosen supplements for a season and federation. A supplement
 * belonging to a group is charged once for the whole group, no matter how many
 * of its members were picked.
 */
export async function resolveSupplements(
  supplementIds: string[],
  seasonId: string,
  typeId: string,
): Promise<SupplementPricing> {
  if (supplementIds.length === 0) return EMPTY;

  const selected = await prisma.supplement.findMany({
    where: { id: { in: supplementIds }, seasonId },
    include: { supplementGroup: true },
  });

  if (selected.length !== supplementIds.length) {
    throw new CheckoutError("Suplementos inválidos");
  }

  const lookups = await fetchCheckoutLookups(selected, seasonId, typeId);
  requireOnSale(selected, lookups);

  return priceSupplements(selected, {
    bySupplementId: lookups.priceBySupplementId,
    byGroupId: lookups.priceByGroupId,
  });
}
