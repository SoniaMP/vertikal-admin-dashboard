import Link from "next/link";
import { TableRow } from "@/components/ui/table";
import { DataCell } from "./data-cell";
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
      <DataCell className="max-w-[220px]">
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
      </DataCell>
      <DataCell className="hidden max-w-[240px] text-muted-foreground lg:table-cell">
        {m.member.email}
      </DataCell>
      <DataCell className="hidden lg:table-cell">{m.member.sex}</DataCell>
      <DataCell>{licenseLabel(m)}</DataCell>
      <DataCell kind="number">{formatPrice(m.totalAmount)}</DataCell>
      <DataCell kind="status">
        <StatusBadges
          paymentStatus={m.paymentStatus}
          membershipStatus={m.status}
        />
      </DataCell>
      <DataCell>
        <FederationCell membership={m} />
      </DataCell>
      <DataCell kind="date" className="text-muted-foreground">
        {formatDate(m.createdAt)}
      </DataCell>
      <DataCell kind="actions">
        <MembershipActions
          membership={{
            ...m.member,
            id: m.id,
            status: m.status,
            paymentStatus: m.paymentStatus,
          }}
        />
      </DataCell>
    </TableRow>
  );
}
