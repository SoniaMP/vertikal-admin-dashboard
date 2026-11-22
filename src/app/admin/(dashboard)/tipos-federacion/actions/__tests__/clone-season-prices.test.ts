import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSeasonFindUnique = vi.fn();
const mockTransaction = vi.fn();

const tx = {
  season: { create: vi.fn() },
  licenseOffering: { deleteMany: vi.fn(), createMany: vi.fn() },
  supplementPrice: { deleteMany: vi.fn(), createMany: vi.fn() },
  supplementGroupPrice: { deleteMany: vi.fn(), createMany: vi.fn() },
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    season: {
      findUnique: (...args: unknown[]) => mockSeasonFindUnique(...args),
    },
    $transaction: (fn: (client: unknown) => Promise<void>) =>
      mockTransaction(fn),
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "admin" } }),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const SOURCE = {
  id: "season-2026",
  year: 2026,
  offerings: [
    { typeId: "t1", subtypeId: "s1", categoryId: "c1", price: 5000 },
  ],
  supplementPrices: [{ supplementId: "sup1", price: 1000 }],
  supplementGroupPrices: [{ groupId: "g1", price: 1500 }],
};

async function clone(from: number, to: number) {
  const { cloneSeasonPrices } = await import("../clone-season-prices");
  return cloneSeasonPrices(from, to);
}

describe("cloneSeasonPrices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockImplementation(
      async (fn: (client: unknown) => Promise<void>) => fn(tx),
    );
    tx.season.create.mockResolvedValue({ id: "season-2027" });
  });

  it("refuses to clone a season onto itself", async () => {
    const result = await clone(2026, 2026);

    expect(result.success).toBe(false);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("refuses a source year that does not exist", async () => {
    mockSeasonFindUnique.mockResolvedValueOnce(null);

    const result = await clone(2019, 2027);

    expect(result.success).toBe(false);
    expect(result.error).toContain("2019");
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("refuses a target that already has memberships", async () => {
    mockSeasonFindUnique
      .mockResolvedValueOnce(SOURCE)
      .mockResolvedValueOnce({ id: "season-2026", _count: { memberships: 2 } });

    const result = await clone(2025, 2026);

    expect(result.success).toBe(false);
    expect(result.error).toContain("membresías");
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("creates the target season when the year has no row yet", async () => {
    mockSeasonFindUnique
      .mockResolvedValueOnce(SOURCE)
      .mockResolvedValueOnce(null);

    const result = await clone(2026, 2027);

    expect(result.success).toBe(true);
    expect(tx.season.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ year: 2027, isActive: false }),
    });
  });

  it("wipes the target prices before copying so the years end up identical", async () => {
    mockSeasonFindUnique
      .mockResolvedValueOnce(SOURCE)
      .mockResolvedValueOnce({ id: "season-2027", _count: { memberships: 0 } });

    await clone(2026, 2027);

    expect(tx.licenseOffering.deleteMany).toHaveBeenCalledWith({
      where: { seasonId: "season-2027" },
    });
    expect(tx.supplementPrice.deleteMany).toHaveBeenCalled();
    expect(tx.supplementGroupPrice.deleteMany).toHaveBeenCalled();
  });

  it("copies every price onto the target season", async () => {
    mockSeasonFindUnique
      .mockResolvedValueOnce(SOURCE)
      .mockResolvedValueOnce({ id: "season-2027", _count: { memberships: 0 } });

    await clone(2026, 2027);

    expect(tx.licenseOffering.createMany).toHaveBeenCalledWith({
      data: [
        {
          seasonId: "season-2027",
          typeId: "t1",
          subtypeId: "s1",
          categoryId: "c1",
          price: 5000,
        },
      ],
    });
    expect(tx.supplementPrice.createMany).toHaveBeenCalledWith({
      data: [{ seasonId: "season-2027", supplementId: "sup1", price: 1000 }],
    });
    expect(tx.supplementGroupPrice.createMany).toHaveBeenCalledWith({
      data: [{ seasonId: "season-2027", groupId: "g1", price: 1500 }],
    });
  });
});
