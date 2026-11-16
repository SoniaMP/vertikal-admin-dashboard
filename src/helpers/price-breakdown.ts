import {
  calculateTotal,
  calculateMemberOnlyTotal,
} from "@/helpers/price-calculator";
import type { LicenseCatalogType, PriceBreakdown } from "@/types";
import type { RegistrationInput } from "@/validations/registration";

/** The summary's total, or null when the chosen combination has no price. */
export function buildPriceBreakdown(
  data: RegistrationInput,
  licenseTypes: LicenseCatalogType[],
  membershipFee: number,
): PriceBreakdown | null {
  if (!data.hasClubLicense) return calculateMemberOnlyTotal(membershipFee);

  const licenseType = licenseTypes.find((lt) => lt.id === data.typeId);
  const category = licenseType?.categories.find(
    (c) => c.id === data.categoryId,
  );
  const categoryPrice = category?.prices.find(
    (p) => p.subtypeId === data.subtypeId,
  );
  if (!category || !categoryPrice) return null;

  const supplements =
    licenseType?.supplements.filter((s) =>
      data.supplementIds?.includes(s.id),
    ) ?? [];

  return calculateTotal(
    category.name,
    categoryPrice.price,
    supplements,
    membershipFee,
  );
}
