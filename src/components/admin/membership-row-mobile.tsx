import Link from "next/link";
import { formatPrice } from "@/helpers/price-calculator";
import { cn } from "@/lib/utils";
import { MEMBERSHIP_STATUS } from "@/types";
import { MembershipActions } from "./membership-actions";
import { FederationCell } from "./membership-federation-cell";
import { StatusBadges } from "./membership-status-badges";
import type { MembershipRow } from "./memberships-table";
import { formatDate, licenseLabel } from "./membership-helpers";

type Props = { membership: MembershipRow };

export function MobileCard({ membership: m }: Props) {
  const isCancelled = m.status === MEMBERSHIP_STATUS.CANCELLED;
  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-colors",
        isCancelled && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/admin/registros/${m.id}`}
          className="min-w-0 hover:underline"
        >
          <p className="font-medium truncate">
            {m.member.firstName} {m.member.lastName}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {m.member.email}
          </p>
        </Link>
        <div className="flex items-center gap-1.5">
          <StatusBadges
            paymentStatus={m.paymentStatus}
            membershipStatus={m.status}
          />
          <FederationCell membership={m} />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
        <span>{licenseLabel(m)}</span>
        <span>{m.member.sex}</span>
        <span>{formatPrice(m.totalAmount)}</span>
        <span className="ml-auto">{formatDate(m.createdAt)}</span>
      </div>
      <div className="mt-2 flex justify-end border-t pt-2">
        <MembershipActions
          membership={{
            ...m.member,
            id: m.id,
            status: m.status,
            paymentStatus: m.paymentStatus,
          }}
        />
      </div>
    </div>
  );
}
