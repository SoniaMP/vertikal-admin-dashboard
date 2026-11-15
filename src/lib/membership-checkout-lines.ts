import { MEMBERSHIP_FEE_ITEM } from "@/helpers/checkout-labels";
import type { SupplementLineItem } from "@/lib/checkout-supplements";

export type MembershipLineSource = {
  licenseLabelSnapshot: string;
  licensePriceSnapshot: number;
  totalAmount: number;
  supplements: { priceAtTime: number; supplement: { name: string } }[];
};

/**
 * Rebuilds the Stripe line items for a membership that already exists, from
 * the prices stored on it rather than from today's catalog.
 *
 * That is deliberate: the member agreed to these figures before being sent to
 * Stripe, and a season price that moved in between is not something to spring
 * on them when they come back to finish paying. The fee is whatever the total
 * does not account for, so the lines always add up to the amount on record.
 */
export function membershipCheckoutLines(
  membership: MembershipLineSource,
): SupplementLineItem[] {
  const lines: SupplementLineItem[] = [];

  if (membership.licenseLabelSnapshot && membership.licensePriceSnapshot > 0) {
    lines.push({
      name: membership.licenseLabelSnapshot,
      price: membership.licensePriceSnapshot,
    });
  }

  const supplementLines = membership.supplements.map((entry) => ({
    name: entry.supplement.name,
    price: entry.priceAtTime,
  }));

  const accounted =
    membership.licensePriceSnapshot +
    supplementLines.reduce((total, line) => total + line.price, 0);
  const fee = membership.totalAmount - accounted;

  if (fee > 0) lines.push({ name: MEMBERSHIP_FEE_ITEM, price: fee });

  return [...lines, ...supplementLines];
}
