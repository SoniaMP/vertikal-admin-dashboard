import { describe, it, expect } from "vitest";
import { membershipCheckoutLines } from "../membership-checkout-lines";

const CLUB_MEMBERSHIP = {
  licenseLabelSnapshot: "FERM - BÁSICA A - Infantil (4-13 años)",
  licensePriceSnapshot: 1500,
  totalAmount: 3500,
  supplements: [],
};

function sum(lines: { price: number }[]) {
  return lines.reduce((total, line) => total + line.price, 0);
}

describe("membershipCheckoutLines", () => {
  it("bills the licence and the club fee the total implies", () => {
    const lines = membershipCheckoutLines(CLUB_MEMBERSHIP);
    expect(lines).toEqual([
      { name: "FERM - BÁSICA A - Infantil (4-13 años)", price: 1500 },
      { name: "Cuota de socio", price: 2000 },
    ]);
  });

  it("always adds up to the amount on record", () => {
    const lines = membershipCheckoutLines({
      ...CLUB_MEMBERSHIP,
      totalAmount: 5000,
      supplements: [{ priceAtTime: 800, supplement: { name: "Seguro extra" } }],
    });
    expect(sum(lines)).toBe(5000);
  });

  it("bills a supplement at the price agreed then, not today's", () => {
    const lines = membershipCheckoutLines({
      ...CLUB_MEMBERSHIP,
      totalAmount: 4300,
      supplements: [{ priceAtTime: 800, supplement: { name: "Seguro extra" } }],
    });
    expect(lines).toContainEqual({ name: "Seguro extra", price: 800 });
  });

  it("bills only the fee when the member federates elsewhere", () => {
    const lines = membershipCheckoutLines({
      licenseLabelSnapshot: "",
      licensePriceSnapshot: 0,
      totalAmount: 2000,
      supplements: [],
    });
    expect(lines).toEqual([{ name: "Cuota de socio", price: 2000 }]);
  });

  it("omits the fee line when the total leaves nothing for it", () => {
    const lines = membershipCheckoutLines({
      ...CLUB_MEMBERSHIP,
      totalAmount: 1500,
    });
    expect(lines.map((line) => line.name)).not.toContain("Cuota de socio");
    expect(sum(lines)).toBe(1500);
  });
});
