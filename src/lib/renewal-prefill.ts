import { prisma } from "@/lib/prisma";

export type RenewalMemberData = {
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

/** Last season's licence as plain text, for a member to read and recognize. */
export type PreviousLicense = {
  label: string;
  seasonName: string;
};

export type RenewalPrefill = {
  member: RenewalMemberData;
  previousLicense: PreviousLicense | null;
};

type LicenceSource = {
  hasClubLicense: boolean;
  externalLicenseLabel: string | null;
  type: { name: string } | null;
  subtype: { name: string } | null;
  season: { year: number };
};

/**
 * Type and modality only. The age category is deliberately left out: naming
 * last season's band is what used to anchor a member to a band they have since
 * grown out of, and the price is left out because quoting last season's figure
 * invites an argument when this season's has moved.
 *
 * Built from the live names rather than `licenseLabelSnapshot`, which also
 * carries the category, so the note matches what the selector below it shows.
 */
function describeLicense(
  membership: LicenceSource | undefined,
): PreviousLicense | null {
  if (!membership) return null;

  if (!membership.hasClubLicense) {
    return membership.externalLicenseLabel
      ? {
          label: membership.externalLicenseLabel,
          seasonName: String(membership.season.year),
        }
      : null;
  }

  const parts = [membership.type?.name, membership.subtype?.name].filter(
    (part): part is string => Boolean(part),
  );

  if (parts.length === 0) return null;

  return {
    label: parts.join(" - "),
    seasonName: String(membership.season.year),
  };
}

/**
 * What a verified member gets back: their own stored details, and last
 * season's licence as a sentence.
 *
 * No identifiers leave this function. The licence is text and not a
 * selection on purpose: age categories and season prices change, and the
 * wizard's own cascade is the only thing that knows which combinations are
 * still sold. Carrying the old ids forward used to skip it.
 */
export async function fetchRenewalPrefill(
  dni: string,
): Promise<RenewalPrefill | null> {
  const member = await prisma.member.findUnique({
    where: { dni },
    include: {
      memberships: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          season: { select: { year: true } },
          type: { select: { name: true } },
          subtype: { select: { name: true } },
        },
      },
    },
  });

  if (!member) return null;

  return {
    member: {
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      dni: member.dni,
      dateOfBirth: member.dateOfBirth,
      sex: member.sex,
      address: member.address,
      city: member.city,
      postalCode: member.postalCode,
      province: member.province,
    },
    previousLicense: describeLicense(member.memberships[0]),
  };
}
