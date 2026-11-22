import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUpsert = vi.fn();
const mockDeleteMany = vi.fn();
const mockUpdateMany = vi.fn();
const mockDelete = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    season: {
      findUnique: () =>
        Promise.resolve({ year: new Date().getFullYear() }),
    },
    supplementPrice: {
      upsert: (...args: unknown[]) => mockUpsert(...args),
    },
    supplementGroupPrice: {
      upsert: (...args: unknown[]) => mockUpsert(...args),
      deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
    },
    supplement: {
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
    },
    supplementGroup: {
      delete: (...args: unknown[]) => mockDelete(...args),
    },
    $transaction: (fn: (tx: unknown) => Promise<void>) =>
      mockTransaction(fn),
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "admin" } }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("upsertSupplementPrice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsert.mockResolvedValue({});
  });

  it("upserts price for valid data", async () => {
    const { upsertSupplementPrice } = await import(
      "../supplement-actions"
    );

    const result = await upsertSupplementPrice(
      "supp-1",
      "season-1",
      1500,
    );

    expect(result).toEqual({ success: true });
    expect(mockUpsert).toHaveBeenCalledWith({
      where: {
        seasonId_supplementId: {
          seasonId: "season-1",
          supplementId: "supp-1",
        },
      },
      create: {
        seasonId: "season-1",
        supplementId: "supp-1",
        price: 1500,
      },
      update: { price: 1500 },
    });
  });

  it("rejects zero price", async () => {
    const { upsertSupplementPrice } = await import(
      "../supplement-actions"
    );

    const result = await upsertSupplementPrice("supp-1", "season-1", 0);

    expect(result.success).toBe(false);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("rejects negative price", async () => {
    const { upsertSupplementPrice } = await import(
      "../supplement-actions"
    );

    const result = await upsertSupplementPrice(
      "supp-1",
      "season-1",
      -100,
    );

    expect(result.success).toBe(false);
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});

describe("upsertSupplementGroupPrice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsert.mockResolvedValue({});
  });

  it("upserts group price for valid data", async () => {
    const { upsertSupplementGroupPrice } = await import(
      "../supplement-actions"
    );

    const result = await upsertSupplementGroupPrice(
      "group-1",
      "season-1",
      2000,
    );

    expect(result).toEqual({ success: true });
    expect(mockUpsert).toHaveBeenCalledWith({
      where: {
        seasonId_groupId: {
          seasonId: "season-1",
          groupId: "group-1",
        },
      },
      create: { seasonId: "season-1", groupId: "group-1", price: 2000 },
      update: { price: 2000 },
    });
  });

  it("rejects zero price", async () => {
    const { upsertSupplementGroupPrice } = await import(
      "../supplement-actions"
    );

    const result = await upsertSupplementGroupPrice(
      "group-1",
      "season-1",
      0,
    );

    expect(result.success).toBe(false);
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});

describe("deleteSupplementGroup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockImplementation(
      async (fn: (tx: unknown) => Promise<void>) => {
        const tx = {
          supplement: { updateMany: mockUpdateMany },
          supplementGroupPrice: { deleteMany: mockDeleteMany },
          supplementGroup: { delete: mockDelete },
        };
        return fn(tx);
      },
    );
  });

  it("deletes group and cascades correctly", async () => {
    const { deleteSupplementGroup } = await import(
      "../supplement-actions"
    );

    const result = await deleteSupplementGroup("group-1");

    expect(result).toEqual({ success: true });
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { supplementGroupId: "group-1" },
      data: { supplementGroupId: null },
    });
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { groupId: "group-1" },
    });
    expect(mockDelete).toHaveBeenCalledWith({
      where: { id: "group-1" },
    });
  });
});
