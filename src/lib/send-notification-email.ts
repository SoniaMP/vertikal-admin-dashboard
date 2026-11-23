import { createElement } from "react";
import { getResend } from "@/lib/resend";
import { renderBrandedEmail } from "@/lib/email-renderer";
import { prisma } from "@/lib/prisma";
import { getNotificationEmails } from "@/lib/settings";
import ClubMembershipNotification from "@/emails/club-membership-notification";
import type { ExternalLicenseNotice } from "@/emails/types";
import ClubCourseNotification from "@/emails/club-course-notification";

function getEmailFrom(): string {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("Missing EMAIL_FROM env var");
  return from;
}

type ExternalLicenseSource = {
  id: string;
  hasClubLicense: boolean;
  externalLicenseLabel: string | null;
};

/**
 * Payment activates the membership straight away, so the only guard against a
 * lapsed license is an admin opening the PDF. The notification has to say so.
 */
function buildExternalLicenseNotice(
  membership: ExternalLicenseSource,
): ExternalLicenseNotice | null {
  if (membership.hasClubLicense) return null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return {
    label: membership.externalLicenseLabel?.trim() || "sin indicar",
    membershipUrl: `${appUrl}/admin/registros/${membership.id}`,
  };
}

export async function sendClubMembershipNotification(
  membershipId: string,
): Promise<void> {
  const recipients = await getNotificationEmails("membership");
  if (recipients.length === 0) return;

  const membership = await prisma.membership.findUniqueOrThrow({
    where: { id: membershipId },
    include: {
      member: true,
      season: true,
      supplements: { include: { supplement: true } },
    },
  });

  const { member } = membership;
  const externalLicense = buildExternalLicenseNotice(membership);

  const html = await renderBrandedEmail(
    createElement(ClubMembershipNotification, {
      fullName: `${member.firstName} ${member.lastName}`,
      dni: member.dni,
      email: member.email,
      phone: member.phone,
      address: member.address,
      city: member.city,
      postalCode: member.postalCode,
      province: member.province,
      licenseLabel: membership.hasClubLicense
        ? membership.licenseLabelSnapshot
        : null,
      externalLicense,
      supplements: membership.supplements.map((s) => s.supplement.name),
      totalAmountCents: membership.totalAmount,
      seasonName: String(membership.season.year),
    }),
  );

  const resend = await getResend();
  await resend.emails.send({
    from: getEmailFrom(),
    to: recipients,
    subject: `Nueva inscripcion de socio — ${member.firstName} ${member.lastName}`,
    html,
  });
}

export async function sendClubCourseNotification(
  registrationId: string,
): Promise<void> {
  const registration = await prisma.courseRegistration.findUniqueOrThrow({
    where: { id: registrationId },
    include: {
      courseCatalog: { include: { instructor: { select: { email: true } } } },
      coursePrice: true,
    },
  });

  const globalRecipients = await getNotificationEmails("course");
  const instructorEmail = registration.courseCatalog.instructor?.email;
  const recipients = [
    ...globalRecipients,
    ...(instructorEmail ? [instructorEmail] : []),
  ];
  if (recipients.length === 0) return;

  const html = await renderBrandedEmail(
    createElement(ClubCourseNotification, {
      fullName: `${registration.firstName} ${registration.lastName}`,
      dni: registration.dni ?? "",
      email: registration.email,
      phone: registration.phone ?? "",
      courseTitle: registration.courseCatalog.title,
      coursePriceName: registration.coursePrice.name,
      amountCents: registration.coursePrice.amountCents,
    }),
  );

  const resend = await getResend();
  await resend.emails.send({
    from: getEmailFrom(),
    to: recipients,
    subject: `Nueva inscripcion en curso — ${registration.courseCatalog.title}`,
    html,
  });
}
