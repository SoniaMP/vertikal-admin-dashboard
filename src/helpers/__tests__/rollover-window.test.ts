import { describe, it, expect } from "vitest";
import { resolveRolloverWindow } from "@/helpers/rollover-window";
import { resolveTargetSeasonYear } from "@/helpers/target-season-year";

const TODAY = new Date("2026-11-23T12:00:00");

describe("resolveRolloverWindow", () => {
  it("opens on 17 December with the default fifteen days", () => {
    const { year, opensOn } = resolveRolloverWindow(TODAY, 15);

    expect(year).toBe(2027);
    expect(opensOn.getMonth()).toBe(11);
    expect(opensOn.getDate()).toBe(17);
    expect(opensOn.getFullYear()).toBe(2026);
  });

  it("opens on 16 December when the club asks for sixteen days", () => {
    expect(resolveRolloverWindow(TODAY, 16).opensOn.getDate()).toBe(16);
  });

  it("opens on 1 January when the club turns the window off", () => {
    const { opensOn } = resolveRolloverWindow(TODAY, 0);

    expect(opensOn.getFullYear()).toBe(2027);
    expect(opensOn.getMonth()).toBe(0);
    expect(opensOn.getDate()).toBe(1);
  });

  it("agrees with the rule that actually assigns the season", () => {
    for (const days of [0, 1, 15, 16, 30, 45]) {
      const { year, opensOn } = resolveRolloverWindow(TODAY, days);
      const dayBefore = new Date(opensOn);
      dayBefore.setDate(dayBefore.getDate() - 1);

      expect(resolveTargetSeasonYear(opensOn, days)).toBe(year);
      expect(resolveTargetSeasonYear(dayBefore, days)).toBe(year - 1);
    }
  });
});
