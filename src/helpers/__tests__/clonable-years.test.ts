import { describe, expect, it } from "vitest";
import { selectClonableYears } from "../clonable-years";

describe("selectClonableYears", () => {
  it("offers the priced years, most recent first", () => {
    expect(selectClonableYears([2024, 2026, 2025], 2027)).toEqual([
      2026, 2025, 2024,
    ]);
  });

  it("never offers the year being filled", () => {
    expect(selectClonableYears([2025, 2026], 2026)).toEqual([2025]);
  });

  it("offers nothing when no year has prices yet", () => {
    expect(selectClonableYears([], 2027)).toEqual([]);
  });

  it("offers nothing when the only priced year is the target", () => {
    expect(selectClonableYears([2026], 2026)).toEqual([]);
  });
});
