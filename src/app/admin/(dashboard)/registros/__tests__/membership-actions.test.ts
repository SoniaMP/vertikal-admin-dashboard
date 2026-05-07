import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();
const mockDelete = vi.fn();
const mockDeleteMany = vi.fn();
const mockCount = vi.fn();
const mockMemberDelete = vi.fn();
const mockMemberUpdate = vi.fn();
const mockMembershipUpdate = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    membership: {
      findUnique: (...a: unknown[]) => mockFindUnique(...a),
      update: (...a: unknown[]) => mockMembershipUpdate(...a),
    },
    member: { update: (...a: unknown[]) => mockMemberUpdate(...a) },
    $transaction: (arg: unknown) => mockTransaction(arg),
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

function buildMemberFormData(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  const base: Record<string, string> = {
    firstName: "Ana",
    lastName: "García",
    email: "ana@example.com",
    phone: "600000000",
    dni: "12345678A",
    dateOfBirth: "1990-01-01",
    sex: "F",
    address: "Calle Falsa 123",
    city: "Madrid",
    postalCode: "28001",
    province: "Madrid",
    paymentStatus: "PENDING",
    ...overrides,
  };
  for (const [k, v] of Object.entries(base)) fd.append(k, v);
  return fd;
}

describe("updateMembership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockImplementation(async (ops: unknown) =>
      Array.isArray(ops) ? Promise.all(ops) : undefined,
    );
    mockFindUnique.mockResolvedValue({ memberId: "m-1" });
    mockMemberUpdate.mockResolvedValue({});
    mockMembershipUpdate.mockResolvedValue({});
  });

  it("persists sex when present in form data", async () => {
    const { updateMembership } = await import("../membership-actions");
    const fd = buildMemberFormData({ sex: "M" });

    const result = await updateMembership("ms-1", { success: false }, fd);

    expect(result).toEqual({ success: true });
    expect(mockMemberUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ sex: "M" }) }),
    );
  });

  it("returns validation error when sex is missing", async () => {
    const { updateMembership } = await import("../membership-actions");
    const fd = buildMemberFormData();
    fd.delete("sex");

    const result = await updateMembership("ms-1", { success: false }, fd);

    expect(result.success).toBe(false);
    expect(mockMemberUpdate).not.toHaveBeenCalled();
  });
});
