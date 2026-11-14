import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { completeCheckout } from "@/lib/checkout-completion";
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
    return respondToCheckout(event.data.object);
  }

  return NextResponse.json({ received: true });
}

/**
 * Stripe reads the status code as an instruction: a 2xx retires the event and
 * anything else asks for another delivery. So the question is never whether
 * something went wrong, but whether delivering it again could do better.
 *
 * A record that does not exist will not exist on the next attempt either, so
 * that alone is settled with a 2xx. An alert that could not be sent, on the
 * other hand, can still go out later, which is why only that case asks Stripe
 * to come back: the retries become the delivery guarantee for the one message
 * saying the club has money it cannot account for.
 */
async function respondToCheckout(session: Stripe.Checkout.Session) {
  try {
    const settled = await completeCheckout(session);
    if (!settled) {
      return NextResponse.json(
        { error: "Orphan payment could not be reported" },
        { status: 500 },
      );
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
