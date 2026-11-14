import { CheckoutError } from "@/lib/checkout-error";

export type SupplementLineItem = { name: string; price: number };

export type SupplementSnapshot = {
  supplementId: string;
  priceAtTime: number;
};

export type SelectedSupplement = {
  id: string;
  name: string;
  supplementGroupId: string | null;
  supplementGroup: { name: string } | null;
};

export type SeasonPrices = {
  bySupplementId: Map<string, number>;
  byGroupId: Map<string, number>;
};

export type SupplementPricing = {
  supplementsTotal: number;
  lineItems: SupplementLineItem[];
  supplements: SupplementSnapshot[];
};

/**
 * What this supplement costs the member. A grouped one is sold through its
 * group, so the group price is the only one that counts.
 *
 * The club sells nothing for free, so a missing season price is always setup
 * left unfinished rather than a deliberate zero. Billing it at 0 would hand
 * over something meant to be paid for and nobody would notice until the
 * accounts were read, so the checkout stops instead.
 */
function requirePrice(
  supplement: SelectedSupplement,
  prices: SeasonPrices,
): number {
  const groupId = supplement.supplementGroupId;
  const price =
    groupId === null
      ? prices.bySupplementId.get(supplement.id)
      : prices.byGroupId.get(groupId);

  if (price === undefined) {
    throw new CheckoutError(
      `El suplemento "${supplement.name}" no tiene precio en la temporada activa`,
    );
  }
  return price;
}

/**
 * One invoice line per supplement, except that a group bills once however many
 * of its supplements were picked.
 */
function buildLineItems(
  selected: SelectedSupplement[],
  prices: SeasonPrices,
): SupplementLineItem[] {
  const lineItems: SupplementLineItem[] = [];
  const billedGroupIds = new Set<string>();

  for (const supplement of selected) {
    const price = requirePrice(supplement, prices);
    const groupId = supplement.supplementGroupId;

    if (groupId === null) {
      lineItems.push({ name: supplement.name, price });
      continue;
    }
    if (billedGroupIds.has(groupId)) continue;
    billedGroupIds.add(groupId);
    lineItems.push({
      name: supplement.supplementGroup?.name ?? "Grupo",
      price,
    });
  }

  return lineItems;
}

/**
 * What each chosen supplement is recorded at. A grouped one costs the group
 * price, so that is what goes in: its own season price, if anyone filled one
 * in, is not what the member paid. Two supplements of the same group therefore
 * each record the group price although it was charged once, so a reader adding
 * these up counts every group a single time. The amount actually charged lives
 * in `Membership.totalAmount`.
 */
function buildSnapshots(
  selected: SelectedSupplement[],
  prices: SeasonPrices,
): SupplementSnapshot[] {
  return selected.map((supplement) => ({
    supplementId: supplement.id,
    priceAtTime: requirePrice(supplement, prices),
  }));
}

export function priceSupplements(
  selected: SelectedSupplement[],
  prices: SeasonPrices,
): SupplementPricing {
  const lineItems = buildLineItems(selected, prices);

  return {
    supplementsTotal: lineItems.reduce((sum, item) => sum + item.price, 0),
    lineItems,
    supplements: buildSnapshots(selected, prices),
  };
}
