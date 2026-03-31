"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth, type ActionResult } from "@/lib/actions";
import { personalDataSchema } from "@/validations/registration";
import type { MembershipStatus } from "@/types";

const paymentStatusSchema = z.enum([
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);

const updateMembershipSchema = personalDataSchema.extend({
  paymentStatus: paymentStatusSchema,
});

export async function updateMembership(
  membershipId: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = updateMembershipSchema.safeParse({
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
    paymentStatus: formData.get("paymentStatus"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  const { paymentStatus, ...personalData } = parsed.data;
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    select: { memberId: true },
  });

  if (!membership) {
    return { success: false, error: "Membresía no encontrada" };
  }

  try {
    await prisma.$transaction([
      prisma.member.update({
        where: { id: membership.memberId },
        data: personalData,
      }),
      prisma.membership.update({
        where: { id: membershipId },
        data: { paymentStatus },
      }),
    ]);
  } catch {
    return { success: false, error: "Error al actualizar la membresía" };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function updateMembershipStatus(
  id: string,
  status: MembershipStatus,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  await prisma.membership.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
  return { success: true };
}

export async function toggleMembershipFederated(
  id: string,
  isFederated: boolean,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  await prisma.membership.update({ where: { id }, data: { isFederated } });
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteMembership(id: string): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const membership = await prisma.membership.findUnique({
    where: { id },
    select: { memberId: true },
  });

  if (!membership) {
    return { success: false, error: "Membresía no encontrada" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.membershipSupplement.deleteMany({
        where: { membershipId: id },
      });
      await tx.membership.delete({ where: { id } });

      const remaining = await tx.membership.count({
        where: { memberId: membership.memberId },
      });
      if (remaining === 0) {
        await tx.member.delete({ where: { id: membership.memberId } });
      }
    });
  } catch {
    return { success: false, error: "Error al eliminar la membresía" };
  }

  revalidatePath("/admin");
  return { success: true };
}
