import type { PriceBreakdown, SupplementSummary, SupplementBreakdownItem } from "@/types";

export function calculateTotal(
  categoryName: string,
  categoryPrice: number,
  selectedSupplements: SupplementSummary[],
  membershipFee: number,
): PriceBreakdown {
  const supplements: SupplementBreakdownItem[] = [];
  const seenGroupIds = new Set<string>();
  let supplementsTotal = 0;

  for (const s of selectedSupplements) {
    if (s.supplementGroupId && s.supplementGroup) {
      if (!seenGroupIds.has(s.supplementGroupId)) {
        seenGroupIds.add(s.supplementGroupId);
        supplements.push({
          name: s.supplementGroup.name,
          price: s.supplementGroup.price,
          isGroup: true,
        });
        supplementsTotal += s.supplementGroup.price;
      }
    } else if (s.price !== null) {
      supplements.push({ name: s.name, price: s.price, isGroup: false });
      supplementsTotal += s.price;
    }
  }

  return {
    categoryName,
    categoryPrice,
    membershipFee,
    supplements,
    total: categoryPrice + membershipFee + supplementsTotal,
  };
}

/**
 * A member who proves a license obtained elsewhere pays the membership fee and
 * nothing else: no offering price and no license supplements.
 */
export function calculateMemberOnlyTotal(membershipFee: number): PriceBreakdown {
  return {
    categoryName: null,
    categoryPrice: 0,
    membershipFee,
    supplements: [],
    total: membershipFee,
  };
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
