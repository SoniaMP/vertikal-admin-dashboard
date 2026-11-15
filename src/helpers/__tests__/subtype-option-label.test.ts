import { describe, it, expect } from "vitest";
import { subtypeOptionLabel } from "../subtype-option-label";

describe("subtypeOptionLabel", () => {
  it("hides a description that is just the name as a slug", () => {
    expect(
      subtypeOptionLabel({ name: "BÁSICA A", description: "basicaa" }),
    ).toBe("BÁSICA A");
  });

  it("keeps a description that adds information", () => {
    expect(
      subtypeOptionLabel({
        name: "BÁSICA A",
        description: "Escalada en roca y vías ferratas",
      }),
    ).toBe("BÁSICA A - Escalada en roca y vías ferratas");
  });

  it("handles a missing or blank description", () => {
    expect(subtypeOptionLabel({ name: "DEPORTIVA" })).toBe("DEPORTIVA");
    expect(subtypeOptionLabel({ name: "DEPORTIVA", description: null })).toBe(
      "DEPORTIVA",
    );
    expect(subtypeOptionLabel({ name: "DEPORTIVA", description: "  " })).toBe(
      "DEPORTIVA",
    );
  });
});
