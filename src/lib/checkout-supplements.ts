import { prisma } from "@/lib/prisma";
import { CheckoutError } from "@/lib/checkout-error";
import {
  priceSupplements,
  type SeasonPrices,
  type SelectedSupplement,
  type SupplementLineItem,
  type SupplementPricing,
} from "@/helpers/supplement-pricing";

export type { SupplementLineItem };

const EMPTY: SupplementPricing = {
  supplementsTotal: 0,
  lineItems: [],
  supplements: [],
};

async function fetchSeasonPrices(
  selected: SelectedSupplement[],
  seasonId: string,
): Promise<SeasonPrices> {
  const groupIds = [
    ...new Set(
      selected
        .map((s) => s.supplementGroupId)
        .filter((id): id is string => id !== null),
    ),
  ];

  const [prices, groupPrices] = await Promise.all([
    prisma.supplementPrice.findMany({
      where: { seasonId, supplementId: { in: selected.map((s) => s.id) } },
    }),
    prisma.supplementGroupPrice.findMany({
      where: { seasonId, groupId: { in: groupIds } },
    }),
  ]);

  return {
    bySupplementId: new Map(prices.map((sp) => [sp.supplementId, sp.price])),
    byGroupId: new Map(groupPrices.map((gp) => [gp.groupId, gp.price])),
  };
}

/**
 * Prices the chosen supplements for a season. A supplement belonging to a
 * group is charged once for the whole group, no matter how many of its
 * members were picked.
 */
export async function resolveSupplements(
  supplementIds: string[],
  seasonId: string,
): Promise<SupplementPricing> {
  if (supplementIds.length === 0) return EMPTY;

  const selected = await prisma.supplement.findMany({
    where: { id: { in: supplementIds }, active: true },
    include: { supplementGroup: true },
  });

  if (selected.length !== supplementIds.length) {
    throw new CheckoutError("Suplementos inválidos");
  }

  return priceSupplements(selected, await fetchSeasonPrices(selected, seasonId));
}
