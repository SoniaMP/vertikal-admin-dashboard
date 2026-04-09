"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthSession, type ActionResult } from "@/lib/actions";
import { hashPassword } from "@/lib/hash-password";
import { z } from "zod";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es obligatoria"),
    newPassword: z
      .string()
      .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export async function changePassword(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: "No autorizado" };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user) return { success: false, error: "Usuario no encontrado" };

  const currentHash = await hashPassword(parsed.data.currentPassword);
  if (currentHash !== user.passwordHash) {
    return { success: false, error: "La contraseña actual no es correcta" };
  }

  const newHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash },
  });

  revalidatePath("/admin/cuenta");
  return { success: true };
}
