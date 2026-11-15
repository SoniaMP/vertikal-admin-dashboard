import { describe, it, expect, vi, beforeEach } from "vitest";

const mockMemberFindUnique = vi.fn();
const mockRecordSend = vi.fn();
const mockIssueCode = vi.fn();
const mockSendEmail = vi.fn();
const mockVerifyCode = vi.fn();
const mockFetchPrefill = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    member: { findUnique: (...a: unknown[]) => mockMemberFindUnique(...a) },
  },
}));
vi.mock("@/lib/renewal-send-limit", () => ({
  recordRenewalSend: (...a: unknown[]) => mockRecordSend(...a),
}));
vi.mock("@/lib/renewal-code-issue", () => ({
  issueRenewalCode: (...a: unknown[]) => mockIssueCode(...a),
}));
vi.mock("@/lib/send-renewal-code-email", () => ({
  sendRenewalCodeEmail: (...a: unknown[]) => mockSendEmail(...a),
}));
vi.mock("@/lib/renewal-code-verify", () => ({
  verifyRenewalCode: (...a: unknown[]) => mockVerifyCode(...a),
}));
vi.mock("@/lib/renewal-prefill", () => ({
  fetchRenewalPrefill: (...a: unknown[]) => mockFetchPrefill(...a),
}));

const { requestRenewalCode, redeemRenewalCode } = await import(
  "../renewal-actions"
);

const DNI = "12345678Z";
const CODE = "483912";

beforeEach(() => {
  vi.clearAllMocks();
  mockRecordSend.mockReturnValue(true);
  mockIssueCode.mockResolvedValue(CODE);
  mockSendEmail.mockResolvedValue(undefined);
});

describe("requestRenewalCode", () => {
  it("answers the same for a member and for a stranger", async () => {
    mockMemberFindUnique.mockResolvedValue({
      firstName: "María",
      email: "maria@example.com",
    });
    const forMember = await requestRenewalCode(DNI);

    mockMemberFindUnique.mockResolvedValue(null);
    const forStranger = await requestRenewalCode("87654321X");

    expect(forMember).toEqual({ status: "sent" });
    expect(forStranger).toEqual(forMember);
  });

  it("issues and sends nothing when the DNI is unknown", async () => {
    mockMemberFindUnique.mockResolvedValue(null);
    await requestRenewalCode(DNI);
    expect(mockIssueCode).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("sends the code to the address already on file", async () => {
    mockMemberFindUnique.mockResolvedValue({
      firstName: "María",
      email: "maria@example.com",
    });
    await requestRenewalCode(DNI);
    expect(mockSendEmail).toHaveBeenCalledWith({
      to: "maria@example.com",
      firstName: "María",
      code: CODE,
    });
  });

  it("still answers 'sent' when the email fails, so the failure leaks nothing", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    mockMemberFindUnique.mockResolvedValue({
      firstName: "María",
      email: "maria@example.com",
    });
    mockSendEmail.mockRejectedValue(new Error("Resend down"));

    await expect(requestRenewalCode(DNI)).resolves.toEqual({
      status: "sent",
    });
    expect(logged).toHaveBeenCalled();
    logged.mockRestore();
  });

  it("still answers 'sent' when issuing the code fails, so the failure leaks nothing", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    mockMemberFindUnique.mockResolvedValue({
      firstName: "María",
      email: "maria@example.com",
    });
    mockIssueCode.mockRejectedValue(new Error("table does not exist"));

    await expect(requestRenewalCode(DNI)).resolves.toEqual({
      status: "sent",
    });
    expect(mockSendEmail).not.toHaveBeenCalled();
    expect(logged).toHaveBeenCalled();
    logged.mockRestore();
  });

  it("applies the send limit before looking anyone up", async () => {
    mockRecordSend.mockReturnValue(false);
    await expect(requestRenewalCode(DNI)).resolves.toEqual({
      status: "rate_limited",
    });
    expect(mockMemberFindUnique).not.toHaveBeenCalled();
  });

  it("rejects a document too short to be real, without touching the database", async () => {
    await expect(requestRenewalCode("ab")).resolves.toEqual({
      status: "invalid_dni",
    });
    expect(mockRecordSend).not.toHaveBeenCalled();
    expect(mockMemberFindUnique).not.toHaveBeenCalled();
  });
});

describe("redeemRenewalCode", () => {
  it("returns the member's data for a valid code", async () => {
    const prefill = { member: { firstName: "María" }, previousLicense: null };
    mockVerifyCode.mockResolvedValue(true);
    mockFetchPrefill.mockResolvedValue(prefill);

    await expect(redeemRenewalCode(DNI, CODE)).resolves.toEqual({
      status: "ok",
      prefill,
    });
  });

  it("returns nothing and reads nothing when the code is wrong", async () => {
    mockVerifyCode.mockResolvedValue(false);
    await expect(redeemRenewalCode(DNI, CODE)).resolves.toEqual({
      status: "invalid",
    });
    expect(mockFetchPrefill).not.toHaveBeenCalled();
  });

  it("rejects a malformed code without spending a verification", async () => {
    await expect(redeemRenewalCode(DNI, "12")).resolves.toEqual({
      status: "invalid",
    });
    expect(mockVerifyCode).not.toHaveBeenCalled();
  });
});
