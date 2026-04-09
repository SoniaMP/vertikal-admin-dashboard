"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth, type ActionResult } from "@/lib/actions";
import { hashPassword } from "@/lib/hash-password";
import { createUserSchema, updateUserSchema } from "@/validations/user";
import { auth } from "@/lib/auth";

export async function createUser(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    roleName: formData.get("roleName"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  const { name, email, password, roleName } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { success: false, error: "Ya existe un usuario con ese email" };
  }

  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    return { success: false, error: "Rol no encontrado" };
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      roles: { create: { roleId: role.id } },
    },
  });

  revalidatePath("/admin/usuarios");
  return { success: true };
}

export async function updateUser(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = updateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    roleName: formData.get("roleName"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  const { name, email, password, roleName } = parsed.data;

  const duplicate = await prisma.user.findFirst({
    where: { email, id: { not: id } },
  });
  if (duplicate) {
    return { success: false, error: "Ya existe un usuario con ese email" };
  }

  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    return { success: false, error: "Rol no encontrado" };
  }

  await prisma.$transaction(async (tx) => {
    const data: { name: string; email: string; passwordHash?: string } = {
      name,
      email,
    };

    if (password) {
      data.passwordHash = await hashPassword(password);
    }

    await tx.user.update({ where: { id }, data });

    await tx.userRole.deleteMany({ where: { userId: id } });
    await tx.userRole.create({ data: { userId: id, roleId: role.id } });
  });

  revalidatePath("/admin/usuarios");
  return { success: true };
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const session = await auth();
  if (session?.user?.id === id) {
    return { success: false, error: "No puedes eliminar tu propio usuario" };
  }

  await prisma.user.delete({ where: { id } });

  revalidatePath("/admin/usuarios");
  return { success: true };
}
