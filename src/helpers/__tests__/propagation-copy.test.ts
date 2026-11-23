import { describe, it, expect } from "vitest";
import { describePropagation } from "@/helpers/propagation-copy";

const BASE = {
  entityLabel: "esta federativa",
  name: "FERM",
  isActive: true,
} as const;

describe("describePropagation", () => {
  it("names the single other season", () => {
    const copy = describePropagation({
      ...BASE,
      years: [2027],
      scope: "texts",
    });

    expect(copy.title).toBe("¿Aplicar el texto también en 2027?");
    expect(copy.confirmLabel).toBe("Aplicar en 2027");
  });

  it("joins two seasons with y", () => {
    const copy = describePropagation({
      ...BASE,
      years: [2027, 2028],
      scope: "texts",
    });

    expect(copy.title).toContain("2027 y 2028");
  });

  it("joins three seasons with commas and a final y", () => {
    const copy = describePropagation({
      ...BASE,
      years: [2027, 2028, 2029],
      scope: "texts",
    });

    expect(copy.title).toContain("2027, 2028 y 2029");
  });

  it("quotes the name and capitalizes the label", () => {
    const copy = describePropagation({
      ...BASE,
      years: [2027],
      scope: "texts",
    });

    expect(copy.description).toContain("Esta federativa «FERM»");
  });

  it("says what the state change was, so the question is not ambiguous", () => {
    const retired = describePropagation({
      ...BASE,
      isActive: false,
      years: [2027],
      scope: "state",
    });
    const revived = describePropagation({
      ...BASE,
      isActive: true,
      years: [2027],
      scope: "state",
    });

    expect(retired.title).toBe("¿Retirar también en 2027?");
    expect(revived.title).toBe("¿Reactivar también en 2027?");
  });

  it("makes clear that doing nothing leaves the other seasons alone", () => {
    const copy = describePropagation({
      ...BASE,
      years: [2027],
      scope: "texts",
    });

    expect(copy.description).toContain("así se queda salvo que digas lo contrario");
  });
});
