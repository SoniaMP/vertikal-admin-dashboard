import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSoldCount = vi.fn();
const mockPriceDeleteMany = vi.fn();
const mockSupplementDelete = vi.fn();
const mockGroupUpdate = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    season: {
      findUnique: () => Promise.resolve({ year: new Date().getFullYear() }),
    },
    supplement: {
      findUnique: () =>
        Promise.resolve({
          name: "Tarjeta impresa",
          description: "",
          active: true,
          lineageId: "lin-1",
          seasonId: "season-1",
        }),
      delete: (...args: unknown[]) => mockSupplementDelete(...args),
    },
    supplementGroup: {
      findUnique: () =>
        Promise.resolve({
          name: "Espeleosocorristas",
          active: true,
          lineageId: "lin-g",
          seasonId: "season-1",
        }),
      update: (...args: unknown[]) => mockGroupUpdate(...args),
    },
    supplementPrice: {
      deleteMany: (...args: unknown[]) => mockPriceDeleteMany(...args),
    },
    membershipSupplement: {
      count: (...args: unknown[]) => mockSoldCount(...args),
    },
    $transaction: (fn: (tx: unknown) => Promise<void>) => mockTransaction(fn),
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "admin" } }),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

describe("deleteSupplement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockImplementation(
      async (fn: (tx: unknown) => Promise<void>) =>
        fn({
          supplementPrice: { deleteMany: mockPriceDeleteMany },
          supplement: { delete: mockSupplementDelete },
        }),
    );
  });

  it("refuses to delete something a member already bought", async () => {
    const { deleteSupplement } = await import("../supplement-actions");
    mockSoldCount.mockResolvedValue(2);

    const result = await deleteSupplement("sup-1");

    expect(result.success).toBe(false);
    expect(result.error).toContain("membresías");
    // What a member was charged for stays put, whatever the panel asked.
    expect(mockSupplementDelete).not.toHaveBeenCalled();
    expect(mockPriceDeleteMany).not.toHaveBeenCalled();
  });

  it("deletes an unsold supplement with its season prices", async () => {
    const { deleteSupplement } = await import("../supplement-actions");
    mockSoldCount.mockResolvedValue(0);

    const result = await deleteSupplement("sup-1");

    expect(result.success).toBe(true);
    expect(mockPriceDeleteMany).toHaveBeenCalledWith({
      where: { supplementId: "sup-1" },
    });
    expect(mockSupplementDelete).toHaveBeenCalledWith({
      where: { id: "sup-1" },
    });
  });

  it("drops the prices before the row they point at", async () => {
    const { deleteSupplement } = await import("../supplement-actions");
    mockSoldCount.mockResolvedValue(0);

    await deleteSupplement("sup-1");

    expect(mockPriceDeleteMany.mock.invocationCallOrder[0]).toBeLessThan(
      mockSupplementDelete.mock.invocationCallOrder[0],
    );
  });

  it("counts the sales of this supplement and no other", async () => {
    const { deleteSupplement } = await import("../supplement-actions");
    mockSoldCount.mockResolvedValue(0);

    await deleteSupplement("sup-1");

    expect(mockSoldCount).toHaveBeenCalledWith({
      where: { supplementId: "sup-1" },
    });
  });
});

describe("toggleSupplementGroupActive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGroupUpdate.mockResolvedValue({});
  });

  it("retires a group", async () => {
    const { toggleSupplementGroupActive } =
      await import("../supplement-group-actions");

    const result = await toggleSupplementGroupActive("grp-1", false);

    expect(result.success).toBe(true);
    expect(mockGroupUpdate).toHaveBeenCalledWith({
      where: { id: "grp-1" },
      data: { active: false },
    });
  });

  it("brings a group back without touching its members", async () => {
    const { toggleSupplementGroupActive } =
      await import("../supplement-group-actions");

    await toggleSupplementGroupActive("grp-1", true);

    // Members keep their own state, so reactivating restores exactly the ones
    // that were live before.
    expect(mockGroupUpdate).toHaveBeenCalledWith({
      where: { id: "grp-1" },
      data: { active: true },
    });
  });
});
