"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  supplementSchema,
  supplementGroupSchema,
  supplementPriceSchema,
  supplementGroupPriceSchema,
} from "@/validations/license";
import { requireAuth, type ActionResult } from "@/lib/actions";
import { requireEditableSeason } from "@/lib/season-editable";
import { newCatalogIdentity } from "@/lib/catalog-identity";

// --- Supplement actions ---

export async function createSupplement(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const seasonId = String(formData.get("seasonId") ?? "");
  const closedError = await requireEditableSeason(seasonId);
  if (closedError) return closedError;

  const groupId = (formData.get("supplementGroupId") as string) || null;

  const parsed = supplementSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    supplementGroupId: groupId,
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  await prisma.supplement.create({
    data: { ...newCatalogIdentity(), seasonId, ...parsed.data },
  });
  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

export async function updateSupplement(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const groupId = (formData.get("supplementGroupId") as string) || null;

  const parsed = supplementSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    supplementGroupId: groupId,
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  await prisma.supplement.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

export async function toggleSupplementActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  await prisma.supplement.update({
    where: { id },
    data: { active: isActive },
  });
  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

export async function upsertSupplementPrice(
  supplementId: string,
  seasonId: string,
  price: number,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const closedError = await requireEditableSeason(seasonId);
  if (closedError) return closedError;

  const parsed = supplementPriceSchema.safeParse({
    seasonId,
    supplementId,
    price,
  });
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  await prisma.supplementPrice.upsert({
    where: { seasonId_supplementId: { seasonId, supplementId } },
    create: { seasonId, supplementId, price },
    update: { price },
  });
  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

// --- Supplement Group actions ---

export async function createSupplementGroup(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const seasonId = String(formData.get("seasonId") ?? "");
  const closedError = await requireEditableSeason(seasonId);
  if (closedError) return closedError;

  const parsed = supplementGroupSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  await prisma.supplementGroup.create({
    data: { ...newCatalogIdentity(), seasonId, ...parsed.data },
  });
  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

export async function updateSupplementGroup(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = supplementGroupSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  await prisma.supplementGroup.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

export async function deleteSupplementGroup(
  id: string,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  await prisma.$transaction(async (tx) => {
    await tx.supplement.updateMany({
      where: { supplementGroupId: id },
      data: { supplementGroupId: null },
    });
    await tx.supplementGroupPrice.deleteMany({ where: { groupId: id } });
    await tx.supplementGroup.delete({ where: { id } });
  });
  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

export async function upsertSupplementGroupPrice(
  groupId: string,
  seasonId: string,
  price: number,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const closedError = await requireEditableSeason(seasonId);
  if (closedError) return closedError;

  const parsed = supplementGroupPriceSchema.safeParse({
    seasonId,
    groupId,
    price,
  });
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  await prisma.supplementGroupPrice.upsert({
    where: { seasonId_groupId: { seasonId, groupId } },
    create: { seasonId, groupId, price },
    update: { price },
  });
  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}
