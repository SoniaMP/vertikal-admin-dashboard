import { createElement } from "react";
import { getResend } from "@/lib/resend";
import { renderBrandedEmail } from "@/lib/email-renderer";
import { getNotificationEmails } from "@/lib/settings";
import ClubOrphanPayment from "@/emails/club-orphan-payment";
import type Stripe from "stripe";

export type OrphanPayment = {
  /** What the payment was meant to be, for the email copy. */
  recordKind: string;
  missingId: string;
  session: Stripe.Checkout.Session;
};

/**
 * Tells the club it has been paid for a record that no longer exists, so
 * somebody can refund it from Stripe.
 *
 * Orphan payments always go to the membership recipients, whichever branch
 * produced them: this is an accounting incident, not a course notification,
 * and the course list may well be the thing that is misconfigured.
 *
 * It throws when it cannot deliver — no recipients configured, or Resend
 * refusing — because the caller turns that into a retry. Nothing else records
 * that this happened, so a swallowed failure would erase the incident.
 */
export async function sendOrphanPaymentAlert({
  recordKind,
  missingId,
  session,
}: OrphanPayment): Promise<void> {
  const recipients = await getNotificationEmails("membership");
  if (recipients.length === 0) {
    throw new Error(
      "No membership notification recipients configured: orphan payment could not be reported",
    );
  }

  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("Missing EMAIL_FROM env var");

  const html = await renderBrandedEmail(
    createElement(ClubOrphanPayment, {
      recordKind,
      missingId,
      sessionId: session.id,
      payerEmail: session.customer_email ?? null,
      amountCents: session.amount_total ?? null,
    }),
  );

  const resend = await getResend();
  await resend.emails.send({
    from,
    to: recipients,
    subject: `Cobro sin registro asociado — ${recordKind}`,
    html,
  });
}
