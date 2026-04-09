import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export type CourseConfirmation = {
  firstName: string;
  lastName: string;
  email: string;
  courseTitle: string;
  priceName: string;
  amountCents: number;
};

/**
 * Verify a Stripe checkout session and mark the related record as paid.
 * Safe to call multiple times (idempotent).
 * Returns registration details when the session was paid successfully.
 */
export async function confirmCourseCheckout(
  sessionId: string,
): Promise<CourseConfirmation | null> {
  const session = await getStripe().checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") return null;

  const registrationId = session.metadata?.courseRegistrationId;
  if (!registrationId) return null;

  const registration = await prisma.courseRegistration.update({
    where: { id: registrationId },
    data: {
      paymentStatus: "COMPLETED",
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
    },
    include: {
      courseCatalog: { select: { title: true } },
      coursePrice: { select: { name: true, amountCents: true } },
    },
  });

  return {
    firstName: registration.firstName,
    lastName: registration.lastName,
    email: registration.email,
    courseTitle: registration.courseCatalog.title,
    priceName: registration.coursePrice.name,
    amountCents: registration.coursePrice.amountCents,
  };
}

export type MembershipConfirmation = {
  member: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dni: string;
    dateOfBirth: string;
    address: string;
    city: string;
    postalCode: string;
    province: string;
  };
  licenseLabel: string;
  totalAmount: number;
  supplements: { name: string }[];
};

export async function confirmMembershipCheckout(
  sessionId: string,
): Promise<MembershipConfirmation | null> {
  const session = await getStripe().checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") return null;

  const membershipId = session.metadata?.membershipId;
  if (!membershipId) return null;

  const membership = await prisma.membership.update({
    where: { id: membershipId },
    data: {
      paymentStatus: "COMPLETED",
      status: "ACTIVE",
      stripePaymentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
    },
    include: {
      member: true,
      supplements: { include: { supplement: true } },
    },
  });

  return {
    member: membership.member,
    licenseLabel: membership.licenseLabelSnapshot,
    totalAmount: membership.totalAmount,
    supplements: membership.supplements.map((s) => ({
      name: s.supplement.name,
    })),
  };
}
