import { describe, it, expect } from "vitest";
import { selectSellableSupplements } from "../sellable-supplements";

const CARD = { id: "s1", supplementGroupId: null };
const RESCUE = { id: "s2", supplementGroupId: "g1" };

function priceMap(entries: Record<string, number>) {
  return new Map(Object.entries(entries));
}

describe("selectSellableSupplements", () => {
  it("keeps a standalone supplement priced for the season", () => {
    const result = selectSellableSupplements(
      [CARD],
      priceMap({ s1: 500 }),
      priceMap({}),
    );

    expect(result).toEqual([CARD]);
  });

  it("drops a standalone supplement with no season price", () => {
    const result = selectSellableSupplements([CARD], priceMap({}), priceMap({}));

    expect(result).toEqual([]);
  });

  it("keeps a grouped supplement when its group is priced", () => {
    const result = selectSellableSupplements(
      [RESCUE],
      priceMap({}),
      priceMap({ g1: 2500 }),
    );

    expect(result).toEqual([RESCUE]);
  });

  it("drops a grouped supplement whose group is unpriced, own price or not", () => {
    const result = selectSellableSupplements(
      [RESCUE],
      priceMap({ s2: 1400 }),
      priceMap({}),
    );

    expect(result).toEqual([]);
  });
});
