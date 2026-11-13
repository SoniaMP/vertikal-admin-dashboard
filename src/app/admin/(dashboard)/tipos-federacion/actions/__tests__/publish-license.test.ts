import { describe, it, expect, vi, beforeEach } from "vitest";

const mockOfferingFindMany = vi.fn();
const mockOfferingCount = vi.fn();
const mockTypeUpdate = vi.fn();
const mockSubtypeUpdate = vi.fn();
const mockSubtypeUpdateMany = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    licenseOffering: {
      findMany: (...args: unknown[]) => mockOfferingFindMany(...args),
      count: (...args: unknown[]) => mockOfferingCount(...args),
    },
    licenseType: { update: (...args: unknown[]) => mockTypeUpdate(...args) },
    licenseSubtype: {
      update: (...args: unknown[]) => mockSubtypeUpdate(...args),
      updateMany: (...args: unknown[]) => mockSubtypeUpdateMany(...args),
    },
    $transaction: (fn: (tx: unknown) => Promise<void>) => mockTransaction(fn),
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "admin" } }),
}));

vi.mock("@/lib/settings", () => ({
  getActiveSeason: vi.fn().mockResolvedValue({ id: "season-1" }),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

describe("publishLicenseType", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockImplementation(
      async (fn: (tx: unknown) => Promise<void>) =>
        fn({
          licenseType: { update: mockTypeUpdate },
          licenseSubtype: { updateMany: mockSubtypeUpdateMany },
        }),
    );
  });

  it("refuses to publish a type with no price in the active season", async () => {
    const { publishLicenseType } = await import("../license-type-actions");
    mockOfferingFindMany.mockResolvedValue([]);

    const result = await publishLicenseType("lt-1");

    expect(result).toEqual({
      success: false,
      error:
        "No se puede publicar: todavía no tiene ningún precio en la temporada activa",
    });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("stamps publishedAt on the type", async () => {
    const { publishLicenseType } = await import("../license-type-actions");
    mockOfferingFindMany.mockResolvedValue([{ subtypeId: "st-1" }]);

    const result = await publishLicenseType("lt-1");

    expect(result).toEqual({ success: true });
    expect(mockTypeUpdate).toHaveBeenCalledWith({
      where: { id: "lt-1" },
      data: { publishedAt: expect.any(Date) },
    });
  });

  it("publishes the priced modalities along with the type, once each", async () => {
    const { publishLicenseType } = await import("../license-type-actions");
    mockOfferingFindMany.mockResolvedValue([
      { subtypeId: "st-1" },
      { subtypeId: "st-1" },
      { subtypeId: "st-2" },
    ]);

    await publishLicenseType("lt-1");

    expect(mockSubtypeUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ["st-1", "st-2"] }, publishedAt: null },
      data: { publishedAt: expect.any(Date) },
    });
  });

  it("only counts offerings whose modality and category are on offer", async () => {
    const { publishLicenseType } = await import("../license-type-actions");
    mockOfferingFindMany.mockResolvedValue([{ subtypeId: "st-1" }]);

    await publishLicenseType("lt-1");

    expect(mockOfferingFindMany).toHaveBeenCalledWith({
      where: {
        typeId: "lt-1",
        seasonId: "season-1",
        subtype: { active: true },
        category: { active: true },
      },
      select: { subtypeId: true },
    });
  });
});

describe("publishSubtype", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refuses to publish a modality with no price", async () => {
    const { publishSubtype } = await import("../subtype-actions");
    mockOfferingCount.mockResolvedValue(0);

    const result = await publishSubtype("st-1");

    expect(result.success).toBe(false);
    expect(mockSubtypeUpdate).not.toHaveBeenCalled();
  });

  it("stamps publishedAt when the modality has a price", async () => {
    const { publishSubtype } = await import("../subtype-actions");
    mockOfferingCount.mockResolvedValue(2);

    const result = await publishSubtype("st-1");

    expect(result).toEqual({ success: true });
    expect(mockSubtypeUpdate).toHaveBeenCalledWith({
      where: { id: "st-1" },
      data: { publishedAt: expect.any(Date) },
    });
  });
});
