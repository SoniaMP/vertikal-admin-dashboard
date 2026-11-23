import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRowFindUnique = vi.fn();
const mockSeasonFindUnique = vi.fn();
const mockUpdateMany = vi.fn();
const mockFindSiblings = vi.fn();

vi.mock("@/lib/prisma", () => {
  const delegate = {
    findUnique: (...args: unknown[]) => mockRowFindUnique(...args),
    updateMany: (...args: unknown[]) => mockUpdateMany(...args),
  };
  return {
    prisma: {
      season: {
        findUnique: (...args: unknown[]) => mockSeasonFindUnique(...args),
      },
      licenseType: delegate,
      licenseSubtype: delegate,
      category: delegate,
      supplement: delegate,
      supplementGroup: delegate,
    },
  };
});

vi.mock("@/lib/catalog-lineage", () => ({
  findOpenLineageSiblings: (...args: unknown[]) => mockFindSiblings(...args),
}));

const CURRENT_YEAR = new Date().getFullYear();

const ROW = {
  name: "FERM",
  description: "Federación de montaña",
  active: false,
  lineageId: "lin-ferm",
  seasonId: "season-current",
};

const SIBLINGS = [
  { id: "type-next", year: CURRENT_YEAR + 1 },
  { id: "type-after", year: CURRENT_YEAR + 2 },
];

async function propagate(
  scope: "texts" | "state",
  model:
    | "licenseType"
    | "supplementGroup" = "licenseType",
) {
  const { propagateCatalogEdit } = await import("@/lib/catalog-propagation");
  return propagateCatalogEdit(model, "type-current", scope);
}

describe("propagateCatalogEdit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRowFindUnique.mockResolvedValue(ROW);
    mockSeasonFindUnique.mockResolvedValue({ year: CURRENT_YEAR });
    mockFindSiblings.mockResolvedValue(SIBLINGS);
    mockUpdateMany.mockResolvedValue({ count: SIBLINGS.length });
  });

  it("copies the saved texts onto every sibling at once", async () => {
    const updated = await propagate("texts");

    expect(updated).toBe(2);
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ["type-next", "type-after"] } },
      data: { name: "FERM", description: "Federación de montaña" },
    });
  });

  it("copies the state without touching the texts", async () => {
    await propagate("state");

    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ["type-next", "type-after"] } },
      data: { active: false },
    });
  });

  it("sends only a name for a group, which has no description", async () => {
    await propagate("texts", "supplementGroup");

    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ["type-next", "type-after"] } },
      data: { name: "FERM" },
    });
  });

  it("reads the values from the row, never from the caller", async () => {
    await propagate("texts");

    expect(mockRowFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "type-current" } }),
    );
  });

  it("refuses to spread from a closed season", async () => {
    mockSeasonFindUnique.mockResolvedValue({ year: CURRENT_YEAR - 1 });

    expect(await propagate("texts")).toBe(0);
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it("writes nothing when no other open season has the entity", async () => {
    mockFindSiblings.mockResolvedValue([]);

    expect(await propagate("texts")).toBe(0);
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it("writes nothing when the row is gone", async () => {
    mockRowFindUnique.mockResolvedValue(null);

    expect(await propagate("texts")).toBe(0);
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it("only ever writes to the ids the lineage lookup returned", async () => {
    await propagate("state");

    const [[args]] = mockUpdateMany.mock.calls;
    expect(args.where.id.in).toEqual(SIBLINGS.map((s) => s.id));
  });
});
