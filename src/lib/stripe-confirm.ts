import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export type CourseConfirmation = {
  firstName: string;
  lastName: string;
  email: string;
  courseTitle: string;
  priceName: string;
  amountCents: number;
};

export type MembershipConfirmation = {
  member: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dni: string;
    dateOfBirth: string;
    sex: string;
    address: string;
    city: string;
    postalCode: string;
    province: string;
  };
  /** Null when the member federates outside the club. */
  licenseLabel: string | null;
  externalLicenseLabel: string | null;
  totalAmount: number;
  supplements: { name: string }[];
};

/**
 * These pages only read. Marking the record as paid is the webhook's job, and
 * it is the only one that can do it properly: it also sends the confirmation to
 * the member and the notice to the club. A page that wrote as well would open a
 * window where a membership looks active in the admin panel although nobody has
 * been told about it, which is worse than a row that is a few seconds behind.
 *
 * The member never sees that lag: the summary shows their data, their
 * supplements and the total, and none of it depends on the payment columns.
 *
 * Stripe is still asked whether the session was paid. That check is what lets
 * these pages be public: without a paid session there is nothing to show.
 */
async function paidSession(
  sessionId: string,
): Promise<Stripe.Checkout.Session | null> {
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  return session.payment_status === "paid" ? session : null;
}

export async function fetchCourseConfirmation(
  sessionId: string,
): Promise<CourseConfirmation | null> {
  const session = await paidSession(sessionId);
  const registrationId = session?.metadata?.courseRegistrationId;
  if (!registrationId) return null;

  const registration = await prisma.courseRegistration.findUnique({
    where: { id: registrationId },
    include: {
      courseCatalog: { select: { title: true } },
      coursePrice: { select: { name: true, amountCents: true } },
    },
  });
  if (!registration) return null;

  return {
    firstName: registration.firstName,
    lastName: registration.lastName,
    email: registration.email,
    courseTitle: registration.courseCatalog.title,
    priceName: registration.coursePrice.name,
    amountCents: registration.coursePrice.amountCents,
  };
}

export async function fetchMembershipConfirmation(
  sessionId: string,
): Promise<MembershipConfirmation | null> {
  const session = await paidSession(sessionId);
  const membershipId = session?.metadata?.membershipId;
  if (!membershipId) return null;

  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: {
      member: true,
      supplements: { include: { supplement: true } },
    },
  });
  if (!membership) return null;

  return {
    member: membership.member,
    licenseLabel: membership.hasClubLicense
      ? membership.licenseLabelSnapshot
      : null,
    externalLicenseLabel: membership.externalLicenseLabel,
    totalAmount: membership.totalAmount,
    supplements: membership.supplements.map((s) => ({
      name: s.supplement.name,
    })),
  };
}
