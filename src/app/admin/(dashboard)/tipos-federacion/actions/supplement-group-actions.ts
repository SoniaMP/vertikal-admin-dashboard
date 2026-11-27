"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { supplementGroupSchema } from "@/validations/license";
import { requireAuth, type ActionResult } from "@/lib/actions";
import { requireEditableSeason } from "@/lib/season-editable";
import { requireEditableCatalogRow } from "@/lib/catalog-editable";
import { newCatalogIdentity } from "@/lib/catalog-identity";
import { replaceTypeLinks } from "@/lib/supplement-type-links";
import { writeSeasonPrice } from "@/lib/season-price-write";
import { readTypeIds } from "@/helpers/form-type-ids";
import { readPriceCents } from "@/helpers/form-price-cents";

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

  const created = await prisma.supplementGroup.create({
    data: { ...newCatalogIdentity(), seasonId, ...parsed.data },
  });
  await replaceTypeLinks({ groupId: created.id }, readTypeIds(formData));
  const priceError = await writeSeasonPrice(
    { groupId: created.id },
    readPriceCents(formData),
  );
  if (priceError) return priceError;

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

  const closedError = await requireEditableCatalogRow("supplementGroup", id);
  if (closedError) return closedError;

  const parsed = supplementGroupSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  await prisma.supplementGroup.update({ where: { id }, data: parsed.data });
  await replaceTypeLinks({ groupId: id }, readTypeIds(formData));
  const priceError = await writeSeasonPrice(
    { groupId: id },
    readPriceCents(formData),
  );
  if (priceError) return priceError;

  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

/**
 * Retires a group, or brings it back.
 *
 * A retired group takes its members off sale with it, which is the whole
 * point: they are sold through it, so there is nothing left to sell them at.
 * The members keep their own state, so bringing the group back brings back
 * exactly the ones that were live before.
 */
export async function toggleSupplementGroupActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const closedError = await requireEditableCatalogRow("supplementGroup", id);
  if (closedError) return closedError;

  await prisma.supplementGroup.update({
    where: { id },
    data: { active: isActive },
  });
  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

export async function deleteSupplementGroup(id: string): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const closedError = await requireEditableCatalogRow("supplementGroup", id);
  if (closedError) return closedError;

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
