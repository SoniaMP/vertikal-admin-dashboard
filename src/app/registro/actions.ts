"use server";

import { prisma } from "@/lib/prisma";
import { dniSchema } from "@/validations/registration";
import { getActiveSeason } from "@/lib/settings";

export type DniCheckResult =
  | { reason: "dni_invalido" }
  | { reason: "dni_no_existe" }
  | { reason: "dni_existe_sin_membresia_temporada" }
  | { reason: "dni_existe_con_membresia_temporada" };

export async function checkDni(dni: string): Promise<DniCheckResult> {
  const parsed = dniSchema.safeParse(dni);
  if (!parsed.success) return { reason: "dni_invalido" };

  const season = await getActiveSeason();

  const member = await prisma.member.findUnique({
    where: { dni: parsed.data },
    select: {
      id: true,
      memberships: {
        where: { seasonId: season.id },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!member) return { reason: "dni_no_existe" };
  if (member.memberships.length > 0) {
    return { reason: "dni_existe_con_membresia_temporada" };
  }
  return { reason: "dni_existe_sin_membresia_temporada" };
}

export type RenewalSearchResult = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dni: string;
  dateOfBirth: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  typeId: string;
  subtypeId: string;
  categoryId: string;
  supplementIds: string[];
};

export async function findMemberByDni(
  dni: string,
): Promise<RenewalSearchResult | null> {
  const parsed = dniSchema.safeParse(dni);
  if (!parsed.success) return null;

  const member = await prisma.member.findUnique({
    where: { dni: parsed.data },
    include: {
      memberships: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { supplements: { select: { supplementId: true } } },
      },
    },
  });

  if (!member) return null;

  const latestMembership = member.memberships[0];

  return {
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    phone: member.phone,
    dni: member.dni,
    dateOfBirth: member.dateOfBirth,
    address: member.address,
    city: member.city,
    postalCode: member.postalCode,
    province: member.province,
    typeId: latestMembership?.typeId ?? "",
    subtypeId: latestMembership?.subtypeId ?? "",
    categoryId: latestMembership?.categoryId ?? "",
    supplementIds:
      latestMembership?.supplements.map((s) => s.supplementId) ?? [],
  };
}
