import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSupplementFindUnique = vi.fn();
const mockGroupFindUnique = vi.fn();
const mockTypeFindMany = vi.fn();
const mockLinkDeleteMany = vi.fn();
const mockLinkCreateMany = vi.fn();
const mockGroupLinkDeleteMany = vi.fn();
const mockGroupLinkCreateMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    supplement: {
      findUnique: (...a: unknown[]) => mockSupplementFindUnique(...a),
    },
    supplementGroup: {
      findUnique: (...a: unknown[]) => mockGroupFindUnique(...a),
    },
    licenseType: { findMany: (...a: unknown[]) => mockTypeFindMany(...a) },
    licenseTypeSupplement: {
      deleteMany: (...a: unknown[]) => mockLinkDeleteMany(...a),
      createMany: (...a: unknown[]) => mockLinkCreateMany(...a),
    },
    licenseTypeSupplementGroup: {
      deleteMany: (...a: unknown[]) => mockGroupLinkDeleteMany(...a),
      createMany: (...a: unknown[]) => mockGroupLinkCreateMany(...a),
    },
    $transaction: vi.fn().mockResolvedValue([]),
  },
}));

const { replaceTypeLinks } = await import("../supplement-type-links");

describe("replaceTypeLinks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTypeFindMany.mockResolvedValue([{ id: "t1" }, { id: "t2" }]);
  });

  it("replaces a standalone supplement's federations", async () => {
    mockSupplementFindUnique.mockResolvedValue({
      seasonId: "season-1",
      supplementGroupId: null,
    });

    await replaceTypeLinks({ supplementId: "s1" }, ["t1", "t2"]);

    expect(mockLinkDeleteMany).toHaveBeenCalledWith({
      where: { supplementId: "s1" },
    });
    expect(mockLinkCreateMany).toHaveBeenCalledWith({
      data: [
        { typeId: "t1", supplementId: "s1" },
        { typeId: "t2", supplementId: "s1" },
      ],
    });
  });

  it("gives a grouped supplement no federations of its own", async () => {
    mockSupplementFindUnique.mockResolvedValue({
      seasonId: "season-1",
      supplementGroupId: "g1",
    });

    await replaceTypeLinks({ supplementId: "s2" }, ["t1"]);

    expect(mockLinkDeleteMany).toHaveBeenCalledWith({
      where: { supplementId: "s2" },
    });
    expect(mockLinkCreateMany).toHaveBeenCalledWith({ data: [] });
    expect(mockTypeFindMany).not.toHaveBeenCalled();
  });

  it("drops an id that is not a federation of this season", async () => {
    mockSupplementFindUnique.mockResolvedValue({
      seasonId: "season-1",
      supplementGroupId: null,
    });
    mockTypeFindMany.mockResolvedValue([{ id: "t1" }]);

    await replaceTypeLinks({ supplementId: "s1" }, ["t1", "other-season"]);

    expect(mockTypeFindMany).toHaveBeenCalledWith({
      where: { seasonId: "season-1", id: { in: ["t1", "other-season"] } },
      select: { id: true },
    });
    expect(mockLinkCreateMany).toHaveBeenCalledWith({
      data: [{ typeId: "t1", supplementId: "s1" }],
    });
  });

  it("replaces a group's federations", async () => {
    mockGroupFindUnique.mockResolvedValue({ seasonId: "season-1" });

    await replaceTypeLinks({ groupId: "g1" }, ["t2"]);

    expect(mockGroupLinkDeleteMany).toHaveBeenCalledWith({
      where: { groupId: "g1" },
    });
    expect(mockGroupLinkCreateMany).toHaveBeenCalledWith({
      data: [
        { typeId: "t1", groupId: "g1" },
        { typeId: "t2", groupId: "g1" },
      ],
    });
  });

  it("clears every federation when nothing is ticked", async () => {
    mockSupplementFindUnique.mockResolvedValue({
      seasonId: "season-1",
      supplementGroupId: null,
    });

    await replaceTypeLinks({ supplementId: "s1" }, []);

    expect(mockLinkDeleteMany).toHaveBeenCalledWith({
      where: { supplementId: "s1" },
    });
    expect(mockLinkCreateMany).toHaveBeenCalledWith({ data: [] });
    expect(mockTypeFindMany).not.toHaveBeenCalled();
  });

  it("does nothing when the row is gone", async () => {
    mockSupplementFindUnique.mockResolvedValue(null);

    await replaceTypeLinks({ supplementId: "gone" }, ["t1"]);

    expect(mockLinkDeleteMany).not.toHaveBeenCalled();
    expect(mockLinkCreateMany).not.toHaveBeenCalled();
  });
});
