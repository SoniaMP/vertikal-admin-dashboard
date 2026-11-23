import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSeasonFindUnique = vi.fn();
const mockTransaction = vi.fn();
const mockCopyCatalog = vi.fn();

const tx = { season: { create: vi.fn() } };

vi.mock("@/lib/prisma", () => ({
  prisma: {
    season: {
      findUnique: (...args: unknown[]) => mockSeasonFindUnique(...args),
    },
    $transaction: (fn: (client: unknown) => Promise<void>) =>
      mockTransaction(fn),
  },
}));

vi.mock("@/lib/season-catalog-copy", () => ({
  copySeasonCatalog: (...args: unknown[]) => mockCopyCatalog(...args),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "admin" } }),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const SOURCE = { id: "season-2026" };

async function clone(from: number, to: number) {
  const { cloneSeasonPrices } = await import("../clone-season-prices");
  return cloneSeasonPrices(from, to);
}

describe("cloneSeasonPrices", () => {
  const currentYear = new Date().getFullYear();

  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockImplementation(
      async (fn: (client: unknown) => Promise<void>) => fn(tx),
    );
    tx.season.create.mockResolvedValue({ id: "season-new" });
  });

  it("refuses to clone a season onto itself", async () => {
    const result = await clone(currentYear, currentYear);

    expect(result.success).toBe(false);
    expect(mockCopyCatalog).not.toHaveBeenCalled();
  });

  it("refuses a target year that already closed", async () => {
    const result = await clone(currentYear, currentYear - 1);

    expect(result.success).toBe(false);
    expect(mockCopyCatalog).not.toHaveBeenCalled();
  });

  it("refuses a source year that does not exist", async () => {
    mockSeasonFindUnique.mockResolvedValueOnce(null);

    const result = await clone(currentYear - 5, currentYear + 1);

    expect(result.success).toBe(false);
    expect(mockCopyCatalog).not.toHaveBeenCalled();
  });

  it("refuses a target that already has memberships", async () => {
    mockSeasonFindUnique
      .mockResolvedValueOnce(SOURCE)
      .mockResolvedValueOnce({ id: "season-x", _count: { memberships: 2 } });

    const result = await clone(currentYear + 1, currentYear);

    expect(result.error).toContain("membresías");
    expect(mockCopyCatalog).not.toHaveBeenCalled();
  });

  it("creates the target season when the year has no row yet", async () => {
    mockSeasonFindUnique
      .mockResolvedValueOnce(SOURCE)
      .mockResolvedValueOnce(null);

    const result = await clone(currentYear, currentYear + 1);

    expect(result.success).toBe(true);
    expect(tx.season.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ year: currentYear + 1, isActive: false }),
    });
    expect(mockCopyCatalog).toHaveBeenCalledWith(
      tx,
      "season-2026",
      "season-new",
    );
  });

  it("copies the whole catalog into an existing target season", async () => {
    mockSeasonFindUnique
      .mockResolvedValueOnce(SOURCE)
      .mockResolvedValueOnce({ id: "season-2027", _count: { memberships: 0 } });

    await clone(currentYear, currentYear + 1);

    expect(mockCopyCatalog).toHaveBeenCalledWith(
      tx,
      "season-2026",
      "season-2027",
    );
  });

  it("runs the whole copy inside a single transaction", async () => {
    mockSeasonFindUnique
      .mockResolvedValueOnce(SOURCE)
      .mockResolvedValueOnce({ id: "season-2027", _count: { memberships: 0 } });

    await clone(currentYear, currentYear + 1);

    expect(mockTransaction).toHaveBeenCalledTimes(1);
  });

  it("reports a failure mid-copy instead of leaving it half done", async () => {
    mockSeasonFindUnique
      .mockResolvedValueOnce(SOURCE)
      .mockResolvedValueOnce({ id: "season-2027", _count: { memberships: 0 } });
    mockCopyCatalog.mockRejectedValueOnce(new Error("FK constraint failed"));

    const result = await clone(currentYear, currentYear + 1);

    expect(result.success).toBe(false);
    // The rollback is the database's job; what this guards is that the action
    // lets the transaction reject instead of swallowing it and reporting
    // success over a half-copied year.
    expect(mockTransaction).toHaveBeenCalledTimes(1);
  });
});
