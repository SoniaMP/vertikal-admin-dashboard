import Link from "next/link";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/helpers/price-calculator";
import { cn } from "@/lib/utils";
import { MEMBERSHIP_STATUS } from "@/types";
import { MembershipActions } from "./membership-actions";
import { FederationCell } from "./membership-federation-cell";
import { StatusBadges } from "./membership-status-badges";
import type { MembershipRow } from "./memberships-table";
import { formatDate, licenseLabel } from "./membership-helpers";
import { TruncatedText } from "@/components/ui/truncated-text";

type Props = { membership: MembershipRow };

export function DesktopRow({ membership: m }: Props) {
  const isCancelled = m.status === MEMBERSHIP_STATUS.CANCELLED;
  return (
    <TableRow className={cn("h-12", isCancelled && "opacity-50")}>
      <TableCell className="max-w-[220px]">
        <Link
          href={`/admin/registros/${m.id}`}
          className="font-medium hover:underline"
        >
          <TruncatedText text={`${m.member.firstName} ${m.member.lastName}`} />
        </Link>
        {/* Where the two columns fold away, they come back under the name. */}
        <span className="block truncate text-xs text-muted-foreground lg:hidden">
          {m.member.email} · {m.member.sex}
        </span>
      </TableCell>
      <TableCell className="hidden max-w-[240px] text-muted-foreground lg:table-cell">
        {m.member.email}
      </TableCell>
      <TableCell className="hidden lg:table-cell">{m.member.sex}</TableCell>
      <TableCell>{licenseLabel(m)}</TableCell>
      <TableCell className="text-right tabular-nums">
        {formatPrice(m.totalAmount)}
      </TableCell>
      <TableCell>
        <StatusBadges
          paymentStatus={m.paymentStatus}
          membershipStatus={m.status}
        />
      </TableCell>
      <TableCell>
        <FederationCell membership={m} />
      </TableCell>
      <TableCell className="text-right tabular-nums text-muted-foreground">
        {formatDate(m.createdAt)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end">
          <MembershipActions
            membership={{
              ...m.member,
              id: m.id,
              status: m.status,
              paymentStatus: m.paymentStatus,
            }}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
