import { prisma } from "@/lib/prisma";
import { MEMBERSHIP_FEE_ITEM } from "@/helpers/checkout-labels";
import { CheckoutError } from "@/lib/checkout-error";
import {
  resolveSupplements,
  type SupplementLineItem,
} from "@/lib/checkout-supplements";
import type { RegistrationInput } from "@/validations/registration";

export type CheckoutPlan = {
  lineItems: SupplementLineItem[];
  total: number;
  supplements: { supplementId: string; priceAtTime: number }[];
  membershipFields: {
    hasClubLicense: boolean;
    typeId: string | null;
    subtypeId: string | null;
    categoryId: string | null;
    offeringId: string | null;
    licensePriceSnapshot: number;
    licenseLabelSnapshot: string;
    externalLicenseLabel: string | null;
    externalLicenseFileUrl: string | null;
  };
};

type PlanInput = {
  data: RegistrationInput;
  seasonId: string;
  membershipFee: number;
};

/**
 * A member who proves a license obtained elsewhere pays the membership fee and
 * nothing else. The license snapshots stay at zero on purpose: reporting reads
 * `licensePriceSnapshot > 0` as "this member paid us for a federation license".
 */
function buildMemberOnlyPlan({ data, membershipFee }: PlanInput): CheckoutPlan {
  return {
    lineItems: [{ name: MEMBERSHIP_FEE_ITEM, price: membershipFee }],
    total: membershipFee,
    supplements: [],
    membershipFields: {
      hasClubLicense: false,
      typeId: null,
      subtypeId: null,
      categoryId: null,
      offeringId: null,
      licensePriceSnapshot: 0,
      licenseLabelSnapshot: "",
      externalLicenseLabel: data.externalLicenseLabel,
      externalLicenseFileUrl: data.externalLicenseFileUrl,
    },
  };
}

async function buildClubLicensePlan({
  data,
  seasonId,
  membershipFee,
}: PlanInput): Promise<CheckoutPlan> {
  const offering = await prisma.licenseOffering.findFirst({
    where: {
      seasonId,
      typeId: data.typeId,
      subtypeId: data.subtypeId,
      categoryId: data.categoryId,
    },
    include: { type: true, subtype: true, category: true },
  });

  if (!offering) {
    throw new CheckoutError(
      "No hay oferta para esta combinación de licencia y categoría",
    );
  }

  const { supplementsTotal, lineItems, supplements } = await resolveSupplements(
    data.supplementIds,
    seasonId,
  );

  const licenseLabel = `${offering.type.name} - ${offering.subtype.name} - ${offering.category.name}`;

  return {
    lineItems: [
      { name: licenseLabel, price: offering.price },
      { name: MEMBERSHIP_FEE_ITEM, price: membershipFee },
      ...lineItems,
    ],
    total: offering.price + membershipFee + supplementsTotal,
    supplements,
    membershipFields: {
      hasClubLicense: true,
      typeId: data.typeId,
      subtypeId: data.subtypeId,
      categoryId: data.categoryId,
      offeringId: offering.id,
      licensePriceSnapshot: offering.price,
      licenseLabelSnapshot: licenseLabel,
      externalLicenseLabel: null,
      externalLicenseFileUrl: null,
    },
  };
}

/** Prices a registration and shapes what gets stored and charged. */
export function buildCheckoutPlan(input: PlanInput): Promise<CheckoutPlan> {
  if (input.data.hasClubLicense) return buildClubLicensePlan(input);
  return Promise.resolve(buildMemberOnlyPlan(input));
}
