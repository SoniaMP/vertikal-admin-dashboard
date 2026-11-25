// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CatalogYearActions } from "../catalog-year-actions";

vi.mock(
  "@/app/admin/(dashboard)/tipos-federacion/actions/empty-season-catalog",
  () => ({ emptySeasonCatalog: vi.fn() }),
);
vi.mock(
  "@/app/admin/(dashboard)/tipos-federacion/actions/clone-season-prices",
  () => ({ cloneSeasonPrices: vi.fn() }),
);
vi.mock("../create-license-type-button", () => ({
  CreateLicenseTypeButton: () => null,
}));

function renderActions(year: { hasPrices: boolean; hasMemberships: boolean }) {
  render(
    <CatalogYearActions
      year={2027}
      seasonId="season-2027"
      clonableYears={[2026]}
      isActiveYear={false}
      {...year}
    />,
  );
  return screen.queryByRole("button", { name: /Vaciar 2027/ });
}

describe("CatalogYearActions", () => {
  it("offers to empty a priced year nobody has registered in", () => {
    expect(renderActions({ hasPrices: true, hasMemberships: false })).not.toBeNull();
  });

  it("hides it once somebody has registered in the year", () => {
    expect(renderActions({ hasPrices: true, hasMemberships: true })).toBeNull();
  });

  it("hides it when there is nothing to empty", () => {
    expect(renderActions({ hasPrices: false, hasMemberships: false })).toBeNull();
  });
});
