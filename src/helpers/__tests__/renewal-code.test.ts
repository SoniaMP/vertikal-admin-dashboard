import { describe, it, expect } from "vitest";
import { generateRenewalCode } from "../renewal-code";

describe("generateRenewalCode", () => {
  it("returns six digits", () => {
    for (let i = 0; i < 200; i++) {
      expect(generateRenewalCode()).toMatch(/^\d{6}$/);
    }
  });

  it("zero-pads small numbers so every code is the same length", () => {
    const codes = Array.from({ length: 500 }, generateRenewalCode);
    expect(codes.every((code) => code.length === 6)).toBe(true);
  });

  it("does not return the same code every time", () => {
    const codes = new Set(Array.from({ length: 50 }, generateRenewalCode));
    expect(codes.size).toBeGreaterThan(1);
  });
});
