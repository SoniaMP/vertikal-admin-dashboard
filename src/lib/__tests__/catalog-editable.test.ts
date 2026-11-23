import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRowFindUnique = vi.fn();
const mockSeasonFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    season: {
      findUnique: (...args: unknown[]) => mockSeasonFindUnique(...args),
    },
    category: {
      findUnique: (...args: unknown[]) => mockRowFindUnique(...args),
    },
  },
}));

const CURRENT_YEAR = new Date().getFullYear();

async function guard() {
  const { requireEditableCatalogRow } = await import("@/lib/catalog-editable");
  return requireEditableCatalogRow("category", "cat-1");
}

describe("requireEditableCatalogRow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRowFindUnique.mockResolvedValue({
      name: "Infantil",
      description: "",
      active: true,
      lineageId: "lin-1",
      seasonId: "season-1",
    });
  });

  it("lets an edit through on the year in course", async () => {
    mockSeasonFindUnique.mockResolvedValue({ year: CURRENT_YEAR });

    expect(await guard()).toBeNull();
  });

  it("lets an edit through on a future year", async () => {
    mockSeasonFindUnique.mockResolvedValue({ year: CURRENT_YEAR + 1 });

    expect(await guard()).toBeNull();
  });

  it("refuses an edit aimed at a closed year, whatever the screen shows", async () => {
    mockSeasonFindUnique.mockResolvedValue({ year: CURRENT_YEAR - 1 });

    const result = await guard();

    expect(result?.success).toBe(false);
    expect(result?.error).toContain("cerrada");
  });

  it("refuses when the row no longer exists", async () => {
    mockRowFindUnique.mockResolvedValue(null);

    const result = await guard();

    expect(result?.success).toBe(false);
    expect(mockSeasonFindUnique).not.toHaveBeenCalled();
  });
});
