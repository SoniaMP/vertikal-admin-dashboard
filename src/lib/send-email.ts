import { createElement } from "react";
import { getResend } from "@/lib/resend";
import { renderBrandedEmail } from "@/lib/email-renderer";
import { prisma } from "@/lib/prisma";
import MembershipConfirmation from "@/emails/membership-confirmation";
import CourseConfirmation from "@/emails/course-confirmation";

function getEmailFrom(): string {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("Missing EMAIL_FROM env var");
  return from;
}

export async function sendMembershipConfirmationEmail(
  membershipId: string,
): Promise<void> {
  const membership = await prisma.membership.findUniqueOrThrow({
    where: { id: membershipId },
    include: {
      member: true,
      season: true,
      supplements: { include: { supplement: true } },
    },
  });

  if (membership.confirmationSent) return;

  const html = await renderBrandedEmail(
    createElement(MembershipConfirmation, {
      firstName: membership.member.firstName,
      lastName: membership.member.lastName,
      email: membership.member.email,
      licenseLabel: membership.licenseLabelSnapshot,
      totalAmountCents: membership.totalAmount,
      supplements: membership.supplements.map((s) => s.supplement.name),
      seasonName: membership.season.name,
    }),
  );

  const resend = await getResend();
  await resend.emails.send({
    from: getEmailFrom(),
    to: membership.member.email,
    subject: `Confirmación de inscripción — ${membership.season.name}`,
    html,
  });

  await prisma.membership.update({
    where: { id: membershipId },
    data: { confirmationSent: true },
  });
}

export async function sendCourseConfirmationEmail(
  registrationId: string,
): Promise<void> {
  const registration = await prisma.courseRegistration.findUniqueOrThrow({
    where: { id: registrationId },
    include: {
      courseCatalog: true,
      coursePrice: true,
    },
  });

  if (registration.confirmationSent) return;

  const html = await renderBrandedEmail(
    createElement(CourseConfirmation, {
      firstName: registration.firstName,
      lastName: registration.lastName,
      email: registration.email,
      courseTitle: registration.courseCatalog.title,
      coursePriceName: registration.coursePrice.name,
      amountCents: registration.coursePrice.amountCents,
    }),
  );

  const resend = await getResend();
  await resend.emails.send({
    from: getEmailFrom(),
    to: registration.email,
    subject: `Confirmación de curso — ${registration.courseCatalog.title}`,
    html,
  });

  await prisma.courseRegistration.update({
    where: { id: registrationId },
    data: { confirmationSent: true },
  });
}
