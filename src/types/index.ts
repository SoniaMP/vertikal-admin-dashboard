export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export type SupplementGroupSummary = {
  id: string;
  name: string;
  price: number;
};

export type SupplementSummary = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  active: boolean;
  supplementGroupId: string | null;
  supplementGroup: SupplementGroupSummary | null;
};

export type LicenseSubtypeSummary = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  licenseTypeId: string;
};

export type LicenseTypeSummary = {
  id: string;
  name: string;
  description: string;
  active: boolean;
};

export type PersonalData = {
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

export type LicenseSelection = {
  typeId: string;
  subtypeId: string;
  categoryId: string;
  supplementIds: string[];
};

export type SupplementBreakdownItem = {
  name: string;
  price: number;
  isGroup: boolean;
};

export type PriceBreakdown = {
  categoryName: string;
  categoryPrice: number;
  membershipFee: number;
  supplements: SupplementBreakdownItem[];
  total: number;
};

// -- License catalog (used by registration wizard) --

export type CategoryOffering = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  prices: { subtypeId: string; price: number }[];
};

export type LicenseCatalogType = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  subtypes: LicenseSubtypeSummary[];
  categories: CategoryOffering[];
  supplements: SupplementSummary[];
  supplementGroups: SupplementGroupSummary[];
};

// -- Membership status --

export const MEMBERSHIP_STATUS = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const;

export type MembershipStatus =
  (typeof MEMBERSHIP_STATUS)[keyof typeof MEMBERSHIP_STATUS];

// -- Member / Membership record types --

export type MemberRecord = {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  sex: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MembershipSupplementRecord = {
  membershipId: string;
  supplementId: string;
  priceAtTime: number;
  supplement: SupplementSummary;
};

export type MembershipRecord = {
  id: string;
  memberId: string;
  seasonId: string;
  status: MembershipStatus;
  typeId: string | null;
  subtypeId: string | null;
  categoryId: string;
  offeringId: string | null;
  licensePriceSnapshot: number;
  licenseLabelSnapshot: string;
  isFederated: boolean;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  stripeSessionId: string | null;
  stripePaymentId: string | null;
  confirmationSent: boolean;
  consentedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  member: MemberRecord;
  type: LicenseTypeSummary | null;
  subtype: LicenseSubtypeSummary | null;
  category: { id: string; name: string };
  supplements: MembershipSupplementRecord[];
};
