import { describe, it, expect } from "vitest";
import {
  parseFilterParams,
  serializeFilters,
  getActiveFilterEntries,
} from "@/lib/filter-params";
import type { MembershipFilterState } from "@/types/membership-filters";

const DEFAULT_SEASON = "season-1";

function makeFilters(
  overrides: Partial<MembershipFilterState> = {},
): MembershipFilterState {
  return {
    seasonId: DEFAULT_SEASON,
    search: "",
    paymentStatus: "",
    membershipStatus: "",
    federated: "",
    sex: "",
    typeId: "",
    subtypeId: "",
    categoryId: "",
    province: "",
    city: "",
    dateFrom: "",
    dateTo: "",
    view: "",
    sortBy: "createdAt",
    sortDir: "desc",
    page: 1,
    ...overrides,
  };
}

describe("parseFilterParams", () => {
  it("returns defaults when no params are provided", () => {
    const result = parseFilterParams({}, DEFAULT_SEASON);
    expect(result).toEqual(makeFilters());
  });

  it("takes the season the caller resolved from the year", () => {
    const result = parseFilterParams({}, DEFAULT_SEASON);
    expect(result.seasonId).toBe(DEFAULT_SEASON);
  });

  it("ignores a seasonId in the URL, which could name a year never offered", () => {
    const result = parseFilterParams({ seasonId: "season-2" }, DEFAULT_SEASON);
    expect(result.seasonId).toBe(DEFAULT_SEASON);
  });

  it("parses search and filter strings", () => {
    const result = parseFilterParams(
      { search: "garcia", paymentStatus: "PENDING", federated: "true" },
      DEFAULT_SEASON,
    );
    expect(result.search).toBe("garcia");
    expect(result.paymentStatus).toBe("PENDING");
    expect(result.federated).toBe("true");
  });

  it("validates sort fields and falls back to default", () => {
    const valid = parseFilterParams({ sortBy: "email" }, DEFAULT_SEASON);
    expect(valid.sortBy).toBe("email");

    const invalid = parseFilterParams(
      { sortBy: "invalidField" },
      DEFAULT_SEASON,
    );
    expect(invalid.sortBy).toBe("createdAt");
  });

  it("validates sort direction", () => {
    const valid = parseFilterParams({ sortDir: "asc" }, DEFAULT_SEASON);
    expect(valid.sortDir).toBe("asc");

    const invalid = parseFilterParams(
      { sortDir: "sideways" },
      DEFAULT_SEASON,
    );
    expect(invalid.sortDir).toBe("desc");
  });

  it("parses page as number with minimum of 1", () => {
    expect(parseFilterParams({ page: "3" }, DEFAULT_SEASON).page).toBe(3);
    expect(parseFilterParams({ page: "0" }, DEFAULT_SEASON).page).toBe(1);
    expect(parseFilterParams({ page: "-5" }, DEFAULT_SEASON).page).toBe(1);
    expect(parseFilterParams({ page: "abc" }, DEFAULT_SEASON).page).toBe(1);
  });

  it("ignores array values (uses empty string)", () => {
    const result = parseFilterParams(
      { search: ["a", "b"] },
      DEFAULT_SEASON,
    );
    expect(result.search).toBe("");
  });
});

describe("serializeFilters", () => {
  it("returns empty params for default filters", () => {
    const params = serializeFilters(makeFilters(), DEFAULT_SEASON);
    expect(params.toString()).toBe("");
  });

  it("includes seasonId only if different from default", () => {
    const same = serializeFilters(makeFilters(), DEFAULT_SEASON);
    expect(same.has("seasonId")).toBe(false);

    const different = serializeFilters(
      makeFilters({ seasonId: "season-2" }),
      DEFAULT_SEASON,
    );
    expect(different.get("seasonId")).toBe("season-2");
  });

  it("includes non-empty string filters", () => {
    const params = serializeFilters(
      makeFilters({ search: "test", paymentStatus: "COMPLETED" }),
      DEFAULT_SEASON,
    );
    expect(params.get("search")).toBe("test");
    expect(params.get("paymentStatus")).toBe("COMPLETED");
  });

  it("includes non-default sort values", () => {
    const params = serializeFilters(
      makeFilters({ sortBy: "email", sortDir: "asc" }),
      DEFAULT_SEASON,
    );
    expect(params.get("sortBy")).toBe("email");
    expect(params.get("sortDir")).toBe("asc");
  });

  it("includes page only if > 1", () => {
    const page1 = serializeFilters(makeFilters({ page: 1 }), DEFAULT_SEASON);
    expect(page1.has("page")).toBe(false);

    const page3 = serializeFilters(makeFilters({ page: 3 }), DEFAULT_SEASON);
    expect(page3.get("page")).toBe("3");
  });
});

describe("getActiveFilterEntries", () => {
  it("returns empty array for default filters", () => {
    expect(getActiveFilterEntries(makeFilters())).toEqual([]);
  });

  it("returns entries for non-empty string filters", () => {
    const entries = getActiveFilterEntries(
      makeFilters({ search: "garcia", paymentStatus: "PENDING" }),
    );
    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({
      key: "search",
      label: "Búsqueda",
      value: "garcia",
    });
    expect(entries[1]).toEqual({
      key: "paymentStatus",
      label: "Estado pago",
      value: "PENDING",
    });
  });

  it("resolves sex display value", () => {
    const male = getActiveFilterEntries(makeFilters({ sex: "M" }));
    expect(male[0]).toEqual({ key: "sex", label: "Sexo", value: "Hombre" });

    const female = getActiveFilterEntries(makeFilters({ sex: "F" }));
    expect(female[0].value).toBe("Mujer");
  });

  it("resolves federated display value", () => {
    const entries = getActiveFilterEntries(
      makeFilters({ federated: "true" }),
    );
    expect(entries[0].value).toBe("Sí");

    const entriesNo = getActiveFilterEntries(
      makeFilters({ federated: "false" }),
    );
    expect(entriesNo[0].value).toBe("No");
  });

  it("excludes seasonId, sortBy, sortDir, page", () => {
    const entries = getActiveFilterEntries(
      makeFilters({ seasonId: "other", sortBy: "email", page: 5 }),
    );
    expect(entries).toEqual([]);
  });
});
