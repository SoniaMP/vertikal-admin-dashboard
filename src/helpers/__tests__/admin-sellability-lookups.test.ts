import { describe, it, expect } from "vitest";
import { buildAdminSellabilityLookups } from "../admin-sellability-lookups";

const PRICED = { id: "s1", prices: [{ price: 500 }], typeLinks: [{ typeId: "t1" }] };
const BARE = { id: "s2", prices: [], typeLinks: [] };
const GROUP = {
  id: "g1",
  groupPrices: [{ price: 2500 }],
  typeLinks: [{ typeId: "t2" }],
};

describe("buildAdminSellabilityLookups", () => {
  it("reads the season's price and links off each row", () => {
    const lookups = buildAdminSellabilityLookups([PRICED], [GROUP]);

    expect(lookups.priceBySupplementId.get("s1")).toBe(500);
    expect(lookups.priceByGroupId.get("g1")).toBe(2500);
    expect(lookups.linkedSupplementIds.has("s1")).toBe(true);
    expect(lookups.linkedGroupIds.has("g1")).toBe(true);
  });

  it("leaves out a row with no price and no links", () => {
    const lookups = buildAdminSellabilityLookups([PRICED, BARE], []);

    expect(lookups.priceBySupplementId.has("s2")).toBe(false);
    expect(lookups.linkedSupplementIds.has("s2")).toBe(false);
  });

  it("treats a zero price as a price, not as a missing one", () => {
    const lookups = buildAdminSellabilityLookups(
      [{ id: "s3", prices: [{ price: 0 }], typeLinks: [] }],
      [],
    );

    expect(lookups.priceBySupplementId.get("s3")).toBe(0);
  });
});
