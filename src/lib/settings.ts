import { prisma } from "@/lib/prisma";
import { resolveTargetSeasonYear } from "@/helpers/target-season-year";

const DEFAULT_MEMBERSHIP_FEE = 2000; // 20.00 EUR in cents

/** Enrolments for next season open this many days before the year turns. */
export const DEFAULT_SEASON_ROLLOVER_DAYS = 15;

/** More than a season of lead time would stop being a rollover window. */
export const MAX_SEASON_ROLLOVER_DAYS = 120;

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
 * How many days before the year turns the next season starts taking people.
 */
export async function getSeasonRolloverDays(): Promise<number> {
  const setting = await prisma.appSetting.findUnique({
    where: { key: "SEASON_ROLLOVER_DAYS" },
  });

  if (!setting) return DEFAULT_SEASON_ROLLOVER_DAYS;

  const parsed = parseInt(setting.value, 10);
  const isUsable =
    Number.isFinite(parsed) && parsed >= 0 && parsed <= MAX_SEASON_ROLLOVER_DAYS;
  return isUsable ? parsed : DEFAULT_SEASON_ROLLOVER_DAYS;
}

/**
 * The season in force right now.
 *
 * It is calculated from the calendar, never marked by hand: there is no
 * active flag to forget to move and no date range to keep aligned. The row
 * exists only so prices and memberships have something to hang from, so it is
 * created the first time a year needs it.
 *
 * This cannot fail for want of configuration. Every year has a season, by
 * definition, whether or not anybody has set its prices yet — whether there
 * is anything to sell is a separate question, asked of the catalog.
 */
export async function getActiveSeason() {
  const year = resolveTargetSeasonYear(
    new Date(),
    await getSeasonRolloverDays(),
  );

  const existing = await prisma.season.findUnique({ where: { year } });
  if (existing) return existing;

  try {
    return await prisma.season.create({ data: { year } });
  } catch {
    // Another request got there first; the year is unique, so there is now
    // exactly one row and it is the one we wanted.
    return prisma.season.findUniqueOrThrow({ where: { year } });
  }
}
