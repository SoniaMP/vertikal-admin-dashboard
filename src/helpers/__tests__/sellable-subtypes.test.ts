import { describe, it, expect } from "vitest";
import { selectSellableSubtypes } from "../sellable-subtypes";

const BASICA_A = { id: "sub-a", name: "BÁSICA A" };
const BASICA_B = { id: "sub-b", name: "BÁSICA B" };

const activeCategory = { active: true };
const retiredCategory = { active: false };

describe("selectSellableSubtypes", () => {
  it("keeps a modality that has at least one priced category", () => {
    const result = selectSellableSubtypes(
      [BASICA_A, BASICA_B],
      [{ subtypeId: "sub-a", category: activeCategory }],
    );

    expect(result).toEqual([BASICA_A]);
  });

  // The admin creates the modality first and fills its price grid afterwards.
  // In between it must not reach the public wizard.
  it("drops a modality created before its prices", () => {
    expect(selectSellableSubtypes([BASICA_A], [])).toEqual([]);
  });

  it("drops a modality whose only offerings sit on a retired category", () => {
    const result = selectSellableSubtypes(
      [BASICA_A],
      [{ subtypeId: "sub-a", category: retiredCategory }],
    );

    expect(result).toEqual([]);
  });

  it("keeps a modality when only some of its categories are retired", () => {
    const result = selectSellableSubtypes(
      [BASICA_A],
      [
        { subtypeId: "sub-a", category: retiredCategory },
        { subtypeId: "sub-a", category: activeCategory },
      ],
    );

    expect(result).toEqual([BASICA_A]);
  });

  it("ignores an offering with no category at all", () => {
    const result = selectSellableSubtypes(
      [BASICA_A],
      [{ subtypeId: "sub-a", category: null }],
    );

    expect(result).toEqual([]);
  });

  it("preserves the order the modalities came in", () => {
    const result = selectSellableSubtypes(
      [BASICA_A, BASICA_B],
      [
        { subtypeId: "sub-b", category: activeCategory },
        { subtypeId: "sub-a", category: activeCategory },
      ],
    );

    expect(result).toEqual([BASICA_A, BASICA_B]);
  });
});
