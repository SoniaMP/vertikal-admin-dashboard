import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import {
  sendMembershipConfirmationEmail,
  sendCourseConfirmationEmail,
} from "@/lib/send-email";
import {
  sendClubMembershipNotification,
  sendClubCourseNotification,
} from "@/lib/send-notification-email";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET env var");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(event.data.object);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { courseRegistrationId, membershipId } = session.metadata ?? {};

  if (courseRegistrationId) {
    await prisma.courseRegistration.update({
      where: { id: courseRegistrationId },
      data: {
        paymentStatus: "COMPLETED",
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
      },
    });
    await trySendEmail(() =>
      sendCourseConfirmationEmail(courseRegistrationId),
    );
    await trySendEmail(() =>
      sendClubCourseNotification(courseRegistrationId),
    );
  }

  if (membershipId) {
    await prisma.membership.update({
      where: { id: membershipId },
      data: {
        paymentStatus: "COMPLETED",
        status: "ACTIVE",
        stripePaymentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
      },
    });
    await trySendEmail(() =>
      sendMembershipConfirmationEmail(membershipId),
    );
    await trySendEmail(() =>
      sendClubMembershipNotification(membershipId),
    );
  }
}

/** Send email without blocking the webhook response on failure. */
async function trySendEmail(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }
}
