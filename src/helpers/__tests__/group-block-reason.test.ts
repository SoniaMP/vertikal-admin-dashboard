import { describe, it, expect } from "vitest";
import { groupBlockReason } from "../group-block-reason";
import type { SellabilityLookups } from "../supplement-block-reason";

const GROUP = { id: "g1", active: true, supplements: [{ active: true }] };

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

  it("reports an empty group, priced and linked though it is", () => {
    // The wizard builds a federation's groups from the supplements that landed
    // there, so this one reaches nobody however well it is configured.
    expect(groupBlockReason({ ...GROUP, supplements: [] }, lookups())).toBe(
      "no-members",
    );
  });

  it("reports a group whose every member is retired", () => {
    expect(
      groupBlockReason({ ...GROUP, supplements: [{ active: false }] }, lookups()),
    ).toBe("no-members");
  });

  it("still sells a group with one live member among retired ones", () => {
    const supplements = [{ active: false }, { active: true }];

    expect(groupBlockReason({ ...GROUP, supplements }, lookups())).toBeNull();
  });

  it("calls a retired empty group retired, the deliberate act first", () => {
    expect(
      groupBlockReason(
        { ...GROUP, active: false, supplements: [] },
        lookups(),
      ),
    ).toBe("retired");
  });
});
