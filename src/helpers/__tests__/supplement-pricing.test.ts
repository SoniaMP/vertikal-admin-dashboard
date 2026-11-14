import { describe, it, expect } from "vitest";
import { priceSupplements } from "../supplement-pricing";
import type { SelectedSupplement, SeasonPrices } from "../supplement-pricing";
import { CheckoutError } from "@/lib/checkout-error";

const GROUP = { name: "Espeleo" };

function supplement(
  id: string,
  name: string,
  groupId: string | null = null,
): SelectedSupplement {
  return {
    id,
    name,
    supplementGroupId: groupId,
    supplementGroup: groupId === null ? null : GROUP,
  };
}

function prices(
  bySupplementId: Record<string, number>,
  byGroupId: Record<string, number> = {},
): SeasonPrices {
  return {
    bySupplementId: new Map(Object.entries(bySupplementId)),
    byGroupId: new Map(Object.entries(byGroupId)),
  };
}

describe("priceSupplements", () => {
  it("charges a standalone supplement its season price", () => {
    const result = priceSupplements(
      [supplement("s1", "Seguro ampliado")],
      prices({ s1: 1200 }),
    );

    expect(result.lineItems).toEqual([{ name: "Seguro ampliado", price: 1200 }]);
    expect(result.supplementsTotal).toBe(1200);
  });

  it("refuses a standalone supplement with no price for the season", () => {
    expect(() =>
      priceSupplements([supplement("s1", "Tarjeta impresa")], prices({})),
    ).toThrow(CheckoutError);
  });

  it("names the offending supplement so the member can report it", () => {
    expect(() =>
      priceSupplements([supplement("s1", "Tarjeta impresa")], prices({})),
    ).toThrow(/Tarjeta impresa/);
  });

  it("bills a group once however many of its supplements were picked", () => {
    const result = priceSupplements(
      [
        supplement("s1", "Rescate vertical", "g1"),
        supplement("s2", "Rescate acuático", "g1"),
      ],
      prices({ s1: 1400, s2: 1600 }, { g1: 2500 }),
    );

    expect(result.lineItems).toEqual([{ name: "Espeleo", price: 2500 }]);
    expect(result.supplementsTotal).toBe(2500);
  });

  it("ignores an individual price set on a grouped supplement", () => {
    const result = priceSupplements(
      [supplement("s1", "Rescate vertical", "g1")],
      prices({ s1: 9900 }, { g1: 2500 }),
    );

    expect(result.supplementsTotal).toBe(2500);
  });

  it("refuses a grouped supplement whose group has no price this season", () => {
    expect(() =>
      priceSupplements(
        [supplement("s1", "Rescate vertical", "g1")],
        prices({ s1: 1400 }),
      ),
    ).toThrow(CheckoutError);
  });

  it("records a standalone supplement at its own season price", () => {
    const result = priceSupplements(
      [supplement("s1", "Seguro ampliado")],
      prices({ s1: 1200 }),
    );

    expect(result.supplements).toEqual([
      { supplementId: "s1", priceAtTime: 1200 },
    ]);
  });

  it("records the group price, not the individual one, on a grouped supplement", () => {
    const result = priceSupplements(
      [supplement("s1", "Rescate vertical", "g1")],
      prices({ s1: 1400 }, { g1: 2500 }),
    );

    expect(result.supplements).toEqual([
      { supplementId: "s1", priceAtTime: 2500 },
    ]);
  });

  it("records the group price on every chosen supplement of the group", () => {
    const result = priceSupplements(
      [
        supplement("s1", "Rescate vertical", "g1"),
        supplement("s2", "Rescate acuático", "g1"),
      ],
      prices({ s1: 1400, s2: 1600 }, { g1: 2500 }),
    );

    expect(result.supplements).toEqual([
      { supplementId: "s1", priceAtTime: 2500 },
      { supplementId: "s2", priceAtTime: 2500 },
    ]);
    // The group still bills once: these two rows are not two charges.
    expect(result.supplementsTotal).toBe(2500);
  });

  it("adds up standalone and grouped supplements", () => {
    const result = priceSupplements(
      [
        supplement("s1", "Seguro ampliado"),
        supplement("s2", "Rescate vertical", "g1"),
      ],
      prices({ s1: 1200, s2: 1400 }, { g1: 2500 }),
    );

    expect(result.supplementsTotal).toBe(3700);
  });
});
