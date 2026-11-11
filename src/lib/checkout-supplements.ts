import { prisma } from "@/lib/prisma";
import { CheckoutError } from "@/lib/checkout-error";

export type SupplementLineItem = { name: string; price: number };

type ResolvedSupplements = {
  supplementsTotal: number;
  lineItems: SupplementLineItem[];
  supplements: { supplementId: string; priceAtTime: number }[];
};

const EMPTY: ResolvedSupplements = {
  supplementsTotal: 0,
  lineItems: [],
  supplements: [],
};

/**
 * Prices the chosen supplements for a season. A supplement belonging to a
 * priced group is charged once for the whole group, no matter how many of its
 * members were picked.
 */
export async function resolveSupplements(
  supplementIds: string[],
  seasonId: string,
): Promise<ResolvedSupplements> {
  if (supplementIds.length === 0) return EMPTY;

  const selected = await prisma.supplement.findMany({
    where: { id: { in: supplementIds }, active: true },
    include: { supplementGroup: true },
  });

  if (selected.length !== supplementIds.length) {
    throw new CheckoutError("Suplementos inválidos");
  }

  const prices = await prisma.supplementPrice.findMany({
    where: { seasonId, supplementId: { in: supplementIds } },
  });
  const priceBySupplementId = new Map(
    prices.map((sp) => [sp.supplementId, sp.price]),
  );

  const groupIds = [
    ...new Set(
      selected
        .map((s) => s.supplementGroupId)
        .filter((id): id is string => id !== null),
    ),
  ];
  const groupPrices = await prisma.supplementGroupPrice.findMany({
    where: { seasonId, groupId: { in: groupIds } },
  });
  const priceByGroupId = new Map(
    groupPrices.map((gp) => [gp.groupId, gp.price]),
  );

  let supplementsTotal = 0;
  const lineItems: SupplementLineItem[] = [];
  const seenGroupIds = new Set<string>();

  for (const s of selected) {
    const groupId = s.supplementGroupId;
    if (groupId && priceByGroupId.has(groupId)) {
      if (seenGroupIds.has(groupId)) continue;
      seenGroupIds.add(groupId);
      const groupPrice = priceByGroupId.get(groupId)!;
      lineItems.push({
        name: s.supplementGroup?.name ?? "Grupo",
        price: groupPrice,
      });
      supplementsTotal += groupPrice;
      continue;
    }
    const price = priceBySupplementId.get(s.id) ?? 0;
    lineItems.push({ name: s.name, price });
    supplementsTotal += price;
  }

  const supplements = selected.map((s) => ({
    supplementId: s.id,
    priceAtTime: priceBySupplementId.get(s.id) ?? 0,
  }));

  return { supplementsTotal, lineItems, supplements };
}
