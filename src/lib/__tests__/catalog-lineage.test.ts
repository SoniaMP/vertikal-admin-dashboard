import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();
const mockFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    category: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
    supplementGroup: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

const CURRENT_YEAR = new Date().getFullYear();

const ROW = {
  name: "Infantil",
  description: "Menores",
  active: true,
  lineageId: "lin-infantil",
  seasonId: "season-2026",
};

async function findSiblings(model: "category" | "supplementGroup" = "category") {
  const { findOpenLineageSiblings } = await import("@/lib/catalog-lineage");
  return findOpenLineageSiblings(model, "cat-2026");
}

describe("findOpenLineageSiblings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindUnique.mockResolvedValue(ROW);
    mockFindMany.mockResolvedValue([]);
  });

  it("looks for rows sharing the lineage in other seasons that are still open", async () => {
    await findSiblings();

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          lineageId: "lin-infantil",
          seasonId: { not: "season-2026" },
          season: { year: { gte: CURRENT_YEAR } },
        },
      }),
    );
  });

  it("returns each sibling with the year of its season", async () => {
    mockFindMany.mockResolvedValue([
      { id: "cat-2027", season: { year: 2027 } },
      { id: "cat-2028", season: { year: 2028 } },
    ]);

    expect(await findSiblings()).toEqual([
      { id: "cat-2027", year: 2027 },
      { id: "cat-2028", year: 2028 },
    ]);
  });

  it("asks for them oldest first, so the question reads in order", async () => {
    await findSiblings();

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { season: { year: "asc" } } }),
    );
  });

  it("returns nothing when the row is gone", async () => {
    mockFindUnique.mockResolvedValue(null);

    expect(await findSiblings()).toEqual([]);
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("works for a group, which has no description to read", async () => {
    mockFindUnique.mockResolvedValue({
      name: "Seguros",
      active: true,
      lineageId: "lin-seguros",
      seasonId: "season-2026",
    });
    mockFindMany.mockResolvedValue([{ id: "grp-2027", season: { year: 2027 } }]);

    expect(await findSiblings("supplementGroup")).toEqual([
      { id: "grp-2027", year: 2027 },
    ]);
  });
});
