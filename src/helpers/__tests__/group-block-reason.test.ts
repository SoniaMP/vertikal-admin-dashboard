import { describe, it, expect } from "vitest";
import { groupBlockReason } from "../group-block-reason";
import type { SellabilityLookups } from "../supplement-block-reason";

const GROUP = { id: "g1", active: true };

function lookups(overrides: Partial<SellabilityLookups> = {}): SellabilityLookups {
  return {
    priceBySupplementId: new Map(),
    priceByGroupId: new Map([["g1", 2500]]),
    linkedSupplementIds: new Set(),
    linkedGroupIds: new Set(["g1"]),
    ...overrides,
  };
}

describe("groupBlockReason", () => {
  it("sells a group with a price and a federation", () => {
    expect(groupBlockReason(GROUP, lookups())).toBeNull();
  });

  it("reports a retired group", () => {
    expect(groupBlockReason({ ...GROUP, active: false }, lookups())).toBe(
      "retired",
    );
  });

  it("reports a group with no season price", () => {
    expect(
      groupBlockReason(GROUP, lookups({ priceByGroupId: new Map() })),
    ).toBe("unpriced");
  });

  it("reports a group offered in no federation", () => {
    expect(
      groupBlockReason(GROUP, lookups({ linkedGroupIds: new Set() })),
    ).toBe("no-federations");
  });
});
