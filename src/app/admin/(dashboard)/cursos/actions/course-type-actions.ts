"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { courseTypeSchema } from "@/validations/course";
import { requireAuth, type ActionResult } from "@/lib/actions";

// `ActionResult` is shared by every action in the project, so the created
// record travels in a type of its own instead of widening it.
export type CreateCourseTypeResult = ActionResult & {
  createdCourseType?: { id: string; name: string };
};

export async function createCourseType(
  _prevState: ActionResult,
  formData: FormData,
): Promise<CreateCourseTypeResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = courseTypeSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  const createdCourseType = await prisma.courseType.create({
    data: parsed.data,
    select: { id: true, name: true },
  });
  revalidatePath("/admin/cursos");
  return { success: true, createdCourseType };
}

export async function updateCourseType(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = courseTypeSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  await prisma.courseType.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/cursos");
  return { success: true };
}

export async function toggleCourseTypeActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  await prisma.courseType.update({
    where: { id },
    data: { active: isActive },
  });
  revalidatePath("/admin/cursos");
  return { success: true };
}
