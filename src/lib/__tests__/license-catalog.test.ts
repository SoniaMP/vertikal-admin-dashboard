import { describe, it, expect, vi, beforeEach } from "vitest";

const mockTypeFindMany = vi.fn();
const mockOfferingFindMany = vi.fn();
const mockSupplementFindMany = vi.fn();
const mockSupplementPriceFindMany = vi.fn();
const mockGroupPriceFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    licenseType: { findMany: (...a: unknown[]) => mockTypeFindMany(...a) },
    licenseOffering: {
      findMany: (...a: unknown[]) => mockOfferingFindMany(...a),
    },
    supplement: { findMany: (...a: unknown[]) => mockSupplementFindMany(...a) },
    supplementPrice: {
      findMany: (...a: unknown[]) => mockSupplementPriceFindMany(...a),
    },
    supplementGroupPrice: {
      findMany: (...a: unknown[]) => mockGroupPriceFindMany(...a),
    },
  },
}));

vi.mock("@/lib/settings", () => ({
  getActiveSeason: vi.fn().mockResolvedValue({ id: "season-1" }),
}));

const CATEGORY = {
  id: "cat-1",
  name: "Adulto",
  description: "",
  active: true,
};

describe("fetchLicenseCatalog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupplementFindMany.mockResolvedValue([]);
    mockSupplementPriceFindMany.mockResolvedValue([]);
    mockGroupPriceFindMany.mockResolvedValue([]);
  });

  it("asks the database only for this season's published types and modalities", async () => {
    const { fetchLicenseCatalog } = await import("../license-catalog");
    mockTypeFindMany.mockResolvedValue([]);
    mockOfferingFindMany.mockResolvedValue([]);

    await fetchLicenseCatalog();

    expect(mockTypeFindMany).toHaveBeenCalledWith({
      where: { seasonId: "season-1", active: true, publishedAt: { not: null } },
      include: {
        subtypes: {
          where: { active: true, publishedAt: { not: null } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
  });

  it("publishes a type whose modality has a price", async () => {
    const { fetchLicenseCatalog } = await import("../license-catalog");
    mockTypeFindMany.mockResolvedValue([
      {
        id: "lt-1",
        name: "FERM",
        description: "",
        active: true,
        subtypes: [
          {
            id: "st-1",
            name: "BÁSICA A",
            description: "",
            active: true,
            licenseTypeId: "lt-1",
          },
        ],
      },
    ]);
    mockOfferingFindMany.mockResolvedValue([
      {
        typeId: "lt-1",
        subtypeId: "st-1",
        categoryId: "cat-1",
        price: 1500,
        category: CATEGORY,
      },
    ]);

    const catalog = await fetchLicenseCatalog();

    expect(catalog).toHaveLength(1);
    expect(catalog[0].subtypes.map((s) => s.name)).toEqual(["BÁSICA A"]);
    expect(catalog[0].categories[0].prices).toEqual([
      { subtypeId: "st-1", price: 1500 },
    ]);
  });

  it("drops a supplement with no price for the season", async () => {
    const { fetchLicenseCatalog } = await import("../license-catalog");
    mockTypeFindMany.mockResolvedValue([
      {
        id: "lt-1",
        name: "FERM",
        description: "",
        active: true,
        subtypes: [
          {
            id: "st-1",
            name: "BÁSICA A",
            description: "",
            active: true,
            licenseTypeId: "lt-1",
          },
        ],
      },
    ]);
    mockOfferingFindMany.mockResolvedValue([
      {
        typeId: "lt-1",
        subtypeId: "st-1",
        categoryId: "cat-1",
        price: 1500,
        category: CATEGORY,
      },
    ]);
    mockSupplementFindMany.mockResolvedValue([
      {
        id: "sup-priced",
        name: "Seguro ampliado",
        description: "",
        active: true,
        supplementGroupId: null,
        supplementGroup: null,
      },
      {
        id: "sup-unpriced",
        name: "Tarjeta impresa",
        description: "",
        active: true,
        supplementGroupId: null,
        supplementGroup: null,
      },
    ]);
    mockSupplementPriceFindMany.mockResolvedValue([
      { supplementId: "sup-priced", price: 1200 },
    ]);

    const catalog = await fetchLicenseCatalog();

    expect(catalog[0].supplements.map((s) => s.name)).toEqual([
      "Seguro ampliado",
    ]);
  });

  it("drops a type left with no priced modality", async () => {
    const { fetchLicenseCatalog } = await import("../license-catalog");
    mockTypeFindMany.mockResolvedValue([
      {
        id: "lt-1",
        name: "FERM",
        description: "",
        active: true,
        subtypes: [
          {
            id: "st-1",
            name: "BÁSICA A",
            description: "",
            active: true,
            licenseTypeId: "lt-1",
          },
        ],
      },
    ]);
    mockOfferingFindMany.mockResolvedValue([]);

    const catalog = await fetchLicenseCatalog();

    expect(catalog).toEqual([]);
  });
});
