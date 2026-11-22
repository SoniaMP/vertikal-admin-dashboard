import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    season: { findUnique: (...args: unknown[]) => mockFindUnique(...args) },
  },
}));

async function guard(seasonId: string) {
  const { requireEditableSeason } = await import("../season-editable");
  return requireEditableSeason(seasonId);
}

describe("requireEditableSeason", () => {
  const currentYear = new Date().getFullYear();

  beforeEach(() => vi.clearAllMocks());

  it("lets the current year through", async () => {
    mockFindUnique.mockResolvedValue({ year: currentYear });

    expect(await guard("season-now")).toBeNull();
  });

  it("lets a year still to come through", async () => {
    mockFindUnique.mockResolvedValue({ year: currentYear + 1 });

    expect(await guard("season-next")).toBeNull();
  });

  it("refuses a year that already closed", async () => {
    mockFindUnique.mockResolvedValue({ year: currentYear - 1 });

    const result = await guard("season-past");

    expect(result?.success).toBe(false);
    expect(result?.error).toContain(String(currentYear - 1));
  });

  it("refuses a season that does not exist", async () => {
    mockFindUnique.mockResolvedValue(null);

    expect((await guard("nope"))?.success).toBe(false);
  });
});
