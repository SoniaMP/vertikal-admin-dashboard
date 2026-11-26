import { describe, it, expect } from "vitest";
import type { Prisma } from "@prisma/client";
import { copySeasonSupplementLinks } from "@/lib/season-link-copy";
import type { CatalogIdMaps } from "@/lib/season-entity-copy";
import { createFakeCatalogTx } from "./helpers/fake-catalog-tx";

const SOURCE = "season-2026";

function maps(overrides: Partial<CatalogIdMaps> = {}): CatalogIdMaps {
  return {
    types: new Map([["ferm-2026", "ferm-2027"]]),
    subtypes: new Map(),
    categories: new Map(),
    supplements: new Map([["tarjeta-2026", "tarjeta-2027"]]),
    groups: new Map([["espeleo-2026", "espeleo-2027"]]),
    ...overrides,
  };
}

function link(typeId: string, supplementId: string) {
  return { seasonId: SOURCE, typeId, supplementId };
}

function groupLink(typeId: string, groupId: string) {
  return { seasonId: SOURCE, typeId, groupId };
}

async function copy(
  seed: Parameters<typeof createFakeCatalogTx>[0],
  idMaps: CatalogIdMaps = maps(),
) {
  const fake = createFakeCatalogTx(seed);
  await copySeasonSupplementLinks(
    fake.tx as unknown as Prisma.TransactionClient,
    SOURCE,
    idMaps,
  );
  return fake;
}

describe("copySeasonSupplementLinks", () => {
  it("points a standalone link at both copies, never at the originals", async () => {
    const { created } = await copy({
      licenseTypeSupplement: [link("ferm-2026", "tarjeta-2026")],
    });

    expect(created.licenseTypeSupplement).toEqual([
      { typeId: "ferm-2027", supplementId: "tarjeta-2027" },
    ]);
  });

  it("points a group link at both copies", async () => {
    const { created } = await copy({
      licenseTypeSupplementGroup: [groupLink("ferm-2026", "espeleo-2026")],
    });

    expect(created.licenseTypeSupplementGroup).toEqual([
      { typeId: "ferm-2027", groupId: "espeleo-2027" },
    ]);
  });

  it("carries every federation a supplement was offered in", async () => {
    const { created } = await copy(
      {
        licenseTypeSupplement: [
          link("ferm-2026", "tarjeta-2026"),
          link("fedme-2026", "tarjeta-2026"),
        ],
      },
      maps({
        types: new Map([
          ["ferm-2026", "ferm-2027"],
          ["fedme-2026", "fedme-2027"],
        ]),
      }),
    );

    expect(created.licenseTypeSupplement).toEqual([
      { typeId: "ferm-2027", supplementId: "tarjeta-2027" },
      { typeId: "fedme-2027", supplementId: "tarjeta-2027" },
    ]);
  });

  it("drops a link whose federation did not travel", async () => {
    const { created } = await copy({
      licenseTypeSupplement: [link("retirada-2026", "tarjeta-2026")],
    });

    expect(created.licenseTypeSupplement).toEqual([]);
  });

  it("drops a link whose supplement did not travel", async () => {
    const { created } = await copy({
      licenseTypeSupplement: [link("ferm-2026", "fantasma-2026")],
    });

    expect(created.licenseTypeSupplement).toEqual([]);
  });

  it("drops a group link whose group did not travel", async () => {
    const { created } = await copy({
      licenseTypeSupplementGroup: [groupLink("ferm-2026", "fantasma-2026")],
    });

    expect(created.licenseTypeSupplementGroup).toEqual([]);
  });

  it("leaves the other season's links alone", async () => {
    const { created } = await copy({
      licenseTypeSupplement: [
        { seasonId: "season-2029", typeId: "ferm-2026", supplementId: "tarjeta-2026" },
      ],
    });

    expect(created.licenseTypeSupplement).toEqual([]);
  });

  it("writes nothing at all when the year offered nothing", async () => {
    const { calls } = await copy({});

    expect(calls).toEqual([]);
  });
});
