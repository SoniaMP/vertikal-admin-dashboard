import { describe, it, expect } from "vitest";
import type { Prisma } from "@prisma/client";
import { copySeasonPrices } from "@/lib/season-price-copy";
import type { CatalogIdMaps } from "@/lib/season-entity-copy";
import { createFakeCatalogTx } from "./helpers/fake-catalog-tx";

const SOURCE = "season-2026";
const TARGET = "season-2027";

const MAPS: CatalogIdMaps = {
  types: new Map([["type-old", "type-new"]]),
  subtypes: new Map([["sub-old", "sub-new"]]),
  categories: new Map([["cat-old", "cat-new"]]),
  supplements: new Map([["sup-old", "sup-new"]]),
  groups: new Map([["grp-old", "grp-new"]]),
};

function seedPrices() {
  return {
    licenseOffering: [
      {
        id: "off-1",
        seasonId: SOURCE,
        typeId: "type-old",
        subtypeId: "sub-old",
        categoryId: "cat-old",
        price: 4500,
      },
    ],
    supplementPrice: [
      { id: "sp-1", seasonId: SOURCE, supplementId: "sup-old", price: 1200 },
    ],
    supplementGroupPrice: [
      { id: "gp-1", seasonId: SOURCE, groupId: "grp-old", price: 2000 },
    ],
  };
}

async function copy(seed: Record<string, unknown[]>) {
  const fake = createFakeCatalogTx(seed);
  await copySeasonPrices(
    fake.tx as unknown as Prisma.TransactionClient,
    SOURCE,
    TARGET,
    MAPS,
  );
  return fake;
}

describe("copySeasonPrices", () => {
  it("rebuilds an offering against the copied entities", async () => {
    const { created } = await copy(seedPrices());

    expect(created.licenseOffering).toEqual([
      {
        seasonId: TARGET,
        typeId: "type-new",
        subtypeId: "sub-new",
        categoryId: "cat-new",
        price: 4500,
      },
    ]);
  });

  it("carries the price across untouched", async () => {
    const { created } = await copy(seedPrices());

    expect(created.supplementPrice[0].price).toBe(1200);
    expect(created.supplementGroupPrice[0].price).toBe(2000);
  });

  it("files every price under the target season", async () => {
    const { created } = await copy(seedPrices());

    expect(created.supplementPrice[0].seasonId).toBe(TARGET);
    expect(created.supplementGroupPrice[0].seasonId).toBe(TARGET);
  });

  it("drops an offering whose entity did not come across", async () => {
    const seed = seedPrices();
    seed.licenseOffering[0].categoryId = "cat-retirada";

    const { created } = await copy(seed);

    expect(created.licenseOffering).toHaveLength(0);
  });

  it("drops a supplement price whose supplement did not come across", async () => {
    const seed = seedPrices();
    seed.supplementPrice[0].supplementId = "sup-retirado";

    const { created } = await copy(seed);

    expect(created.supplementPrice).toHaveLength(0);
  });

  it("drops a group price whose group did not come across", async () => {
    const seed = seedPrices();
    seed.supplementGroupPrice[0].groupId = "grp-retirado";

    const { created } = await copy(seed);

    expect(created.supplementGroupPrice).toHaveLength(0);
  });

  it("writes nothing when the source season has no prices", async () => {
    const { calls } = await copy({});

    expect(calls).toEqual([]);
  });
});
