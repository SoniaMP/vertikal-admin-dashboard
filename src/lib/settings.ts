import { prisma } from "@/lib/prisma";

const DEFAULT_MEMBERSHIP_FEE = 2000; // 20.00 EUR in cents

export async function getMembershipFee(): Promise<number> {
  const setting = await prisma.appSetting.findUnique({
    where: { key: "MEMBERSHIP_FEE" },
  });

  if (!setting) return DEFAULT_MEMBERSHIP_FEE;

  const parsed = parseInt(setting.value, 10);
  return Number.isFinite(parsed) && parsed >= 0
    ? parsed
    : DEFAULT_MEMBERSHIP_FEE;
}

type NotificationType = "membership" | "course";

export const NOTIFICATION_KEYS: Record<NotificationType, string> = {
  membership: "MEMBERSHIP_NOTIFICATION_EMAILS",
  course: "COURSE_NOTIFICATION_EMAILS",
};

/**
 * Read the list of notification recipient emails for a given type.
 * Returns [] on missing key or invalid JSON.
 */
export async function getNotificationEmails(
  type: NotificationType,
): Promise<string[]> {
  const setting = await prisma.appSetting.findUnique({
    where: { key: NOTIFICATION_KEYS[type] },
  });

  if (!setting) return [];

  try {
    const parsed: unknown = JSON.parse(setting.value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

/**
 * Get the currently active season, or throw if none exists.
 */
export async function getActiveSeason() {
  const season = await prisma.season.findFirst({
    where: { isActive: true },
  });

  if (!season) {
    throw new Error("No active season configured");
  }

  return season;
}
