import type { MembershipStatus } from "@/types";

type RegistrationForStatus = {
  active: boolean;
  paymentStatus: string;
};

/**
 * Map a Registration's active + paymentStatus fields to a MembershipStatus.
 */
export function inferMembershipStatus(
  reg: RegistrationForStatus,
): MembershipStatus {
  if (!reg.active) return "CANCELLED";
  if (reg.paymentStatus === "COMPLETED") return "ACTIVE";
  if (reg.paymentStatus === "REFUNDED") return "CANCELLED";
  if (reg.paymentStatus === "FAILED") return "CANCELLED";
  return "PENDING_PAYMENT";
}
