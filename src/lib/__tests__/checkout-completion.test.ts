import { describe, it, expect, vi, beforeEach } from "vitest";

const mockMembershipUpdate = vi.fn();
const mockCourseUpdate = vi.fn();
const mockSendOrphanAlert = vi.fn();
const mockMembershipConfirmation = vi.fn();
const mockClubMembershipNotification = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    membership: { update: (...a: unknown[]) => mockMembershipUpdate(...a) },
    courseRegistration: { update: (...a: unknown[]) => mockCourseUpdate(...a) },
  },
}));

vi.mock("@/lib/orphan-payment-alert", () => ({
  sendOrphanPaymentAlert: (...a: unknown[]) => mockSendOrphanAlert(...a),
}));

vi.mock("@/lib/send-email", () => ({
  sendMembershipConfirmationEmail: (...a: unknown[]) =>
    mockMembershipConfirmation(...a),
  sendCourseConfirmationEmail: vi.fn(),
}));

vi.mock("@/lib/send-notification-email", () => ({
  sendClubMembershipNotification: (...a: unknown[]) =>
    mockClubMembershipNotification(...a),
  sendClubCourseNotification: vi.fn(),
}));

function recordNotFound() {
  return Object.assign(new Error("No record was found for an update"), {
    code: "P2025",
  });
}

function session(metadata: Record<string, string>) {
  return {
    id: "cs_test_1",
    metadata,
    payment_intent: "pi_test_1",
    customer_email: "socio@example.com",
    amount_total: 8500,
  } as never;
}

describe("completeCheckout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockMembershipConfirmation.mockResolvedValue(undefined);
    mockClubMembershipNotification.mockResolvedValue(undefined);
  });

  it("settles the event when the membership is found", async () => {
    const { completeCheckout } = await import("../checkout-completion");
    mockMembershipUpdate.mockResolvedValue({});

    const settled = await completeCheckout(session({ membershipId: "ms-1" }));

    expect(settled).toBe(true);
    expect(mockSendOrphanAlert).not.toHaveBeenCalled();
  });

  it("activates the membership and records the payment intent", async () => {
    const { completeCheckout } = await import("../checkout-completion");
    mockMembershipUpdate.mockResolvedValue({});

    await completeCheckout(session({ membershipId: "ms-1" }));

    expect(mockMembershipUpdate).toHaveBeenCalledWith({
      where: { id: "ms-1" },
      data: {
        paymentStatus: "COMPLETED",
        status: "ACTIVE",
        stripePaymentId: "pi_test_1",
      },
    });
  });

  it("settles the event when the orphan alert goes out", async () => {
    const { completeCheckout } = await import("../checkout-completion");
    mockMembershipUpdate.mockRejectedValue(recordNotFound());
    mockSendOrphanAlert.mockResolvedValue(undefined);

    const settled = await completeCheckout(session({ membershipId: "gone" }));

    expect(settled).toBe(true);
    expect(mockSendOrphanAlert).toHaveBeenCalledWith(
      expect.objectContaining({ missingId: "gone" }),
    );
  });

  it("asks for a retry when the orphan alert cannot be sent", async () => {
    const { completeCheckout } = await import("../checkout-completion");
    mockMembershipUpdate.mockRejectedValue(recordNotFound());
    mockSendOrphanAlert.mockRejectedValue(new Error("no recipients"));

    const settled = await completeCheckout(session({ membershipId: "gone" }));

    expect(settled).toBe(false);
  });

  it("rethrows anything that is not a missing record", async () => {
    const { completeCheckout } = await import("../checkout-completion");
    mockMembershipUpdate.mockRejectedValue(new Error("database is down"));

    await expect(
      completeCheckout(session({ membershipId: "ms-1" })),
    ).rejects.toThrow("database is down");
    expect(mockSendOrphanAlert).not.toHaveBeenCalled();
  });

  it("reports an orphaned course registration too", async () => {
    const { completeCheckout } = await import("../checkout-completion");
    mockCourseUpdate.mockRejectedValue(recordNotFound());
    mockSendOrphanAlert.mockResolvedValue(undefined);

    const settled = await completeCheckout(
      session({ courseRegistrationId: "cr-1" }),
    );

    expect(settled).toBe(true);
    expect(mockSendOrphanAlert).toHaveBeenCalledWith(
      expect.objectContaining({ recordKind: "la inscripción al curso" }),
    );
  });

  it("still settles when a confirmation email fails", async () => {
    const { completeCheckout } = await import("../checkout-completion");
    mockMembershipUpdate.mockResolvedValue({});
    mockMembershipConfirmation.mockRejectedValue(new Error("resend down"));

    const settled = await completeCheckout(session({ membershipId: "ms-1" }));

    expect(settled).toBe(true);
  });
});
