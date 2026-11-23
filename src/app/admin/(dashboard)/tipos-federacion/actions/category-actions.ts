"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { categorySchema } from "@/validations/license";
import { requireAuth, type ActionResult } from "@/lib/actions";
import { requireEditableSeason } from "@/lib/season-editable";
import { requireEditableCatalogRow } from "@/lib/catalog-editable";
import { newCatalogIdentity } from "@/lib/catalog-identity";

const batchOfferingSchema = z.object({
  seasonId: z.string().min(1),
  typeId: z.string().min(1),
  entries: z.array(
    z.object({
      categoryId: z.string().min(1),
      subtypeId: z.string().min(1),
      price: z.number().int().positive().nullable(),
    }),
  ),
});

export async function createCategory(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const seasonId = String(formData.get("seasonId") ?? "");
  const closedError = await requireEditableSeason(seasonId);
  if (closedError) return closedError;

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  await prisma.category.create({
    data: { ...newCatalogIdentity(), seasonId, ...parsed.data },
  });
  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

export async function updateCategory(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const closedError = await requireEditableCatalogRow("category", id);
  if (closedError) return closedError;

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  await prisma.category.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

export async function toggleCategoryActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const closedError = await requireEditableCatalogRow("category", id);
  if (closedError) return closedError;

  await prisma.category.update({
    where: { id },
    data: { active: isActive },
  });
  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const closedError = await requireEditableCatalogRow("category", id);
  if (closedError) return closedError;

  const membershipCount = await prisma.membership.count({
    where: { categoryId: id },
  });

  if (membershipCount > 0) {
    return {
      success: false,
      error: "No se puede eliminar: tiene membresías asociadas",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.licenseOffering.deleteMany({ where: { categoryId: id } });
    await tx.category.delete({ where: { id } });
  });

  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

export async function batchUpsertOfferings(
  seasonId: string,
  typeId: string,
  entries: { categoryId: string; subtypeId: string; price: number | null }[],
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const closedError = await requireEditableSeason(seasonId);
  if (closedError) return closedError;

  const parsed = batchOfferingSchema.safeParse({ seasonId, typeId, entries });
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  const toUpsert = parsed.data.entries.filter(
    (e): e is (typeof e) & { price: number } => e.price !== null,
  );
  const toDelete = parsed.data.entries.filter((e) => e.price === null);

  await prisma.$transaction([
    ...toUpsert.map(({ categoryId, subtypeId, price }) =>
      prisma.licenseOffering.upsert({
        where: {
          seasonId_typeId_subtypeId_categoryId: {
            seasonId,
            typeId,
            subtypeId,
            categoryId,
          },
        },
        create: { seasonId, typeId, subtypeId, categoryId, price },
        update: { price },
      }),
    ),
    ...toDelete.map(({ categoryId, subtypeId }) =>
      prisma.licenseOffering.deleteMany({
        where: { seasonId, typeId, subtypeId, categoryId },
      }),
    ),
  ]);

  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}
