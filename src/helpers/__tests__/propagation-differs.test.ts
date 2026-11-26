import { describe, it, expect } from "vitest";
import { propagationDiffers } from "../propagation-differs";
import type { CatalogRow } from "@/lib/catalog-row";

function row(overrides: Partial<CatalogRow> = {}): CatalogRow {
  return {
    name: "Espeleosocorristas",
    description: "",
    active: true,
    lineageId: "lin-1",
    seasonId: "season-1",
    ...overrides,
  };
}

describe("propagationDiffers", () => {
  it("says no when the texts already match", () => {
    expect(propagationDiffers(row(), row({ seasonId: "s-2" }), "texts")).toBe(
      false,
    );
  });

  it("says yes when the name differs", () => {
    const sibling = row({ seasonId: "s-2", name: "Espeleo-socorro" });

    expect(propagationDiffers(row(), sibling, "texts")).toBe(true);
  });

  it("says yes when only the description differs", () => {
    const source = row({ description: "Cobertura de rescate" });
    const sibling = row({ seasonId: "s-2", description: "" });

    expect(propagationDiffers(source, sibling, "texts")).toBe(true);
  });

  it("ignores the state when the scope is texts", () => {
    const sibling = row({ seasonId: "s-2", active: false });

    expect(propagationDiffers(row(), sibling, "texts")).toBe(false);
  });

  it("says no when the other year is already in this state", () => {
    const sibling = row({ seasonId: "s-2", active: true });

    expect(propagationDiffers(row(), sibling, "state")).toBe(false);
  });

  it("says yes when the state differs", () => {
    const sibling = row({ seasonId: "s-2", active: false });

    expect(propagationDiffers(row(), sibling, "state")).toBe(true);
  });

  it("ignores the texts when the scope is state", () => {
    const sibling = row({ seasonId: "s-2", name: "Otro nombre" });

    expect(propagationDiffers(row(), sibling, "state")).toBe(false);
  });
});
