import { MEMBERSHIP_STATUS } from "@/types";
import { StatusPill, type PillTone } from "./status-pill";

export const PAYMENT_LABELS: Record<string, string> = {
  COMPLETED: "Completado",
  PENDING: "Pendiente",
  FAILED: "Fallido",
  REFUNDED: "Reembolsado",
  MANUAL: "Pagado a mano",
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pend. pago",
  ACTIVE: "Activo",
  EXPIRED: "Expirado",
  CANCELLED: "Cancelado",
};

export const PAYMENT_TONES: Record<string, PillTone> = {
  COMPLETED: "positive",
  MANUAL: "neutral",
  PENDING: "warning",
  FAILED: "negative",
  REFUNDED: "neutral",
};

export const STATUS_TONES: Record<string, PillTone> = {
  PENDING_PAYMENT: "warning",
  ACTIVE: "positive",
  EXPIRED: "neutral",
  CANCELLED: "negative",
};

/** The membership state only speaks when it says something the payment does not. */
function isRepeatedByPayment(
  membershipStatus: string,
  paymentStatus: string,
): boolean {
  if (membershipStatus === MEMBERSHIP_STATUS.ACTIVE) return true;
  return (
    membershipStatus === MEMBERSHIP_STATUS.PENDING_PAYMENT &&
    paymentStatus === "PENDING"
  );
}

type Props = {
  paymentStatus: string;
  membershipStatus: string;
};

export function StatusBadges({ paymentStatus, membershipStatus }: Props) {
  const showState = !isRepeatedByPayment(membershipStatus, paymentStatus);

  return (
    <div className="flex items-center gap-1.5">
      <StatusPill tone={PAYMENT_TONES[paymentStatus] ?? "neutral"}>
        {PAYMENT_LABELS[paymentStatus] ?? paymentStatus}
      </StatusPill>
      {showState && (
        <StatusPill tone={STATUS_TONES[membershipStatus] ?? "neutral"}>
          {STATUS_LABELS[membershipStatus] ?? membershipStatus}
        </StatusPill>
      )}
    </div>
  );
}
