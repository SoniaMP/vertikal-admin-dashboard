"use server";

import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { createCheckoutSession } from "@/lib/checkout-session";
import { membershipCheckoutLines } from "@/lib/membership-checkout-lines";

export type ResumeCheckoutResult =
  | { status: "ready"; url: string }
  | { status: "error"; message: string };

/**
 * Opens a fresh Stripe session for a membership the member walked away from.
 *
 * Nothing is re-entered and nothing was lost: the membership was written to
 * the database before the first redirect, so backing out of the card form
 * leaves a complete record waiting. This just sends them back to it.
 */
export async function resumeMembershipCheckout(
  membershipId: string,
): Promise<ResumeCheckoutResult> {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: {
      member: { select: { email: true } },
      supplements: { include: { supplement: { select: { name: true } } } },
    },
  });

  if (!membership || membership.status !== "PENDING_PAYMENT") {
    return {
      status: "error",
      message: "Este alta ya no está pendiente de pago.",
    };
  }

  const { url, error } = await createCheckoutSession({
    stripe: getStripe(),
    membershipId,
    lineItems: membershipCheckoutLines(membership),
    email: membership.member.email,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
  });

  if (!url) {
    return { status: "error", message: error ?? "No se pudo abrir el pago." };
  }

  return { status: "ready", url };
}
