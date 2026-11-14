import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { fetchAttentionNotices } from "@/lib/attention-queries";
import type { AttentionNotice } from "@/helpers/attention-notices";

/**
 * Sits above every admin screen so a misconfiguration cannot hide on a page
 * nobody opens. It renders nothing when there is nothing to fix: a strip that
 * is always occupied is one the eye learns to skip.
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
    <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
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
