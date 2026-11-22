import { describe, expect, it } from "vitest";
import { selectCatalogYear } from "../selected-catalog-year";

const AVAILABLE = [2025, 2026, 2027];

describe("selectCatalogYear", () => {
  it("takes the year from the param when it is on offer", () => {
    expect(selectCatalogYear("2027", AVAILABLE, 2026)).toBe(2027);
  });

  it("falls back when there is no param", () => {
    expect(selectCatalogYear(undefined, AVAILABLE, 2026)).toBe(2026);
  });

  it("falls back on a year nobody offers", () => {
    expect(selectCatalogYear("1999", AVAILABLE, 2026)).toBe(2026);
  });

  it("falls back on text that is not a year", () => {
    expect(selectCatalogYear("temporada", AVAILABLE, 2026)).toBe(2026);
  });

  it("falls back on an empty param instead of reading it as zero", () => {
    expect(selectCatalogYear("", AVAILABLE, 2026)).toBe(2026);
  });

  it("falls back on a decimal", () => {
    expect(selectCatalogYear("2026.5", AVAILABLE, 2026)).toBe(2026);
  });
});
