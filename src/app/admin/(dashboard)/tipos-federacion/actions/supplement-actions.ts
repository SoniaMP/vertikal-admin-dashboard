"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { supplementSchema } from "@/validations/license";
import { requireAuth, type ActionResult } from "@/lib/actions";
import { requireEditableSeason } from "@/lib/season-editable";
import { requireEditableCatalogRow } from "@/lib/catalog-editable";
import { newCatalogIdentity } from "@/lib/catalog-identity";
import { replaceTypeLinks } from "@/lib/supplement-type-links";
import { writeSeasonPrice } from "@/lib/season-price-write";
import { readTypeIds } from "@/helpers/form-type-ids";
import { readPriceCents } from "@/helpers/form-price-cents";

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

  const created = await prisma.supplement.create({
    data: { ...newCatalogIdentity(), seasonId, ...parsed.data },
  });
  await replaceTypeLinks({ supplementId: created.id }, readTypeIds(formData));
  const priceError = await writeSeasonPrice(
    { supplementId: created.id },
    readPriceCents(formData),
  );
  if (priceError) return priceError;

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

  const closedError = await requireEditableCatalogRow("supplement", id);
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

  await prisma.supplement.update({ where: { id }, data: parsed.data });
  await replaceTypeLinks({ supplementId: id }, readTypeIds(formData));
  const priceError = await writeSeasonPrice(
    { supplementId: id },
    readPriceCents(formData),
  );
  if (priceError) return priceError;

  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

export async function toggleSupplementActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const closedError = await requireEditableCatalogRow("supplement", id);
  if (closedError) return closedError;

  await prisma.supplement.update({
    where: { id },
    data: { active: isActive },
  });
  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

/**
 * Removes a supplement for good, which only an unsold one allows.
 *
 * `MembershipSupplement` records what a member was charged for, so a
 * supplement somebody bought is history, not catalog: it is retired with the
 * power button instead. The federation links go on their own through the
 * cascade; the season prices do not, so they go first.
 */
export async function deleteSupplement(id: string): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const closedError = await requireEditableCatalogRow("supplement", id);
  if (closedError) return closedError;

  const soldCount = await prisma.membershipSupplement.count({
    where: { supplementId: id },
  });

  if (soldCount > 0) {
    return {
      success: false,
      error: "No se puede eliminar: hay membresías que lo incluyen",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.supplementPrice.deleteMany({ where: { supplementId: id } });
    await tx.supplement.delete({ where: { id } });
  });

  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}
