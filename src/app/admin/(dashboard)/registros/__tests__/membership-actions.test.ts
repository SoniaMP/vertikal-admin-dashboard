import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();
const mockDelete = vi.fn();
const mockDeleteMany = vi.fn();
const mockCount = vi.fn();
const mockMemberDelete = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    membership: { findUnique: (...a: unknown[]) => mockFindUnique(...a) },
    $transaction: (fn: (tx: unknown) => Promise<void>) => mockTransaction(fn),
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "admin" } }),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

function buildTx() {
  return {
    membershipSupplement: { deleteMany: mockDeleteMany },
    membership: { delete: mockDelete, count: mockCount },
    member: { delete: mockMemberDelete },
  };
}

describe("deleteMembership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockImplementation(
      async (fn: (tx: unknown) => Promise<void>) => fn(buildTx()),
    );
  });

  it("deletes membership and member when no remaining memberships", async () => {
    const { deleteMembership } = await import("../membership-actions");
    mockFindUnique.mockResolvedValue({ memberId: "m-1" });
    mockCount.mockResolvedValue(0);

    const result = await deleteMembership("ms-1");

    expect(result).toEqual({ success: true });
    expect(mockDeleteMany).toHaveBeenCalledWith({ where: { membershipId: "ms-1" } });
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "ms-1" } });
    expect(mockMemberDelete).toHaveBeenCalledWith({ where: { id: "m-1" } });
  });

  it("returns error when membership not found", async () => {
    const { deleteMembership } = await import("../membership-actions");
    mockFindUnique.mockResolvedValue(null);

    const result = await deleteMembership("missing");

    expect(result).toEqual({ success: false, error: "Membresía no encontrada" });
  });

  it("catches database errors gracefully", async () => {
    const { deleteMembership } = await import("../membership-actions");
    mockFindUnique.mockResolvedValue({ memberId: "m-1" });
    mockTransaction.mockRejectedValue(new Error("DB error"));

    const result = await deleteMembership("ms-1");

    expect(result).toEqual({ success: false, error: "Error al eliminar la membresía" });
  });
});
