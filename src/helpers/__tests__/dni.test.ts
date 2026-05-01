import { describe, it, expect } from "vitest";
import { normalizeDni } from "../dni";

describe("normalizeDni", () => {
  it("uppercases lowercase input", () => {
    expect(normalizeDni("12345678a")).toBe("12345678A");
  });

  it("trims leading and trailing whitespace", () => {
    expect(normalizeDni("  12345678A  ")).toBe("12345678A");
  });

  it("strips internal whitespace", () => {
    expect(normalizeDni("12345 678 A")).toBe("12345678A");
  });

  it("strips dots", () => {
    expect(normalizeDni("12.345.678-A")).toBe("12345678A");
  });

  it("strips dashes and underscores", () => {
    expect(normalizeDni("X-1234567_L")).toBe("X1234567L");
  });

  it("handles mixed separators and case", () => {
    expect(normalizeDni(" x.1234.567-l ")).toBe("X1234567L");
  });

  it("preserves alphanumerics outside the strip set", () => {
    expect(normalizeDni("AAA123456")).toBe("AAA123456");
  });

  it("returns empty string for empty input", () => {
    expect(normalizeDni("")).toBe("");
  });

  it("returns empty string when input is only separators", () => {
    expect(normalizeDni(" .-_ ")).toBe("");
  });
});
