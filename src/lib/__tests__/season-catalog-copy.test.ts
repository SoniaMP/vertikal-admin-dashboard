import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Prisma } from "@prisma/client";
import { createFakeCatalogTx } from "./helpers/fake-catalog-tx";

const mockCopyEntities = vi.fn();
const mockCopyPrices = vi.fn();
const mockCopyLinks = vi.fn();

vi.mock("@/lib/season-entity-copy", () => ({
  copySeasonEntities: (...args: unknown[]) => mockCopyEntities(...args),
}));

vi.mock("@/lib/season-price-copy", () => ({
  copySeasonPrices: (...args: unknown[]) => mockCopyPrices(...args),
}));

vi.mock("@/lib/season-link-copy", () => ({
  copySeasonSupplementLinks: (...args: unknown[]) => mockCopyLinks(...args),
}));

const MAPS = { types: new Map(), subtypes: new Map() };

/** How many tx calls had been made by the time the entity copy was reached. */
let callsBeforeEntityCopy = 0;

async function copyCatalog() {
  const fake = createFakeCatalogTx();
  mockCopyEntities.mockImplementation(async () => {
    callsBeforeEntityCopy = fake.calls.length;
    return MAPS;
  });

  const { copySeasonCatalog } = await import("@/lib/season-catalog-copy");
  await copySeasonCatalog(
    fake.tx as unknown as Prisma.TransactionClient,
    "season-2026",
    "season-2027",
  );
  return fake;
}

describe("copySeasonCatalog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    callsBeforeEntityCopy = 0;
  });

  it("wipes all eight catalog tables of the target", async () => {
    const { calls } = await copyCatalog();

    expect(calls.filter((call) => call.startsWith("deleteMany:"))).toHaveLength(
      8,
    );
  });

  it("finishes the wipe before copying anything in", async () => {
    await copyCatalog();

    expect(callsBeforeEntityCopy).toBe(8);
  });

  it("deletes the prices before the rows they point at", async () => {
    const { calls } = await copyCatalog();

    expect(calls.indexOf("deleteMany:licenseOffering")).toBeLessThan(
      calls.indexOf("deleteMany:licenseSubtype"),
    );
    expect(calls.indexOf("deleteMany:supplementPrice")).toBeLessThan(
      calls.indexOf("deleteMany:supplement"),
    );
    expect(calls.indexOf("deleteMany:supplementGroupPrice")).toBeLessThan(
      calls.indexOf("deleteMany:supplementGroup"),
    );
  });

  it("deletes each child before the parent it points at", async () => {
    const { calls } = await copyCatalog();

    expect(calls.indexOf("deleteMany:licenseSubtype")).toBeLessThan(
      calls.indexOf("deleteMany:licenseType"),
    );
    expect(calls.indexOf("deleteMany:supplement")).toBeLessThan(
      calls.indexOf("deleteMany:supplementGroup"),
    );
  });

  it("feeds the id maps from the entity copy into the price copy", async () => {
    const fake = await copyCatalog();

    expect(mockCopyEntities).toHaveBeenCalledWith(
      fake.tx,
      "season-2026",
      "season-2027",
    );
    expect(mockCopyPrices).toHaveBeenCalledWith(
      fake.tx,
      "season-2026",
      "season-2027",
      MAPS,
    );
  });

  it("feeds the same id maps into the link copy", async () => {
    const fake = await copyCatalog();

    // No target season goes in: a link is a pair of ids, and the federation it
    // names already belongs to the year it was copied into.
    expect(mockCopyLinks).toHaveBeenCalledWith(fake.tx, "season-2026", MAPS);
  });

  it("copies the links only once the rows they point at exist", async () => {
    await copyCatalog();

    expect(mockCopyEntities.mock.invocationCallOrder[0]).toBeLessThan(
      mockCopyLinks.mock.invocationCallOrder[0],
    );
  });
});
