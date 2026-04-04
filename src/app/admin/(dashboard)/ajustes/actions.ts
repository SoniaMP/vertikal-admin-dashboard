"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth, type ActionResult } from "@/lib/actions";
import { isValidHexColor } from "@/lib/email-branding";
import { NOTIFICATION_KEYS } from "@/lib/settings";
import { z } from "zod";

export async function updateMembershipFee(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const rawValue = formData.get("membershipFee");
  const euros = parseFloat(String(rawValue));

  if (!Number.isFinite(euros) || euros < 0) {
    return { success: false, error: "El importe debe ser un número positivo" };
  }

  const cents = Math.round(euros * 100);

  await prisma.appSetting.upsert({
    where: { key: "MEMBERSHIP_FEE" },
    update: { value: String(cents) },
    create: { key: "MEMBERSHIP_FEE", value: String(cents) },
  });

  revalidatePath("/admin/ajustes");
  revalidatePath("/registro");
  return { success: true };
}

export async function updateEmailBranding(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const logoUrl = formData.get("logoUrl") as string | null;
  const primaryColor = String(formData.get("primaryColor") || "");
  const secondaryColor = String(formData.get("secondaryColor") || "");
  const backgroundColor = String(formData.get("backgroundColor") || "");

  for (const color of [primaryColor, secondaryColor, backgroundColor]) {
    if (!isValidHexColor(color)) {
      return { success: false, error: `Color inválido: ${color}` };
    }
  }

  const entries: [string, string][] = [
    ["EMAIL_PRIMARY_COLOR", primaryColor],
    ["EMAIL_SECONDARY_COLOR", secondaryColor],
    ["EMAIL_BG_COLOR", backgroundColor],
  ];

  if (logoUrl) {
    entries.push(["EMAIL_LOGO_URL", logoUrl]);
  }

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.appSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    ),
  );

  revalidatePath("/admin/ajustes");
  revalidatePath("/api/email-preview", "layout");
  return { success: true };
}

const emailArraySchema = z.array(z.string().email("Email inválido"));

export async function updateNotificationEmails(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const type = formData.get("type") as string;
  if (type !== "membership" && type !== "course") {
    return { success: false, error: "Tipo de notificación inválido" };
  }

  const raw = formData.get("emails") as string;
  let emails: unknown;
  try {
    emails = JSON.parse(raw || "[]");
  } catch {
    return { success: false, error: "Formato de emails inválido" };
  }

  const result = emailArraySchema.safeParse(emails);
  if (!result.success) {
    const first = result.error.issues[0]?.message ?? "Email inválido";
    return { success: false, error: first };
  }

  const unique = [...new Set(result.data)];
  const key = NOTIFICATION_KEYS[type];

  await prisma.appSetting.upsert({
    where: { key },
    update: { value: JSON.stringify(unique) },
    create: { key, value: JSON.stringify(unique) },
  });

  revalidatePath("/admin/ajustes");
  return { success: true };
}
