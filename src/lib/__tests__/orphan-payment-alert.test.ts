import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetNotificationEmails = vi.fn();
const mockSend = vi.fn();

vi.mock("@/lib/settings", () => ({
  getNotificationEmails: (...a: unknown[]) => mockGetNotificationEmails(...a),
}));

vi.mock("@/lib/resend", () => ({
  getResend: async () => ({ emails: { send: (...a: unknown[]) => mockSend(...a) } }),
}));

vi.mock("@/lib/email-renderer", () => ({
  renderBrandedEmail: async () => "<html></html>",
}));

const SESSION = {
  id: "cs_test_1",
  customer_email: "socio@example.com",
  amount_total: 8500,
} as never;

const ORPHAN = {
  recordKind: "la membresía",
  missingId: "ms-gone",
  session: SESSION,
};

describe("sendOrphanPaymentAlert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.EMAIL_FROM = "club@example.com";
    mockSend.mockResolvedValue({});
  });

  it("sends to the membership recipients whatever the record was", async () => {
    const { sendOrphanPaymentAlert } = await import("../orphan-payment-alert");
    mockGetNotificationEmails.mockResolvedValue(["admin@example.com"]);

    await sendOrphanPaymentAlert({
      ...ORPHAN,
      recordKind: "la inscripción al curso",
    });

    expect(mockGetNotificationEmails).toHaveBeenCalledWith("membership");
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: ["admin@example.com"] }),
    );
  });

  it("throws when no recipient is configured, so the caller can retry", async () => {
    const { sendOrphanPaymentAlert } = await import("../orphan-payment-alert");
    mockGetNotificationEmails.mockResolvedValue([]);

    await expect(sendOrphanPaymentAlert(ORPHAN)).rejects.toThrow(
      /recipients configured/,
    );
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("lets a send failure through instead of swallowing it", async () => {
    const { sendOrphanPaymentAlert } = await import("../orphan-payment-alert");
    mockGetNotificationEmails.mockResolvedValue(["admin@example.com"]);
    mockSend.mockRejectedValue(new Error("resend down"));

    await expect(sendOrphanPaymentAlert(ORPHAN)).rejects.toThrow("resend down");
  });
});
