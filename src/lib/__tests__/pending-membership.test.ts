import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: { membership: { findUnique: (...a: unknown[]) => mockFindUnique(...a) } },
}));

const { fetchPendingMembership } = await import("../pending-membership");

const PENDING = {
  status: "PENDING_PAYMENT",
  paymentStatus: "PENDING",
  totalAmount: 3500,
  season: { name: "2026" },
};

beforeEach(() => vi.clearAllMocks());

describe("fetchPendingMembership", () => {
  it("returns the amount and season for a membership still awaiting payment", async () => {
    mockFindUnique.mockResolvedValue(PENDING);
    await expect(fetchPendingMembership("m1")).resolves.toEqual({
      totalAmount: 3500,
      seasonName: "2026",
    });
  });

  // The id travels in a URL, so this must never become a way to read a member.
  it("returns no personal data whatsoever", async () => {
    mockFindUnique.mockResolvedValue(PENDING);
    const result = await fetchPendingMembership("m1");
    expect(Object.keys(result!).sort()).toEqual(["seasonName", "totalAmount"]);
  });

  it("asks the database for no personal field either", async () => {
    mockFindUnique.mockResolvedValue(PENDING);
    await fetchPendingMembership("m1");
    const selected = Object.keys(mockFindUnique.mock.calls[0][0].select);
    expect(selected).not.toContain("member");
  });

  it("returns nothing once the membership is active", async () => {
    mockFindUnique.mockResolvedValue({ ...PENDING, status: "ACTIVE" });
    await expect(fetchPendingMembership("m1")).resolves.toBeNull();
  });

  it("returns nothing once the payment completed", async () => {
    mockFindUnique.mockResolvedValue({
      ...PENDING,
      paymentStatus: "COMPLETED",
    });
    await expect(fetchPendingMembership("m1")).resolves.toBeNull();
  });

  it("returns nothing for an id that does not exist", async () => {
    mockFindUnique.mockResolvedValue(null);
    await expect(fetchPendingMembership("nope")).resolves.toBeNull();
  });
});
