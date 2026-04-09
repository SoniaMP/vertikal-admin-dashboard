"use server";

import { auth } from "@/lib/auth";

export type ActionResult = { success: boolean; error?: string };

export async function requireAuth(): Promise<ActionResult | null> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autorizado" };
  }
  return null;
}

export async function getAuthSession() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}

export async function requireAdmin(): Promise<ActionResult | null> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autorizado" };
  }
  if (session.user.role !== "ADMIN") {
    return { success: false, error: "Se requiere rol de administrador" };
  }
  return null;
}
