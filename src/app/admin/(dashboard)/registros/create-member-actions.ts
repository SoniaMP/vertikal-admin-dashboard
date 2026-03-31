"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth, type ActionResult } from "@/lib/actions";
import { personalDataSchema } from "@/validations/registration";
import { getActiveSeason } from "@/lib/settings";

const requiredSelect = (msg: string) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v : ""),
    z.string().min(1, msg),
  );

const createMemberSchema = personalDataSchema.extend({
  typeId: requiredSelect("Selecciona un tipo de licencia"),
  subtypeId: requiredSelect("Selecciona un subtipo"),
  categoryId: requiredSelect("Selecciona una categoría"),
  totalAmount: z.preprocess(
    (v) => {
      const euros = typeof v === "string" && v !== "" ? Number(v) : 0;
      return Math.round(euros * 100);
    },
    z.number().int().min(0, "El precio no puede ser negativo"),
  ),
});

export async function createMemberWithMembership(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = createMemberSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    dni: formData.get("dni"),
    dateOfBirth: formData.get("dateOfBirth"),
    address: formData.get("address"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
    province: formData.get("province"),
    typeId: formData.get("typeId"),
    subtypeId: formData.get("subtypeId"),
    categoryId: formData.get("categoryId"),
    totalAmount: formData.get("totalAmount"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  const { typeId, subtypeId, categoryId, totalAmount, ...personalData } =
    parsed.data;
  const season = await getActiveSeason();

  const offering = await prisma.licenseOffering.findFirst({
    where: { seasonId: season.id, typeId, subtypeId, categoryId },
    select: { id: true },
  });

  try {
    await prisma.$transaction(async (tx) => {
      const member = await tx.member.upsert({
        where: { dni: personalData.dni },
        create: personalData,
        update: personalData,
      });
      await tx.membership.create({
        data: {
          memberId: member.id,
          seasonId: season.id,
          typeId,
          subtypeId,
          categoryId,
          offeringId: offering?.id ?? null,
          totalAmount,
          paymentStatus: "PENDING",
          status: "PENDING_PAYMENT",
        },
      });
    });
  } catch {
    return { success: false, error: "Error al crear la membresía" };
  }

  revalidatePath("/admin");
  return { success: true };
}

export type DniSearchResult = {
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
} | null;

export async function searchByDni(dni: string): Promise<DniSearchResult> {
  const authError = await requireAuth();
  if (authError) return null;

  const member = await prisma.member.findFirst({
    where: {
      OR: [{ dni: dni.toUpperCase() }, { dni: dni.toLowerCase() }],
    },
    include: {
      memberships: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          typeId: true,
          subtypeId: true,
          categoryId: true,
        },
      },
    },
  });

  if (!member) return null;

  const lastMembership = member.memberships[0];
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
    typeId: lastMembership?.typeId ?? "",
    subtypeId: lastMembership?.subtypeId ?? "",
    categoryId: lastMembership?.categoryId ?? "",
  };
}
