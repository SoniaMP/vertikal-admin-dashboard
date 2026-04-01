import { prisma } from "@/lib/prisma";

interface MembershipInput {
  memberId: string;
  seasonId: string;
  typeId: string;
  subtypeId: string;
  categoryId: string;
  offeringId: string;
  licensePriceSnapshot: number;
  licenseLabelSnapshot: string;
  totalAmount: number;
  supplements: { supplementId: string; priceAtTime: number }[];
}

export async function findOrCreateMembership(input: MembershipInput) {
  const { memberId, seasonId, supplements, ...fields } = input;

  const existing = await prisma.membership.findUnique({
    where: { memberId_seasonId: { memberId, seasonId } },
  });

  if (existing?.status === "ACTIVE") {
    return { membership: null, isAlreadyActive: true };
  }

  if (existing) {
    await prisma.membershipSupplement.deleteMany({
      where: { membershipId: existing.id },
    });

    const membership = await prisma.membership.update({
      where: { id: existing.id },
      data: {
        ...fields,
        status: "PENDING_PAYMENT",
        paymentStatus: "PENDING",
        stripeSessionId: null,
        stripePaymentId: null,
        consentedAt: new Date(),
        supplements: { create: supplements },
      },
    });

    return { membership, isAlreadyActive: false };
  }

  const membership = await prisma.membership.create({
    data: {
      memberId,
      seasonId,
      ...fields,
      paymentStatus: "PENDING",
      consentedAt: new Date(),
      supplements: { create: supplements },
    },
  });

  return { membership, isAlreadyActive: false };
}
