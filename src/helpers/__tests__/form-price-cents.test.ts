import { describe, it, expect } from "vitest";
import { readPriceCents } from "../form-price-cents";

function form(value?: string): FormData {
  const data = new FormData();
  if (value !== undefined) data.set("price", value);
  return data;
}

describe("readPriceCents", () => {
  it("turns the euros an admin types into cents", () => {
    expect(readPriceCents(form("7.50"))).toBe(750);
  });

  it("rounds to the cent instead of storing a fraction of one", () => {
    expect(readPriceCents(form("7.005"))).toBe(701);
  });

  it("reads an empty field as no price, not as zero", () => {
    // Zero would mean the club gives the extra away; empty means it has not
    // been priced yet, and the panel says so.
    expect(readPriceCents(form(""))).toBeNull();
    expect(readPriceCents(form("   "))).toBeNull();
  });

  it("reads a form with no price field at all as no price", () => {
    expect(readPriceCents(form())).toBeNull();
  });
});
