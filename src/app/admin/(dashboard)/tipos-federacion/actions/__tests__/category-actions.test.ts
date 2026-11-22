import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCount = vi.fn();
const mockDelete = vi.fn();
const mockDeleteMany = vi.fn();
const mockUpsert = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    season: {
      findUnique: () =>
        Promise.resolve({ year: new Date().getFullYear() }),
    },
    membership: { count: (...args: unknown[]) => mockCount(...args) },
    licenseOffering: {
      deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
      upsert: (...args: unknown[]) => mockUpsert(...args),
    },
    category: { delete: (...args: unknown[]) => mockDelete(...args) },
    $transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "admin" } }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("deleteCategory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockImplementation(
      async (fn: (tx: unknown) => Promise<void>) => {
        const tx = {
          licenseOffering: { deleteMany: mockDeleteMany },
          category: { delete: mockDelete },
        };
        return fn(tx);
      },
    );
  });

  it("deletes category when no memberships exist", async () => {
    const { deleteCategory } = await import("../category-actions");
    mockCount.mockResolvedValue(0);

    const result = await deleteCategory("cat-1");

    expect(result).toEqual({ success: true });
    expect(mockCount).toHaveBeenCalledWith({
      where: { categoryId: "cat-1" },
    });
    expect(mockTransaction).toHaveBeenCalled();
  });

  it("returns error when memberships exist", async () => {
    const { deleteCategory } = await import("../category-actions");
    mockCount.mockResolvedValue(3);

    const result = await deleteCategory("cat-2");

    expect(result).toEqual({
      success: false,
      error: "No se puede eliminar: tiene membresías asociadas",
    });
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});

describe("batchUpsertOfferings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsert.mockResolvedValue({});
    mockDeleteMany.mockResolvedValue({ count: 1 });
    mockTransaction.mockResolvedValue(undefined);
  });

  it("upserts offerings for entries with price", async () => {
    const { batchUpsertOfferings } = await import("../category-actions");

    const result = await batchUpsertOfferings("season-1", "type-1", [
      { categoryId: "cat-1", subtypeId: "sub-1", price: 4500 },
      { categoryId: "cat-1", subtypeId: "sub-2", price: 5000 },
    ]);

    expect(result).toEqual({ success: true });
    expect(mockTransaction).toHaveBeenCalledWith(
      expect.arrayContaining([expect.anything(), expect.anything()]),
    );
  });

  it("deletes offerings for entries with null price", async () => {
    const { batchUpsertOfferings } = await import("../category-actions");

    const result = await batchUpsertOfferings("season-1", "type-1", [
      { categoryId: "cat-1", subtypeId: "sub-1", price: null },
    ]);

    expect(result).toEqual({ success: true });
    expect(mockTransaction).toHaveBeenCalled();
  });

  it("handles mixed upserts and deletes", async () => {
    const { batchUpsertOfferings } = await import("../category-actions");

    const result = await batchUpsertOfferings("season-1", "type-1", [
      { categoryId: "cat-1", subtypeId: "sub-1", price: 4500 },
      { categoryId: "cat-2", subtypeId: "sub-1", price: null },
    ]);

    expect(result).toEqual({ success: true });
    expect(mockUpsert).toHaveBeenCalled();
    expect(mockDeleteMany).toHaveBeenCalled();
  });

  it("rejects invalid data (missing seasonId)", async () => {
    const { batchUpsertOfferings } = await import("../category-actions");

    const result = await batchUpsertOfferings("", "type-1", [
      { categoryId: "cat-1", subtypeId: "sub-1", price: 4500 },
    ]);

    expect(result.success).toBe(false);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("rejects invalid data (missing typeId)", async () => {
    const { batchUpsertOfferings } = await import("../category-actions");

    const result = await batchUpsertOfferings("season-1", "", [
      { categoryId: "cat-1", subtypeId: "sub-1", price: 4500 },
    ]);

    expect(result.success).toBe(false);
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
