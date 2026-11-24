import { prisma } from "@/lib/prisma";
import {
  getActiveSeason,
  getNotificationEmails,
  getSeasonRolloverDays,
} from "@/lib/settings";
import {
  buildAttentionNotices,
  type AttentionNotice,
} from "@/helpers/attention-notices";
import { buildSeasonPricesNotice } from "@/helpers/season-prices-notice";
import { resolveSeasonOpensOn } from "@/helpers/season-opens-on";
import { countSellableOfferings } from "@/lib/sellable-offerings";

/**
 * Reads the state the admin banner warns about. Everything here is derivable
 * on each render, so a notice goes away by itself as soon as it is fixed.
 */
export async function fetchAttentionNotices(): Promise<AttentionNotice[]> {
  const [membershipRecipients, courseRecipients, courseCount, seasonNotice] =
    await Promise.all([
      getNotificationEmails("membership"),
      getNotificationEmails("course"),
      prisma.courseCatalog.count({ where: { deletedAt: null } }),
      fetchSeasonPricesNotice(),
    ]);

  const notices = buildAttentionNotices({
    membershipRecipients,
    courseRecipients,
    courseCount,
  });

  // The season goes first: a club that cannot sell its own licences outranks
  // a missing notification address.
  return seasonNotice ? [seasonNotice, ...notices] : notices;
}

/**
 * Whether the season in force, or the one after it, can actually sell
 * anything. A season with no offering is a closed club.
 */
async function fetchSeasonPricesNotice(): Promise<AttentionNotice | null> {
  const today = new Date();
  const [active, rolloverDays] = await Promise.all([
    getActiveSeason(),
    getSeasonRolloverDays(),
  ]);
  const upcomingYear = active.year + 1;
  const opensOn = resolveSeasonOpensOn(upcomingYear, rolloverDays);

  const upcoming = await prisma.season.findUnique({
    where: { year: upcomingYear },
    select: { id: true },
  });

  const [activeSellable, upcomingSellable] = await Promise.all([
    countSellableOfferings(active.id),
    countSellableOfferings(upcoming?.id ?? ""),
  ]);

  return buildSeasonPricesNotice({
    today,
    activeYear: active.year,
    activeHasPrices: activeSellable > 0,
    upcomingYear,
    upcomingHasPrices: upcomingSellable > 0,
    upcomingOpensOn: opensOn,
  });
}
