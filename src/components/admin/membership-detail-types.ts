export type MembershipDetailData = {
  id: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  licensePriceSnapshot: number;
  licenseLabelSnapshot: string;
  hasClubLicense: boolean;
  externalLicenseLabel: string | null;
  externalLicenseFileUrl: string | null;
  externalLicenseVerifiedAt: Date | null;
  stripeSessionId: string | null;
  stripePaymentId: string | null;
  confirmationSent: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  type: { name: string } | null;
  subtype: { name: string } | null;
  supplements: {
    priceAtTime: number;
    supplement: { name: string };
  }[];
};
