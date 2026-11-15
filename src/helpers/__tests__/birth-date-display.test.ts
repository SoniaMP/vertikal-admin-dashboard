import { describe, it, expect } from "vitest";
import { formatBirthDate } from "../birth-date-display";

describe("formatBirthDate", () => {
  it("renders a stored date the way a Spanish member reads it", () => {
    expect(formatBirthDate("1958-04-12")).toBe("12/04/1958");
  });

  it("keeps the leading zeros", () => {
    expect(formatBirthDate("2001-01-05")).toBe("05/01/2001");
  });

  it("does not shift the day regardless of the server time zone", () => {
    const original = process.env.TZ;
    process.env.TZ = "Pacific/Kiritimati";
    expect(formatBirthDate("1990-12-31")).toBe("31/12/1990");
    process.env.TZ = original;
  });

  it("leaves a half-typed or empty value untouched", () => {
    expect(formatBirthDate("1958-04")).toBe("1958-04");
    expect(formatBirthDate("")).toBe("");
  });
});
