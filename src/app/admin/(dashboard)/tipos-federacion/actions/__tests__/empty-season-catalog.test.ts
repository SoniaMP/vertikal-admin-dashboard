import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSeasonFindUnique = vi.fn();
const mockTransaction = vi.fn();
const mockClearCatalog = vi.fn();

const tx = { season: { delete: vi.fn() } };

vi.mock("@/lib/prisma", () => ({
  prisma: {
    season: {
      findUnique: (...args: unknown[]) => mockSeasonFindUnique(...args),
    },
    $transaction: (fn: (client: unknown) => Promise<void>) =>
      mockTransaction(fn),
  },
}));

vi.mock("@/lib/season-catalog-clear", () => ({
  clearSeasonCatalog: (...args: unknown[]) => mockClearCatalog(...args),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "admin" } }),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

async function empty(year: number) {
  const { emptySeasonCatalog } = await import("../empty-season-catalog");
  return emptySeasonCatalog(year);
}

describe("emptySeasonCatalog", () => {
  const currentYear = new Date().getFullYear();

  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockImplementation(
      async (fn: (client: unknown) => Promise<void>) => fn(tx),
    );
  });

  it("refuses a year that already closed", async () => {
    const result = await empty(currentYear - 1);

    expect(result.success).toBe(false);
    expect(mockSeasonFindUnique).not.toHaveBeenCalled();
    expect(mockClearCatalog).not.toHaveBeenCalled();
  });

  it("refuses a year that already has memberships", async () => {
    mockSeasonFindUnique.mockResolvedValueOnce({
      id: "season-x",
      _count: { memberships: 3 },
    });

    const result = await empty(currentYear + 1);

    expect(result.error).toContain("membresías");
    expect(mockClearCatalog).not.toHaveBeenCalled();
  });

  it("treats a year with no season row as already empty", async () => {
    mockSeasonFindUnique.mockResolvedValueOnce(null);

    const result = await empty(currentYear + 1);

    expect(result.success).toBe(true);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("clears the whole catalog of the year inside one transaction", async () => {
    mockSeasonFindUnique.mockResolvedValueOnce({
      id: "season-next",
      _count: { memberships: 0 },
    });

    const result = await empty(currentYear + 1);

    expect(result.success).toBe(true);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockClearCatalog).toHaveBeenCalledWith(tx, "season-next");
  });

  it("drops the season row too, so the year reads as never opened", async () => {
    mockSeasonFindUnique.mockResolvedValueOnce({
      id: "season-next",
      _count: { memberships: 0 },
    });

    await empty(currentYear + 1);

    expect(tx.season.delete).toHaveBeenCalledWith({
      where: { id: "season-next" },
    });
  });

  it("reports a failure when a membership slips in before the delete", async () => {
    mockSeasonFindUnique.mockResolvedValueOnce({
      id: "season-next",
      _count: { memberships: 0 },
    });
    tx.season.delete.mockRejectedValueOnce(
      new Error("Foreign key constraint violated"),
    );

    const result = await empty(currentYear + 1);

    expect(result.success).toBe(false);
  });

  it("reports a failed wipe instead of claiming success", async () => {
    mockSeasonFindUnique.mockResolvedValueOnce({
      id: "season-next",
      _count: { memberships: 0 },
    });
    mockClearCatalog.mockRejectedValueOnce(new Error("FK constraint failed"));

    const result = await empty(currentYear + 1);

    expect(result.success).toBe(false);
    expect(result.error).toContain("No se ha borrado nada");
  });
});
