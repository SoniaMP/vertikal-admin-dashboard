import { prisma } from "@/lib/prisma";
import type { getStripe } from "@/lib/stripe";
import type { SupplementLineItem } from "@/lib/checkout-supplements";

type CheckoutSessionInput = {
  stripe: ReturnType<typeof getStripe>;
  membershipId: string;
  lineItems: SupplementLineItem[];
  email: string;
  appUrl: string;
};

/**
 * Opens the Stripe Checkout session and records its id on the membership. If
 * Stripe refuses, the membership is marked as failed so it is not left looking
 * like a payment still in flight.
 */
export async function createCheckoutSession({
  stripe,
  membershipId,
  lineItems,
  email,
  appUrl,
}: CheckoutSessionInput) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems.map((item) => ({
        price_data: {
          currency: "eur",
          product_data: { name: item.name },
          unit_amount: item.price,
        },
        quantity: 1,
      })),
      customer_email: email,
      metadata: { membershipId },
      success_url: `${appUrl}/registro/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/registro/cancelado?membership_id=${membershipId}`,
    });

    await prisma.membership.update({
      where: { id: membershipId },
      data: { stripeSessionId: session.id },
    });

    return { url: session.url, error: null };
  } catch (err) {
    await prisma.membership.update({
      where: { id: membershipId },
      data: { paymentStatus: "FAILED", status: "CANCELLED" },
    });

    const message =
      err instanceof Error ? err.message : "Error al crear sesión de pago";
    console.error("Stripe checkout error:", message);

    return {
      url: null,
      error: `Error al conectar con la pasarela de pago: ${message}`,
    };
  }
}
