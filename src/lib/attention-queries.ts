import { prisma } from "@/lib/prisma";
import { getNotificationEmails } from "@/lib/settings";
import {
  buildAttentionNotices,
  type AttentionNotice,
} from "@/helpers/attention-notices";

/**
 * Reads the state the admin banner warns about. Everything here is derivable
 * on each render, so a notice goes away by itself as soon as it is fixed.
 */
export async function fetchAttentionNotices(): Promise<AttentionNotice[]> {
  const [membershipRecipients, courseRecipients, courseCount] =
    await Promise.all([
      getNotificationEmails("membership"),
      getNotificationEmails("course"),
      prisma.courseCatalog.count({ where: { deletedAt: null } }),
    ]);

  return buildAttentionNotices({
    membershipRecipients,
    courseRecipients,
    courseCount,
  });
}
