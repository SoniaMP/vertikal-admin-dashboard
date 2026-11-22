import { describe, expect, it } from "vitest";
import { isClosedSeason } from "../closed-season";

describe("isClosedSeason", () => {
  it("closes a year that already went by", () => {
    expect(isClosedSeason(2025, 2026)).toBe(true);
  });

  it("leaves the current year open", () => {
    expect(isClosedSeason(2026, 2026)).toBe(false);
  });

  it("leaves a year still to come open", () => {
    expect(isClosedSeason(2027, 2026)).toBe(false);
  });

  it("keeps the current year open even once the next one sells", () => {
    // From mid-December the season in force is already 2027, but 2026 runs
    // to the 31st and its prices must stay editable until it does.
    expect(isClosedSeason(2026, 2026)).toBe(false);
  });
});
