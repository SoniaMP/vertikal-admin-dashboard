import { formatDate } from "./membership-helpers";
import { StatusPill } from "./status-pill";
import {
  PAYMENT_LABELS,
  PAYMENT_TONES,
  STATUS_LABELS,
  STATUS_TONES,
} from "./membership-status-badges";

type Props = {
  membership: {
    status: string;
    paymentStatus: string;
    createdAt: Date;
    season: { name: string };
    member: { dni: string };
  };
};

/**
 * The line under the member's name: which season this membership belongs to,
 * when it started, and where it stands. The states used to be two rows inside
 * the payment card, four screens-worth of scrolling below the name they
 * qualify.
 */
export function MembershipDetailMeta({ membership: m }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 pl-[4.5rem] text-sm text-muted-foreground">
      <span>Temporada {m.season.name}</span>
      <span aria-hidden="true">·</span>
      <span>DNI {m.member.dni}</span>
      <span aria-hidden="true">·</span>
      <span>Alta del {formatDate(m.createdAt)}</span>
      <StatusPill tone={PAYMENT_TONES[m.paymentStatus] ?? "neutral"}>
        {PAYMENT_LABELS[m.paymentStatus] ?? m.paymentStatus}
      </StatusPill>
      <StatusPill tone={STATUS_TONES[m.status] ?? "neutral"}>
        {STATUS_LABELS[m.status] ?? m.status}
      </StatusPill>
    </div>
  );
}
