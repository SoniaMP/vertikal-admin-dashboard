import type { EmailBrandingSettings } from "@/lib/email-branding";

export type { EmailBrandingSettings };

export type MembershipConfirmationProps = {
  branding?: EmailBrandingSettings;
  firstName: string;
  lastName: string;
  email: string;
  licenseLabel: string;
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
  licenseLabel: string;
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

/** Format cents as EUR price (e.g. 1500 -> "15,00 €"). */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
