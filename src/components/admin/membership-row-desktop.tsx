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

type Props = { membership: MembershipRow };

export function DesktopRow({ membership: m }: Props) {
  const isCancelled = m.status === MEMBERSHIP_STATUS.CANCELLED;
  return (
    <TableRow className={cn(isCancelled && "opacity-50")}>
      <TableCell>
        <Link
          href={`/admin/registros/${m.id}`}
          className="font-medium hover:underline"
        >
          {m.member.firstName} {m.member.lastName}
        </Link>
      </TableCell>
      <TableCell className="text-muted-foreground">{m.member.email}</TableCell>
      <TableCell>{m.member.sex}</TableCell>
      <TableCell>{licenseLabel(m)}</TableCell>
      <TableCell>{formatPrice(m.totalAmount)}</TableCell>
      <TableCell>
        <StatusBadges
          paymentStatus={m.paymentStatus}
          membershipStatus={m.status}
        />
      </TableCell>
      <TableCell>
        <FederationCell membership={m} />
      </TableCell>
      <TableCell className="text-muted-foreground">
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
