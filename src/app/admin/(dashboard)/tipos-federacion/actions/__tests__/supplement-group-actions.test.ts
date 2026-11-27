import { describe, it, expect, vi, beforeEach } from "vitest";

const mockDeleteMany = vi.fn();
const mockUpdateMany = vi.fn();
const mockDelete = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    season: {
      findUnique: () => Promise.resolve({ year: new Date().getFullYear() }),
    },
    supplementGroupPrice: {
      deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
    },
    supplement: {
      findUnique: () =>
        Promise.resolve({
          name: "x",
          description: "",
          active: true,
          lineageId: "lin-1",
          seasonId: "season-1",
        }),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
    },
    supplementGroup: {
      findUnique: () =>
        Promise.resolve({
          name: "x",
          description: "",
          active: true,
          lineageId: "lin-1",
          seasonId: "season-1",
        }),
      delete: (...args: unknown[]) => mockDelete(...args),
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
    const { deleteSupplementGroup } =
      await import("../supplement-group-actions");

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
