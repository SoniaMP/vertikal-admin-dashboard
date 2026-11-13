import { describe, it, expect } from "vitest";
import { buildLicenseTypePreview } from "../license-preview";

const adult = {
  id: "cat-adult",
  name: "Adulto",
  description: "",
  active: true,
};
const minor = { id: "cat-minor", name: "Menor", description: "", active: true };

function buildSource(overrides: Record<string, unknown> = {}) {
  return {
    active: true,
    publishedAt: null as Date | null,
    subtypes: [
      { id: "st-a", name: "BÁSICA A", active: true, publishedAt: null },
      { id: "st-b", name: "BÁSICA B", active: true, publishedAt: null },
    ],
    offerings: [
      {
        subtypeId: "st-a",
        categoryId: "cat-adult",
        price: 1500,
        category: adult,
      },
      {
        subtypeId: "st-a",
        categoryId: "cat-minor",
        price: 900,
        category: minor,
      },
    ],
    ...overrides,
  };
}

const SEASON_CATEGORIES = [
  { id: "cat-adult", name: "Adulto" },
  { id: "cat-minor", name: "Menor" },
  { id: "cat-senior", name: "Veterano" },
];

describe("buildLicenseTypePreview", () => {
  it("marks an unpriced modality as one the member will not see", () => {
    const preview = buildLicenseTypePreview(buildSource(), SEASON_CATEGORIES);

    const [basicaA, basicaB] = preview.subtypes;
    expect(basicaA.isVisible).toBe(true);
    expect(basicaB.isVisible).toBe(false);
  });

  it("lists each category with its price for the modality", () => {
    const preview = buildLicenseTypePreview(buildSource(), SEASON_CATEGORIES);

    expect(preview.subtypes[0].categories).toEqual([
      { id: "cat-adult", name: "Adulto", price: 1500 },
      { id: "cat-minor", name: "Menor", price: 900 },
      { id: "cat-senior", name: "Veterano", price: null },
    ]);
  });

  it("leaves the price null where the modality has no offering", () => {
    const preview = buildLicenseTypePreview(buildSource(), SEASON_CATEGORIES);

    expect(preview.subtypes[1].categories.map((c) => c.price)).toEqual([
      null,
      null,
      null,
    ]);
  });

  it("counts the gaps in the price matrix", () => {
    const preview = buildLicenseTypePreview(buildSource(), SEASON_CATEGORIES);

    expect(preview.readiness).toEqual({
      sellableCount: 2,
      gapCount: 4,
      canPublish: true,
    });
  });

  it("reports the draft state of the type and of each modality", () => {
    const preview = buildLicenseTypePreview(
      buildSource({
        publishedAt: new Date(),
        subtypes: [
          {
            id: "st-a",
            name: "BÁSICA A",
            active: true,
            publishedAt: new Date(),
          },
          { id: "st-b", name: "BÁSICA B", active: true, publishedAt: null },
        ],
      }),
      SEASON_CATEGORIES,
    );

    expect(preview.visibility).toBe("published");
    expect(preview.subtypes.map((s) => s.isDraft)).toEqual([false, true]);
  });

  it("leaves inactive modalities out of the preview entirely", () => {
    const preview = buildLicenseTypePreview(
      buildSource({
        subtypes: [
          { id: "st-a", name: "BÁSICA A", active: true, publishedAt: null },
          { id: "st-b", name: "BÁSICA B", active: false, publishedAt: null },
        ],
      }),
      SEASON_CATEGORIES,
    );

    expect(preview.subtypes).toHaveLength(1);
    expect(preview.readiness.gapCount).toBe(1);
  });

  it("cannot publish a type with no prices at all", () => {
    const preview = buildLicenseTypePreview(
      buildSource({ offerings: [] }),
      SEASON_CATEGORIES,
    );

    expect(preview.readiness.canPublish).toBe(false);
    expect(preview.subtypes.every((s) => !s.isVisible)).toBe(true);
  });
});

describe("buildLicenseTypePreview — categories nobody priced", () => {
  it("still lists a category with no price anywhere in the federation", () => {
    const preview = buildLicenseTypePreview(buildSource(), SEASON_CATEGORIES);

    expect(preview.subtypes[0].categories.map((c) => c.name)).toContain(
      "Veterano",
    );
  });

  it("counts it as a gap so the summary matches the rows shown", () => {
    const preview = buildLicenseTypePreview(buildSource(), SEASON_CATEGORIES);
    const shownGaps = preview.subtypes.flatMap((subtype) =>
      subtype.categories.filter((category) => category.price === null),
    );

    expect(shownGaps).toHaveLength(preview.readiness.gapCount);
  });
});
