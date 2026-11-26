import { describe, it, expect } from "vitest";
import { buildSupplementOfferByType } from "../supplement-offer-by-type";
import type { SellabilityLookups } from "../supplement-block-reason";

const CLIMBING = "t1";
const ALPINE = "t2";

const CARD = {
  id: "s1",
  name: "Tarjeta impresa",
  description: "La licencia en plástico",
  active: true,
  supplementGroupId: null,
  supplementGroup: null,
};

const RESCUE_GROUP = { id: "g1", name: "Rescate", active: true };

const RESCUE = {
  id: "s2",
  name: "Rescate ampliado",
  description: "Cobertura extra",
  active: true,
  supplementGroupId: "g1",
  supplementGroup: RESCUE_GROUP,
};

const HELI = {
  id: "s3",
  name: "Helicóptero",
  description: "Rescate aéreo",
  active: true,
  supplementGroupId: "g1",
  supplementGroup: RESCUE_GROUP,
};

function lookups(overrides: Partial<SellabilityLookups> = {}): SellabilityLookups {
  return {
    priceBySupplementId: new Map([["s1", 500]]),
    priceByGroupId: new Map([["g1", 2500]]),
    linkedSupplementIds: new Set(["s1"]),
    linkedGroupIds: new Set(["g1"]),
    ...overrides,
  };
}

const LINKS = {
  typeIdsBySupplementId: new Map([["s1", [CLIMBING]]]),
  typeIdsByGroupId: new Map([["g1", [ALPINE]]]),
};

describe("buildSupplementOfferByType", () => {
  it("offers a standalone supplement only in its own federations", () => {
    const offer = buildSupplementOfferByType([CARD], lookups(), LINKS);

    expect(offer.supplementsByTypeId.get(CLIMBING)?.map((s) => s.id)).toEqual([
      "s1",
    ]);
    expect(offer.supplementsByTypeId.get(ALPINE)).toBeUndefined();
  });

  it("offers a grouped supplement through its group's federations", () => {
    const offer = buildSupplementOfferByType([RESCUE], lookups(), LINKS);

    expect(offer.supplementsByTypeId.get(ALPINE)?.map((s) => s.id)).toEqual([
      "s2",
    ]);
    expect(offer.supplementsByTypeId.get(CLIMBING)).toBeUndefined();
  });

  it("ignores a grouped supplement's own links", () => {
    const offer = buildSupplementOfferByType([RESCUE], lookups(), {
      typeIdsBySupplementId: new Map([["s2", [CLIMBING]]]),
      typeIdsByGroupId: new Map([["g1", [ALPINE]]]),
    });

    expect(offer.supplementsByTypeId.get(CLIMBING)).toBeUndefined();
    expect(offer.supplementsByTypeId.get(ALPINE)).toHaveLength(1);
  });

  it("lists a federation's group once however many of its members land there", () => {
    const offer = buildSupplementOfferByType(
      [RESCUE, HELI],
      lookups(),
      LINKS,
    );

    expect(offer.supplementsByTypeId.get(ALPINE)).toHaveLength(2);
    expect(offer.groupsByTypeId.get(ALPINE)).toEqual([
      { id: "g1", name: "Rescate", price: 2500 },
    ]);
  });

  it("offers the same extra in every federation it is linked to", () => {
    const offer = buildSupplementOfferByType([CARD], lookups(), {
      typeIdsBySupplementId: new Map([["s1", [CLIMBING, ALPINE]]]),
      typeIdsByGroupId: new Map(),
    });

    expect(offer.supplementsByTypeId.get(CLIMBING)).toHaveLength(1);
    expect(offer.supplementsByTypeId.get(ALPINE)).toHaveLength(1);
  });

  it("offers nothing when the supplement is not sellable, links or not", () => {
    const offer = buildSupplementOfferByType(
      [{ ...CARD, active: false }],
      lookups(),
      LINKS,
    );

    expect(offer.supplementsByTypeId.size).toBe(0);
  });

  it("drops a retired group's members from every federation", () => {
    const retired = { ...RESCUE, supplementGroup: { ...RESCUE_GROUP, active: false } };
    const offer = buildSupplementOfferByType([retired], lookups(), LINKS);

    expect(offer.supplementsByTypeId.size).toBe(0);
    expect(offer.groupsByTypeId.size).toBe(0);
  });

  it("never lists a group with no sellable member inside it", () => {
    const offer = buildSupplementOfferByType(
      [RESCUE],
      lookups({ priceByGroupId: new Map() }),
      LINKS,
    );

    expect(offer.groupsByTypeId.get(ALPINE)).toBeUndefined();
  });

  it("carries the group's price into the summary, not the member's own", () => {
    const offer = buildSupplementOfferByType(
      [RESCUE],
      lookups({ priceBySupplementId: new Map([["s2", 1400]]) }),
      LINKS,
    );

    expect(offer.supplementsByTypeId.get(ALPINE)?.[0].supplementGroup).toEqual({
      id: "g1",
      name: "Rescate",
      price: 2500,
    });
  });
});
