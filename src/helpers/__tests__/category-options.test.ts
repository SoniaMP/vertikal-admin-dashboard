import { describe, it, expect } from "vitest";
import { buildCategoryOptions } from "../category-options";
import type { CategoryOffering } from "@/types";

const SUBTYPE_A = "subtype-basica-a";
const SUBTYPE_B = "subtype-basica-b";

function buildCategory(
  overrides: Partial<CategoryOffering> & { id: string; name: string },
): CategoryOffering {
  return {
    description: "",
    active: true,
    prices: [],
    ...overrides,
  };
}

const INFANTIL = buildCategory({
  id: "cat-infantil",
  name: "Infantil (4-13 años)",
  prices: [{ subtypeId: SUBTYPE_A, price: 1500 }],
});

const ADULTO = buildCategory({
  id: "cat-adulto",
  name: "Adulto (18-64 años)",
  prices: [
    { subtypeId: SUBTYPE_A, price: 4500 },
    { subtypeId: SUBTYPE_B, price: 6200 },
  ],
});

describe("buildCategoryOptions", () => {
  it("prices every category offered in the chosen modality", () => {
    const options = buildCategoryOptions([INFANTIL, ADULTO], SUBTYPE_A);

    expect(options).toEqual([
      { id: "cat-infantil", name: "Infantil (4-13 años)", price: 1500 },
      { id: "cat-adulto", name: "Adulto (18-64 años)", price: 4500 },
    ]);
  });

  // The club sells BÁSICA B to adults but not to children. Without this the
  // wizard would accept the combination and the checkout would reject it.
  it("leaves a category unpriced when the modality does not offer it", () => {
    const options = buildCategoryOptions([INFANTIL, ADULTO], SUBTYPE_B);

    expect(options.find((o) => o.id === "cat-infantil")?.price).toBeNull();
    expect(options.find((o) => o.id === "cat-adulto")?.price).toBe(6200);
  });

  it("drops inactive categories entirely", () => {
    const retired = buildCategory({
      id: "cat-retired",
      name: "Cadete",
      active: false,
      prices: [{ subtypeId: SUBTYPE_A, price: 999 }],
    });

    const options = buildCategoryOptions([ADULTO, retired], SUBTYPE_A);

    expect(options.map((o) => o.id)).toEqual(["cat-adulto"]);
  });

  // A modality created today has no prices yet, and it reaches the public
  // wizard the moment it is active.
  it("prices nothing when the modality has no offerings at all", () => {
    const options = buildCategoryOptions([INFANTIL, ADULTO], "subtype-brand-new");

    expect(options).toHaveLength(2);
    expect(options.every((o) => o.price === null)).toBe(true);
  });

  it("returns nothing when there are no categories", () => {
    expect(buildCategoryOptions([], SUBTYPE_A)).toEqual([]);
  });

  it("keeps a zero price as a real offering, not as a gap", () => {
    const free = buildCategory({
      id: "cat-free",
      name: "Socio de honor",
      prices: [{ subtypeId: SUBTYPE_A, price: 0 }],
    });

    expect(buildCategoryOptions([free], SUBTYPE_A)[0].price).toBe(0);
  });
});
