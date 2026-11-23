import { describe, it, expect } from "vitest";
import type { Prisma } from "@prisma/client";
import { copySeasonEntities } from "@/lib/season-entity-copy";
import { createFakeCatalogTx } from "./helpers/fake-catalog-tx";

const SOURCE = "season-2026";
const TARGET = "season-2027";

const PUBLISHED_AT = new Date("2026-01-15T10:00:00.000Z");

function seedCatalog() {
  return {
    category: [
      {
        id: "cat-infantil",
        seasonId: SOURCE,
        lineageId: "lin-infantil",
        name: "Infantil (4-13 años)",
        description: "Menores",
        active: true,
      },
    ],
    supplementGroup: [
      {
        id: "grp-seguros",
        seasonId: SOURCE,
        lineageId: "lin-seguros",
        name: "Seguros",
        active: true,
      },
    ],
    supplement: [
      {
        id: "sup-rescate",
        seasonId: SOURCE,
        lineageId: "lin-rescate",
        name: "Rescate",
        description: null,
        active: false,
        supplementGroupId: "grp-seguros",
      },
      {
        id: "sup-suelto",
        seasonId: SOURCE,
        lineageId: "lin-suelto",
        name: "Material",
        description: null,
        active: true,
        supplementGroupId: null,
      },
    ],
    licenseType: [
      {
        id: "type-ferm",
        seasonId: SOURCE,
        lineageId: "lin-ferm",
        name: "FERM",
        description: null,
        active: true,
        publishedAt: PUBLISHED_AT,
      },
    ],
    licenseSubtype: [
      {
        id: "sub-basica",
        seasonId: SOURCE,
        lineageId: "lin-basica",
        name: "BÁSICA",
        description: null,
        active: true,
        publishedAt: PUBLISHED_AT,
        licenseTypeId: "type-ferm",
      },
      {
        id: "sub-huerfano",
        seasonId: SOURCE,
        lineageId: "lin-huerfano",
        name: "Sin padre",
        description: null,
        active: true,
        publishedAt: null,
        licenseTypeId: "type-que-no-existe",
      },
    ],
  };
}

async function copy() {
  const fake = createFakeCatalogTx(seedCatalog());
  const maps = await copySeasonEntities(
    fake.tx as unknown as Prisma.TransactionClient,
    SOURCE,
    TARGET,
  );
  return { ...fake, maps };
}

describe("copySeasonEntities", () => {
  it("gives every copy a new id but keeps the lineage of its original", async () => {
    const { created, maps } = await copy();

    const category = created.category[0];
    expect(category.id).not.toBe("cat-infantil");
    expect(category.lineageId).toBe("lin-infantil");
    expect(maps.categories.get("cat-infantil")).toBe(category.id);
  });

  it("files every copy under the target season", async () => {
    const { created } = await copy();

    const everyRow = [
      ...created.category,
      ...created.supplementGroup,
      ...created.supplement,
      ...created.licenseType,
      ...created.licenseSubtype,
    ];
    expect(everyRow).not.toHaveLength(0);
    for (const row of everyRow) expect(row.seasonId).toBe(TARGET);
  });

  it("copies the retired state verbatim instead of reviving anything", async () => {
    const { created } = await copy();

    const rescate = created.supplement.find((row) => row.name === "Rescate");
    expect(rescate?.active).toBe(false);
    expect(created.licenseType[0].publishedAt).toBe(PUBLISHED_AT);
  });

  it("repoints a supplement at the copied group, never at the original", async () => {
    const { created, maps } = await copy();

    const rescate = created.supplement.find((row) => row.name === "Rescate");
    expect(rescate?.supplementGroupId).toBe(maps.groups.get("grp-seguros"));
    expect(rescate?.supplementGroupId).not.toBe("grp-seguros");
  });

  it("leaves an ungrouped supplement ungrouped", async () => {
    const { created } = await copy();

    const suelto = created.supplement.find((row) => row.name === "Material");
    expect(suelto?.supplementGroupId).toBeNull();
  });

  it("repoints a subtype at the copied parent type", async () => {
    const { created, maps } = await copy();

    const basica = created.licenseSubtype.find((row) => row.name === "BÁSICA");
    expect(basica?.licenseTypeId).toBe(maps.types.get("type-ferm"));
  });

  it("drops a subtype whose parent type did not come across", async () => {
    const { created, maps } = await copy();

    expect(created.licenseSubtype).toHaveLength(1);
    expect(maps.subtypes.has("sub-huerfano")).toBe(false);
  });

  it("creates each parent before the rows that point at it", async () => {
    const { calls } = await copy();

    expect(calls.indexOf("create:supplementGroup")).toBeLessThan(
      calls.indexOf("create:supplement"),
    );
    expect(calls.indexOf("create:licenseType")).toBeLessThan(
      calls.indexOf("create:licenseSubtype"),
    );
  });

  it("reads only the source season", async () => {
    const fake = createFakeCatalogTx(seedCatalog());
    await copySeasonEntities(
      fake.tx as unknown as Prisma.TransactionClient,
      "season-vacia",
      TARGET,
    );

    expect(fake.created.category).toHaveLength(0);
    expect(fake.created.licenseType).toHaveLength(0);
  });
});
