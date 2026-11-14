import type { EmailBrandingSettings } from "@/lib/email-branding";

export type { EmailBrandingSettings };

export type MembershipConfirmationProps = {
  branding?: EmailBrandingSettings;
  firstName: string;
  lastName: string;
  email: string;
  /** Null when the member federates outside the club: there is nothing to bill. */
  licenseLabel: string | null;
  externalLicenseLabel: string | null;
  totalAmountCents: number;
  supplements: string[];
  seasonName: string;
};

export type CourseConfirmationProps = {
  branding?: EmailBrandingSettings;
  firstName: string;
  lastName: string;
  email: string;
  courseTitle: string;
  coursePriceName: string;
  amountCents: number;
};

/** What the admin needs to check a license the member obtained elsewhere. */
export type ExternalLicenseNotice = {
  label: string;
  membershipUrl: string;
};

export type MembershipNotificationProps = {
  branding?: EmailBrandingSettings;
  fullName: string;
  dni: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  /** Null when the member federates outside the club. */
  licenseLabel: string | null;
  externalLicense: ExternalLicenseNotice | null;
  supplements: string[];
  totalAmountCents: number;
  seasonName: string;
};

export type CourseNotificationProps = {
  branding?: EmailBrandingSettings;
  fullName: string;
  dni: string;
  email: string;
  phone: string;
  courseTitle: string;
  coursePriceName: string;
  amountCents: number;
};

/**
 * A payment Stripe confirmed for a record that is no longer in the database.
 * The club has the money and nothing to attach it to, so the alert carries
 * what is needed to find the payer in Stripe and refund them.
 */
export type OrphanPaymentProps = {
  branding?: EmailBrandingSettings;
  /** "membresía" or "inscripción a curso": what the payment was meant to be. */
  recordKind: string;
  /** The id that no longer resolves, kept for the server logs. */
  missingId: string;
  sessionId: string;
  payerEmail: string | null;
  amountCents: number | null;
};

/** Format cents as EUR price (e.g. 1500 -> "15,00 €"). */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
