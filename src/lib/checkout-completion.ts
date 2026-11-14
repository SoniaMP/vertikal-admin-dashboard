import { prisma } from "@/lib/prisma";
import {
  sendMembershipConfirmationEmail,
  sendCourseConfirmationEmail,
} from "@/lib/send-email";
import {
  sendClubMembershipNotification,
  sendClubCourseNotification,
} from "@/lib/send-notification-email";
import { sendOrphanPaymentAlert } from "@/lib/orphan-payment-alert";
import type Stripe from "stripe";

/**
 * Prisma throws P2025 when an update matches no row. Matching on the code
 * rather than the error class keeps this working even if the thrown error
 * comes from a different copy of the client than the one this module imports.
 */
function isRecordNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2025"
  );
}

function paymentIntentId(session: Stripe.Checkout.Session): string | null {
  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : null;
}

/** Send email without failing the whole completion. */
async function trySendEmail(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }
}

/**
 * The record this payment belongs to is gone, so the club has money it cannot
 * account for. Nothing else records that this happened.
 *
 * @returns false when the alert did not go out, so Stripe should retry.
 */
async function reportOrphan(
  recordKind: string,
  missingId: string,
  session: Stripe.Checkout.Session,
): Promise<boolean> {
  console.error(
    `Orphan payment: no record ${missingId} for ${recordKind}, session ${session.id}`,
  );

  try {
    await sendOrphanPaymentAlert({ recordKind, missingId, session });
    return true;
  } catch (error) {
    console.error("Could not report orphan payment:", error);
    return false;
  }
}

async function completeMembership(
  id: string,
  session: Stripe.Checkout.Session,
): Promise<boolean> {
  try {
    await prisma.membership.update({
      where: { id },
      data: {
        paymentStatus: "COMPLETED",
        status: "ACTIVE",
        stripePaymentId: paymentIntentId(session),
      },
    });
  } catch (error) {
    if (!isRecordNotFound(error)) throw error;
    return reportOrphan("la membresía", id, session);
  }

  await trySendEmail(() => sendMembershipConfirmationEmail(id));
  await trySendEmail(() => sendClubMembershipNotification(id));
  return true;
}

async function completeCourseRegistration(
  id: string,
  session: Stripe.Checkout.Session,
): Promise<boolean> {
  try {
    await prisma.courseRegistration.update({
      where: { id },
      data: {
        paymentStatus: "COMPLETED",
        stripePaymentIntentId: paymentIntentId(session),
      },
    });
  } catch (error) {
    if (!isRecordNotFound(error)) throw error;
    return reportOrphan("la inscripción al curso", id, session);
  }

  await trySendEmail(() => sendCourseConfirmationEmail(id));
  await trySendEmail(() => sendClubCourseNotification(id));
  return true;
}

/**
 * Marks the paid record as completed and sends what follows from it.
 *
 * @returns false when Stripe should deliver this event again, which here means
 * only one thing: the payment was orphaned and the club could not be told.
 */
export async function completeCheckout(
  session: Stripe.Checkout.Session,
): Promise<boolean> {
  const { courseRegistrationId, membershipId } = session.metadata ?? {};
  let settled = true;

  if (courseRegistrationId) {
    settled =
      (await completeCourseRegistration(courseRegistrationId, session)) &&
      settled;
  }

  if (membershipId) {
    settled = (await completeMembership(membershipId, session)) && settled;
  }

  return settled;
}
