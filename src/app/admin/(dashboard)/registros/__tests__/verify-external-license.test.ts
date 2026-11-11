import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUpdate = vi.fn();
const mockAuth = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    membership: { update: (...args: unknown[]) => mockUpdate(...args) },
  },
}));

vi.mock("@/lib/auth", () => ({ auth: () => mockAuth() }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

function updatedData() {
  return mockUpdate.mock.calls[0][0].data;
}

describe("verifyExternalLicense", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "admin" } });
    mockUpdate.mockResolvedValue({ id: "membership-1" });
  });

  it("stamps the moment the admin checked the PDF", async () => {
    const { verifyExternalLicense } = await import("../membership-actions");

    const before = new Date();
    const result = await verifyExternalLicense("membership-1", true);

    expect(result.success).toBe(true);
    const { externalLicenseVerifiedAt } = updatedData();
    expect(externalLicenseVerifiedAt).toBeInstanceOf(Date);
    expect(externalLicenseVerifiedAt.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
  });

  it("clears the stamp when the admin takes the verification back", async () => {
    const { verifyExternalLicense } = await import("../membership-actions");

    await verifyExternalLicense("membership-1", false);

    expect(updatedData().externalLicenseVerifiedAt).toBeNull();
  });

  it("touches nothing else on the membership", async () => {
    const { verifyExternalLicense } = await import("../membership-actions");

    await verifyExternalLicense("membership-1", true);

    expect(Object.keys(updatedData())).toEqual(["externalLicenseVerifiedAt"]);
  });

  it("refuses an unauthenticated caller", async () => {
    mockAuth.mockResolvedValue(null);
    const { verifyExternalLicense } = await import("../membership-actions");

    const result = await verifyExternalLicense("membership-1", true);

    expect(result).toEqual({ success: false, error: "No autorizado" });
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
