import { describe, expect, it } from "vitest";
import { formatSeasonLabel } from "../season-label";

describe("formatSeasonLabel", () => {
  it("spells out the stored key", () => {
    expect(formatSeasonLabel("2026-2027")).toBe("Temporada 2026 / 2027");
  });

  it("leaves a name that is already one year alone", () => {
    expect(formatSeasonLabel("2026")).toBe("Temporada 2026");
  });
});
