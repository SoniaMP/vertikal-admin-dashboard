import { prisma } from "@/lib/prisma";

export type PendingMembership = {
  totalAmount: number;
  seasonName: string;
};

/**
 * What the cancelled-payment screen is allowed to show.
 *
 * The membership id travels in the URL Stripe sends the member back to, so
 * anything this returns is readable by anyone holding that link. It therefore
 * carries no personal data at all — not a name, not an email — only the amount
 * outstanding and the season it belongs to.
 *
 * @returns null unless that membership is genuinely still awaiting payment.
 */
export async function fetchPendingMembership(
  membershipId: string,
): Promise<PendingMembership | null> {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    select: {
      status: true,
      paymentStatus: true,
      totalAmount: true,
      season: { select: { name: true } },
    },
  });

  if (!membership) return null;
  if (membership.status !== "PENDING_PAYMENT") return null;
  if (membership.paymentStatus !== "PENDING") return null;

  return {
    totalAmount: membership.totalAmount,
    seasonName: membership.season.name,
  };
}
