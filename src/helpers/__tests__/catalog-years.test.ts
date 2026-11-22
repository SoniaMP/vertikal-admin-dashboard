import { describe, expect, it } from "vitest";
import { buildCatalogYears } from "../catalog-years";

describe("buildCatalogYears", () => {
  it("runs from the earliest season on record to five years ahead", () => {
    expect(buildCatalogYears([2024, 2026], 2026)).toEqual([
      2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031,
    ]);
  });

  it("starts at the current year when nothing is on record yet", () => {
    expect(buildCatalogYears([], 2026)).toEqual([
      2026, 2027, 2028, 2029, 2030, 2031,
    ]);
  });

  it("keeps a season older than the current year as the first entry", () => {
    expect(buildCatalogYears([2019], 2026)[0]).toBe(2019);
  });

  it("never starts later than the current year, whatever is on record", () => {
    expect(buildCatalogYears([2030], 2026)[0]).toBe(2026);
  });
});
