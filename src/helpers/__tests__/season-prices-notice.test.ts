import { describe, it, expect } from "vitest";
import { buildSeasonPricesNotice } from "@/helpers/season-prices-notice";

const READY = {
  today: new Date("2026-06-01T12:00:00"),
  activeYear: 2026,
  activeHasPrices: true,
  upcomingYear: 2027,
  upcomingHasPrices: true,
  upcomingOpensOn: new Date("2026-12-17T00:00:00"),
};

describe("buildSeasonPricesNotice", () => {
  it("says nothing when both seasons have prices", () => {
    expect(buildSeasonPricesNotice(READY)).toBeNull();
  });

  it("says nothing in June about a next season still months away", () => {
    expect(
      buildSeasonPricesNotice({ ...READY, upcomingHasPrices: false }),
    ).toBeNull();
  });

  it("warns once the empty season is within the lead time", () => {
    const notice = buildSeasonPricesNotice({
      ...READY,
      today: new Date("2026-11-23T12:00:00"),
      upcomingHasPrices: false,
    });

    expect(notice?.id).toBe("season-prices-upcoming");
    expect(notice?.message).toContain("2027");
    expect(notice?.message).toContain("17 de diciembre");
    expect(notice?.actionHref).toBe("/admin/tipos-federacion?year=2027");
  });

  it("points at cloning from the season that does have prices", () => {
    const notice = buildSeasonPricesNotice({
      ...READY,
      today: new Date("2026-11-23T12:00:00"),
      upcomingHasPrices: false,
    });

    expect(notice?.message).toContain("clonarlos desde 2026");
  });

  it("raises the urgent one when the season in force has no prices", () => {
    const notice = buildSeasonPricesNotice({
      ...READY,
      activeHasPrices: false,
    });

    expect(notice?.id).toBe("season-prices-missing");
    expect(notice?.message).toContain("Nadie puede inscribirse");
    expect(notice?.actionHref).toBe("/admin/tipos-federacion?year=2026");
  });

  it("prefers the season in force over the one coming", () => {
    const notice = buildSeasonPricesNotice({
      ...READY,
      activeHasPrices: false,
      upcomingHasPrices: false,
      today: new Date("2026-11-23T12:00:00"),
    });

    expect(notice?.id).toBe("season-prices-missing");
  });
});
