import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSupplementFindMany = vi.fn();
const mockPriceFindMany = vi.fn();
const mockGroupPriceFindMany = vi.fn();
const mockLinkFindMany = vi.fn();
const mockGroupLinkFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    supplement: { findMany: (...a: unknown[]) => mockSupplementFindMany(...a) },
    supplementPrice: { findMany: (...a: unknown[]) => mockPriceFindMany(...a) },
    supplementGroupPrice: {
      findMany: (...a: unknown[]) => mockGroupPriceFindMany(...a),
    },
    licenseTypeSupplement: {
      findMany: (...a: unknown[]) => mockLinkFindMany(...a),
    },
    licenseTypeSupplementGroup: {
      findMany: (...a: unknown[]) => mockGroupLinkFindMany(...a),
    },
  },
}));

const GROUP = { id: "grp-1", name: "Pack seguro", active: true };

function standalone(id: string, name: string) {
  return {
    id,
    name,
    active: true,
    supplementGroupId: null,
    supplementGroup: null,
  };
}

function grouped(
  id: string,
  name: string,
  group: { id: string; name: string; active: boolean } = GROUP,
) {
  return {
    id,
    name,
    active: true,
    supplementGroupId: group.id,
    supplementGroup: group,
  };
}

describe("resolveSupplements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPriceFindMany.mockResolvedValue([]);
    mockGroupPriceFindMany.mockResolvedValue([]);
    mockLinkFindMany.mockResolvedValue([]);
    mockGroupLinkFindMany.mockResolvedValue([]);
  });

  it("charges nothing when nothing was picked", async () => {
    const { resolveSupplements } = await import("../checkout-supplements");

    const pricing = await resolveSupplements([], "season-1", "lt-1");

    expect(pricing.supplementsTotal).toBe(0);
    expect(mockSupplementFindMany).not.toHaveBeenCalled();
  });

  it("asks only for this season's supplements", async () => {
    const { resolveSupplements } = await import("../checkout-supplements");
    mockSupplementFindMany.mockResolvedValue([standalone("sup-1", "Tarjeta")]);
    mockPriceFindMany.mockResolvedValue([
      { supplementId: "sup-1", price: 1200 },
    ]);
    mockLinkFindMany.mockResolvedValue([
      { typeId: "lt-1", supplementId: "sup-1" },
    ]);

    await resolveSupplements(["sup-1"], "season-1", "lt-1");

    expect(mockSupplementFindMany).toHaveBeenCalledWith({
      where: { id: { in: ["sup-1"] }, seasonId: "season-1" },
      include: { supplementGroup: true },
    });
  });

  it("prices a supplement the chosen federation offers", async () => {
    const { resolveSupplements } = await import("../checkout-supplements");
    mockSupplementFindMany.mockResolvedValue([standalone("sup-1", "Tarjeta")]);
    mockPriceFindMany.mockResolvedValue([
      { supplementId: "sup-1", price: 1200 },
    ]);
    mockLinkFindMany.mockResolvedValue([
      { typeId: "lt-1", supplementId: "sup-1" },
    ]);

    const pricing = await resolveSupplements(["sup-1"], "season-1", "lt-1");

    expect(pricing.supplementsTotal).toBe(1200);
    expect(pricing.lineItems).toEqual([{ name: "Tarjeta", price: 1200 }]);
    expect(pricing.supplements).toEqual([
      { supplementId: "sup-1", priceAtTime: 1200 },
    ]);
  });

  it("rejects a priced supplement the chosen federation does not offer", async () => {
    const { resolveSupplements } = await import("../checkout-supplements");
    mockSupplementFindMany.mockResolvedValue([standalone("sup-1", "Tarjeta")]);
    mockPriceFindMany.mockResolvedValue([
      { supplementId: "sup-1", price: 1200 },
    ]);
    // Linked somewhere, just not to the federation being bought.
    mockLinkFindMany.mockResolvedValue([]);

    await expect(
      resolveSupplements(["sup-1"], "season-1", "lt-1"),
    ).rejects.toThrow("Suplementos inválidos");
  });

  it("looks for links in the federation being bought", async () => {
    const { resolveSupplements } = await import("../checkout-supplements");
    mockSupplementFindMany.mockResolvedValue([standalone("sup-1", "Tarjeta")]);
    mockPriceFindMany.mockResolvedValue([
      { supplementId: "sup-1", price: 1200 },
    ]);
    mockLinkFindMany.mockResolvedValue([
      { typeId: "lt-1", supplementId: "sup-1" },
    ]);

    await resolveSupplements(["sup-1"], "season-1", "lt-1");

    expect(mockLinkFindMany).toHaveBeenCalledWith({
      where: { typeId: "lt-1", supplementId: { in: ["sup-1"] } },
    });
  });

  it("rejects a supplement that is not in the season at all", async () => {
    const { resolveSupplements } = await import("../checkout-supplements");
    mockSupplementFindMany.mockResolvedValue([]);

    await expect(
      resolveSupplements(["sup-other-season"], "season-1", "lt-1"),
    ).rejects.toThrow("Suplementos inválidos");
  });

  it("rejects a retired supplement", async () => {
    const { resolveSupplements } = await import("../checkout-supplements");
    mockSupplementFindMany.mockResolvedValue([
      { ...standalone("sup-1", "Tarjeta"), active: false },
    ]);
    mockPriceFindMany.mockResolvedValue([
      { supplementId: "sup-1", price: 1200 },
    ]);
    mockLinkFindMany.mockResolvedValue([
      { typeId: "lt-1", supplementId: "sup-1" },
    ]);

    await expect(
      resolveSupplements(["sup-1"], "season-1", "lt-1"),
    ).rejects.toThrow("Suplementos inválidos");
  });

  it("rejects a live supplement whose group is retired", async () => {
    const { resolveSupplements } = await import("../checkout-supplements");
    const retiredGroup = { ...GROUP, active: false };
    mockSupplementFindMany.mockResolvedValue([
      grouped("sup-1", "Seguro", retiredGroup),
    ]);
    mockGroupPriceFindMany.mockResolvedValue([
      { groupId: "grp-1", price: 3000 },
    ]);
    mockGroupLinkFindMany.mockResolvedValue([
      { typeId: "lt-1", groupId: "grp-1" },
    ]);

    await expect(
      resolveSupplements(["sup-1"], "season-1", "lt-1"),
    ).rejects.toThrow("Suplementos inválidos");
  });

  it("rejects a grouped supplement whose group the federation does not offer", async () => {
    const { resolveSupplements } = await import("../checkout-supplements");
    mockSupplementFindMany.mockResolvedValue([grouped("sup-1", "Seguro")]);
    mockGroupPriceFindMany.mockResolvedValue([
      { groupId: "grp-1", price: 3000 },
    ]);
    // The supplement's own link is ignored: the group decides.
    mockLinkFindMany.mockResolvedValue([
      { typeId: "lt-1", supplementId: "sup-1" },
    ]);

    await expect(
      resolveSupplements(["sup-1"], "season-1", "lt-1"),
    ).rejects.toThrow("Suplementos inválidos");
  });

  it("charges a group once when the federation offers it", async () => {
    const { resolveSupplements } = await import("../checkout-supplements");
    mockSupplementFindMany.mockResolvedValue([
      grouped("sup-1", "Seguro"),
      grouped("sup-2", "Tarjeta"),
    ]);
    mockGroupPriceFindMany.mockResolvedValue([
      { groupId: "grp-1", price: 3000 },
    ]);
    mockGroupLinkFindMany.mockResolvedValue([
      { typeId: "lt-1", groupId: "grp-1" },
    ]);

    const pricing = await resolveSupplements(
      ["sup-1", "sup-2"],
      "season-1",
      "lt-1",
    );

    expect(pricing.supplementsTotal).toBe(3000);
    expect(pricing.lineItems).toEqual([{ name: "Pack seguro", price: 3000 }]);
  });

  it("still names the supplement when the club left it unpriced", async () => {
    const { resolveSupplements } = await import("../checkout-supplements");
    mockSupplementFindMany.mockResolvedValue([standalone("sup-1", "Tarjeta")]);
    mockLinkFindMany.mockResolvedValue([
      { typeId: "lt-1", supplementId: "sup-1" },
    ]);

    await expect(
      resolveSupplements(["sup-1"], "season-1", "lt-1"),
    ).rejects.toThrow('El suplemento "Tarjeta" no tiene precio');
  });
});
