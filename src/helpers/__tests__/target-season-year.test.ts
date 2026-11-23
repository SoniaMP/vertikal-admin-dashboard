import { describe, it, expect } from "vitest";
import { resolveTargetSeasonYear } from "@/helpers/target-season-year";

const DAYS = 15;

describe("resolveTargetSeasonYear", () => {
  it("is the current year in the middle of the season", () => {
    expect(resolveTargetSeasonYear(new Date("2026-06-01T12:00:00"), DAYS)).toBe(
      2026,
    );
  });

  it("still is the current year the day before the window opens", () => {
    // 15 December + 15 days is 30 December: the year has not turned yet.
    expect(resolveTargetSeasonYear(new Date("2026-12-15T12:00:00"), DAYS)).toBe(
      2026,
    );
  });

  it("flips to the next year on the day the window opens", () => {
    // 16 December + 15 days is 31 December... still 2026. The window opens on
    // the 17th, the first day whose +15 lands in January.
    expect(resolveTargetSeasonYear(new Date("2026-12-17T12:00:00"), DAYS)).toBe(
      2027,
    );
  });

  it("stays on the next year through the rest of December", () => {
    expect(resolveTargetSeasonYear(new Date("2026-12-31T23:00:00"), DAYS)).toBe(
      2027,
    );
  });

  it("is the new year on 1 January, with no window to cross", () => {
    expect(resolveTargetSeasonYear(new Date("2027-01-01T00:30:00"), DAYS)).toBe(
      2027,
    );
  });

  it("opens the window earlier when the club asks for more days", () => {
    expect(resolveTargetSeasonYear(new Date("2026-12-05T12:00:00"), 30)).toBe(
      2027,
    );
    expect(resolveTargetSeasonYear(new Date("2026-12-05T12:00:00"), 15)).toBe(
      2026,
    );
  });

  it("never looks ahead when the club turns the window off", () => {
    expect(resolveTargetSeasonYear(new Date("2026-12-31T12:00:00"), 0)).toBe(
      2026,
    );
  });

  it("crosses a leap-year February without drifting", () => {
    expect(resolveTargetSeasonYear(new Date("2028-02-28T12:00:00"), 15)).toBe(
      2028,
    );
  });
});
