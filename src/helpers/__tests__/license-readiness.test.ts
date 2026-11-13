import { describe, it, expect } from "vitest";
import { checkPublishReadiness } from "../license-readiness";

describe("checkPublishReadiness", () => {
  it("blocks publishing when nothing is priced", () => {
    const readiness = checkPublishReadiness(["st-1"], ["cat-1"], []);

    expect(readiness).toEqual({
      sellableCount: 0,
      gapCount: 1,
      canPublish: false,
    });
  });

  it("allows publishing a partially priced catalog", () => {
    const readiness = checkPublishReadiness(
      ["st-1", "st-2"],
      ["cat-1", "cat-2"],
      [
        { subtypeId: "st-1", categoryId: "cat-1" },
        { subtypeId: "st-1", categoryId: "cat-2" },
      ],
    );

    expect(readiness).toEqual({
      sellableCount: 2,
      gapCount: 2,
      canPublish: true,
    });
  });

  it("reports no gaps when every combination is priced", () => {
    const readiness = checkPublishReadiness(
      ["st-1"],
      ["cat-1", "cat-2"],
      [
        { subtypeId: "st-1", categoryId: "cat-1" },
        { subtypeId: "st-1", categoryId: "cat-2" },
      ],
    );

    expect(readiness.gapCount).toBe(0);
    expect(readiness.canPublish).toBe(true);
  });

  it("ignores offerings for modalities that are not counted", () => {
    const readiness = checkPublishReadiness(
      ["st-1"],
      ["cat-1"],
      [
        { subtypeId: "st-1", categoryId: "cat-1" },
        { subtypeId: "st-removed", categoryId: "cat-1" },
      ],
    );

    expect(readiness.sellableCount).toBe(1);
    expect(readiness.gapCount).toBe(0);
  });

  it("cannot publish a type with no modalities at all", () => {
    const readiness = checkPublishReadiness([], ["cat-1"], []);

    expect(readiness).toEqual({
      sellableCount: 0,
      gapCount: 0,
      canPublish: false,
    });
  });
});
