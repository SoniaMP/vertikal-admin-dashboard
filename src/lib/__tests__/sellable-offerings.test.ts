import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCount = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: { licenseOffering: { count: (...a: unknown[]) => mockCount(...a) } },
}));

import { countSellableOfferings } from "@/lib/sellable-offerings";

describe("countSellableOfferings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCount.mockResolvedValue(3);
  });

  it("counts only what the public wizard would show", async () => {
    await countSellableOfferings("season-1");

    expect(mockCount).toHaveBeenCalledWith({
      where: {
        seasonId: "season-1",
        type: { active: true, publishedAt: { not: null } },
        subtype: { active: true, publishedAt: { not: null } },
        category: { active: true },
      },
    });
  });

  it("is zero for a year with no season, without asking the database", async () => {
    expect(await countSellableOfferings("")).toBe(0);
    expect(mockCount).not.toHaveBeenCalled();
  });
});
