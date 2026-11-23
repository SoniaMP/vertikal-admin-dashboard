"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { licenseTypeSchema } from "@/validations/license";
import { requireAuth, type ActionResult } from "@/lib/actions";
import { requireEditableSeason } from "@/lib/season-editable";
import { requireEditableCatalogRow } from "@/lib/catalog-editable";
import { newCatalogIdentity } from "@/lib/catalog-identity";
import { getActiveSeason } from "@/lib/settings";

export async function createLicenseType(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const seasonId = String(formData.get("seasonId") ?? "");
  const closedError = await requireEditableSeason(seasonId);
  if (closedError) return closedError;

  const parsed = licenseTypeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  await prisma.licenseType.create({
    data: { ...newCatalogIdentity(), seasonId, ...parsed.data },
  });
  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

export async function updateLicenseType(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const closedError = await requireEditableCatalogRow("licenseType", id);
  if (closedError) return closedError;

  const parsed = licenseTypeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  await prisma.licenseType.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

/**
 * Modalities of this type that members could buy right now: they have a price
 * in the active season for a category that is still on offer.
 */
async function findSellableSubtypeIds(typeId: string): Promise<string[]> {
  const season = await getActiveSeason();
  const offerings = await prisma.licenseOffering.findMany({
    where: {
      typeId,
      seasonId: season.id,
      subtype: { active: true },
      category: { active: true },
    },
    select: { subtypeId: true },
  });
  return [...new Set(offerings.map((offering) => offering.subtypeId))];
}

/**
 * Takes a draft federation live. Partial price coverage is fine — gaps are
 * often deliberate — but a type with no price at all would reach the wizard
 * and dead-end every member who picked it.
 */
export async function publishLicenseType(id: string): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const closedError = await requireEditableCatalogRow("licenseType", id);
  if (closedError) return closedError;

  const sellableSubtypeIds = await findSellableSubtypeIds(id);
  if (sellableSubtypeIds.length === 0) {
    return {
      success: false,
      error:
        "No se puede publicar: todavía no tiene ningún precio en la temporada activa",
    };
  }

  const publishedAt = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.licenseType.update({ where: { id }, data: { publishedAt } });
    // A modality left as a draft stays invisible even under a published type,
    // which reads as if publishing did nothing.
    await tx.licenseSubtype.updateMany({
      where: { id: { in: sellableSubtypeIds }, publishedAt: null },
      data: { publishedAt },
    });
  });

  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

export async function toggleLicenseTypeActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const closedError = await requireEditableCatalogRow("licenseType", id);
  if (closedError) return closedError;

  await prisma.licenseType.update({
    where: { id },
    data: { active: isActive },
  });
  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

export async function deleteLicenseType(
  id: string,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const closedError = await requireEditableCatalogRow("licenseType", id);
  if (closedError) return closedError;

  const membershipCount = await prisma.membership.count({
    where: { typeId: id },
  });

  if (membershipCount > 0) {
    return {
      success: false,
      error: "No se puede eliminar: tiene membresías asociadas",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.licenseOffering.deleteMany({ where: { typeId: id } });
    await tx.licenseSubtype.deleteMany({ where: { licenseTypeId: id } });
    await tx.licenseType.delete({ where: { id } });
  });

  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}
