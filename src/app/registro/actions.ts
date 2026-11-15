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
