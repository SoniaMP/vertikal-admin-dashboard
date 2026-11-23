import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCount = vi.fn();
const mockDelete = vi.fn();
const mockDeleteMany = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    season: {
      findUnique: () => Promise.resolve({ year: new Date().getFullYear() }),
    },
    membership: { count: (...args: unknown[]) => mockCount(...args) },
    licenseOffering: { deleteMany: (...args: unknown[]) => mockDeleteMany(...args) },
    licenseSubtype: { deleteMany: (...args: unknown[]) => mockDeleteMany(...args) },
    licenseType: {
      delete: (...args: unknown[]) => mockDelete(...args),
      findUnique: () =>
        Promise.resolve({
          name: "x",
          description: "",
          active: true,
          lineageId: "lin-1",
          seasonId: "season-1",
        }),
    },
    $transaction: (fn: (tx: unknown) => Promise<void>) => mockTransaction(fn),
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "admin" } }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("deleteLicenseType", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
      const tx = {
        licenseOffering: { deleteMany: mockDeleteMany },
        licenseSubtype: { deleteMany: mockDeleteMany },
        licenseType: { delete: mockDelete },
      };
      return fn(tx);
    });
  });

  it("deletes license type when no memberships exist", async () => {
    const { deleteLicenseType } = await import("../license-type-actions");
    mockCount.mockResolvedValue(0);

    const result = await deleteLicenseType("lt-1");

    expect(result).toEqual({ success: true });
    expect(mockCount).toHaveBeenCalledWith({
      where: { typeId: "lt-1" },
    });
    expect(mockTransaction).toHaveBeenCalled();
  });

  it("returns error when memberships exist", async () => {
    const { deleteLicenseType } = await import("../license-type-actions");
    mockCount.mockResolvedValue(3);

    const result = await deleteLicenseType("lt-2");

    expect(result).toEqual({
      success: false,
      error: "No se puede eliminar: tiene membresías asociadas",
    });
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
