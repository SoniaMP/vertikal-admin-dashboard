import { describe, it, expect } from "vitest";
import {
  supplementBlockReason,
  type SellabilityLookups,
} from "../supplement-block-reason";

const CARD = { id: "s1", active: true, supplementGroup: null };
const LIVE_GROUP = { id: "g1", active: true };
const RESCUE = { id: "s2", active: true, supplementGroup: LIVE_GROUP };

function lookups(overrides: Partial<SellabilityLookups> = {}): SellabilityLookups {
  return {
    priceBySupplementId: new Map(),
    priceByGroupId: new Map(),
    linkedSupplementIds: new Set(),
    linkedGroupIds: new Set(),
    ...overrides,
  };
}

describe("supplementBlockReason", () => {
  it("sells a standalone supplement with a price and a federation", () => {
    const reason = supplementBlockReason(
      CARD,
      lookups({
        priceBySupplementId: new Map([["s1", 500]]),
        linkedSupplementIds: new Set(["s1"]),
      }),
    );

    expect(reason).toBeNull();
  });

  it("sells a grouped supplement through its group's price and federations", () => {
    const reason = supplementBlockReason(
      RESCUE,
      lookups({
        priceByGroupId: new Map([["g1", 2500]]),
        linkedGroupIds: new Set(["g1"]),
      }),
    );

    expect(reason).toBeNull();
  });

  it("reports a retired supplement before anything else", () => {
    const reason = supplementBlockReason(
      { ...CARD, active: false },
      lookups(),
    );

    expect(reason).toBe("retired");
  });

  it("reports a live supplement whose group is retired", () => {
    const reason = supplementBlockReason(
      { ...RESCUE, supplementGroup: { id: "g1", active: false } },
      lookups({
        priceByGroupId: new Map([["g1", 2500]]),
        linkedGroupIds: new Set(["g1"]),
      }),
    );

    expect(reason).toBe("retired");
  });

  it("reports a standalone supplement with no season price", () => {
    const reason = supplementBlockReason(
      CARD,
      lookups({ linkedSupplementIds: new Set(["s1"]) }),
    );

    expect(reason).toBe("unpriced");
  });

  it("ignores a grouped supplement's own price: the group's is the one", () => {
    const reason = supplementBlockReason(
      RESCUE,
      lookups({
        priceBySupplementId: new Map([["s2", 1400]]),
        linkedGroupIds: new Set(["g1"]),
      }),
    );

    expect(reason).toBe("unpriced");
  });

  it("reports a priced standalone supplement offered in no federation", () => {
    const reason = supplementBlockReason(
      CARD,
      lookups({ priceBySupplementId: new Map([["s1", 500]]) }),
    );

    expect(reason).toBe("no-federations");
  });

  it("ignores a grouped supplement's own federations: the group's are the ones", () => {
    const reason = supplementBlockReason(
      RESCUE,
      lookups({
        priceByGroupId: new Map([["g1", 2500]]),
        linkedSupplementIds: new Set(["s2"]),
      }),
    );

    expect(reason).toBe("no-federations");
  });

  it("reports the price before the missing federation", () => {
    const reason = supplementBlockReason(CARD, lookups());

    expect(reason).toBe("unpriced");
  });
});
