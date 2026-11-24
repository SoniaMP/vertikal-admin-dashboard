import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { fetchAttentionNotices } from "@/lib/attention-queries";
import type { AttentionNotice } from "@/helpers/attention-notices";

/**
 * Sits above every admin screen so a misconfiguration cannot hide on a page
 * nobody opens. It renders nothing when there is nothing to fix: a strip that
 * is always occupied is one the eye learns to skip.
 *
 * It speaks in the panel's own warning tone, the one the status pills use,
 * and separates itself by that tint alone: a saturated border on top of it
 * made the strip the loudest thing on every screen, above the page's title.
 *
 * Deliberately server-only. Hiding the action link on the screen it points to
 * would need `usePathname`, and a client component in a layout hydrates
 * without the route the server rendered with, which breaks hydration. A link
 * back to the page you are on is the cheaper flaw.
 */
export async function AttentionBanner() {
  const notices = await fetchAttentionNotices();
  if (notices.length === 0) return null;

  return (
    <div className="mb-4 space-y-2">
      {notices.map((notice) => (
        <NoticeRow key={notice.id} notice={notice} />
      ))}
    </div>
  );
}

function NoticeRow({ notice }: { notice: AttentionNotice }) {
  return (
    <div className="flex items-start gap-2 rounded-md bg-[var(--pill-warning-bg)] p-3 text-sm text-[var(--pill-warning-ink)]">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{notice.message}</p>
      <Link
        href={notice.actionHref}
        className="shrink-0 font-medium underline underline-offset-2"
      >
        {notice.actionLabel}
      </Link>
    </div>
  );
}
