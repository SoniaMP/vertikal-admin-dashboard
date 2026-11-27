import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSupplementFind = vi.fn();
const mockGroupFind = vi.fn();
const mockUpsert = vi.fn();
const mockDeleteMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    supplement: { findUnique: (...a: unknown[]) => mockSupplementFind(...a) },
    supplementGroup: { findUnique: (...a: unknown[]) => mockGroupFind(...a) },
    supplementPrice: {
      upsert: (...a: unknown[]) => mockUpsert(...a),
      deleteMany: (...a: unknown[]) => mockDeleteMany(...a),
    },
    supplementGroupPrice: {
      upsert: (...a: unknown[]) => mockUpsert(...a),
      deleteMany: (...a: unknown[]) => mockDeleteMany(...a),
    },
  },
}));

const { writeSeasonPrice } = await import("../season-price-write");

describe("writeSeasonPrice, for a supplement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupplementFind.mockResolvedValue({
      seasonId: "season-1",
      supplementGroupId: null,
    });
  });

  it("writes the price into the season the supplement lives in", async () => {
    const error = await writeSeasonPrice({ supplementId: "sup-1" }, 1500);

    expect(error).toBeNull();
    expect(mockUpsert).toHaveBeenCalledWith({
      where: {
        seasonId_supplementId: { seasonId: "season-1", supplementId: "sup-1" },
      },
      create: { seasonId: "season-1", supplementId: "sup-1", price: 1500 },
      update: { price: 1500 },
    });
  });

  it("clears the price when the form left the field empty", async () => {
    const error = await writeSeasonPrice({ supplementId: "sup-1" }, null);

    expect(error).toBeNull();
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { seasonId: "season-1", supplementId: "sup-1" },
    });
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("keeps no price of its own once it belongs to a group", async () => {
    // The group is what gets charged for, so a figure aimed at the member is
    // not stored and quietly overridden later: it is removed.
    mockSupplementFind.mockResolvedValue({
      seasonId: "season-1",
      supplementGroupId: "grp-1",
    });

    const error = await writeSeasonPrice({ supplementId: "sup-1" }, 1500);

    expect(error).toBeNull();
    expect(mockUpsert).not.toHaveBeenCalled();
    expect(mockDeleteMany).toHaveBeenCalled();
  });

  it("refuses a free extra instead of selling one", async () => {
    const error = await writeSeasonPrice({ supplementId: "sup-1" }, 0);

    expect(error?.success).toBe(false);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("refuses a negative price", async () => {
    const error = await writeSeasonPrice({ supplementId: "sup-1" }, -100);

    expect(error?.success).toBe(false);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("says nothing when the row is already gone", async () => {
    mockSupplementFind.mockResolvedValue(null);

    expect(await writeSeasonPrice({ supplementId: "sup-1" }, 1500)).toBeNull();
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});

describe("writeSeasonPrice, for a group", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGroupFind.mockResolvedValue({ seasonId: "season-1" });
  });

  it("writes the group price into the group's own season", async () => {
    const error = await writeSeasonPrice({ groupId: "grp-1" }, 2000);

    expect(error).toBeNull();
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { seasonId_groupId: { seasonId: "season-1", groupId: "grp-1" } },
      create: { seasonId: "season-1", groupId: "grp-1", price: 2000 },
      update: { price: 2000 },
    });
  });

  it("clears it when the field comes back empty", async () => {
    const error = await writeSeasonPrice({ groupId: "grp-1" }, null);

    expect(error).toBeNull();
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { seasonId: "season-1", groupId: "grp-1" },
    });
  });

  it("refuses a zero price", async () => {
    const error = await writeSeasonPrice({ groupId: "grp-1" }, 0);

    expect(error?.success).toBe(false);
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});
