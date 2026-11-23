import { describe, it, expect } from "vitest";
import { formatRolloverWindow } from "@/helpers/rollover-window-label";

const TODAY = new Date("2026-11-23T12:00:00");

describe("formatRolloverWindow", () => {
  it("spells out the date the default produces", () => {
    expect(formatRolloverWindow(TODAY, 15)).toBe(
      "Con 15 días, las altas pasan a contar para la temporada 2027 a partir del 17 de diciembre de 2026.",
    );
  });

  it("shows the one-day difference that is easy to get wrong", () => {
    expect(formatRolloverWindow(TODAY, 16)).toContain("16 de diciembre de 2026");
  });

  it("says plainly that zero days means no early window", () => {
    const label = formatRolloverWindow(TODAY, 0);

    expect(label).toContain("Sin antelación");
    expect(label).toContain("1 de enero de 2027");
  });
});
