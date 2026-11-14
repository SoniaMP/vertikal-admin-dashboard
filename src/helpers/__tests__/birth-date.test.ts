import { describe, it, expect, vi, afterEach } from "vitest";
import { birthDateError } from "../birth-date";

describe("birthDateError", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts a real past date", () => {
    expect(birthDateError("1990-01-15")).toBeNull();
  });

  it("reports an empty value as required", () => {
    expect(birthDateError("")).toMatch(/obligatoria/i);
  });

  it("rejects text that is not a date at all", () => {
    expect(birthDateError("no soy una fecha")).toMatch(/válida/i);
  });

  it("rejects a day that does not exist in that month", () => {
    expect(birthDateError("2026-02-31")).toMatch(/válida/i);
  });

  it("rejects a date written in another format", () => {
    expect(birthDateError("15/01/1990")).toMatch(/válida/i);
  });

  it("rejects a date in the future", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-14T09:00:00"));

    expect(birthDateError("2026-11-15")).toMatch(/futuro/i);
  });

  it("accepts today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-14T09:00:00"));

    expect(birthDateError("2026-11-14")).toBeNull();
  });

  // A mistyped year is the realistic way this field goes wrong: 0190 for 1990
  // parses as a valid date and would otherwise sail through.
  it("rejects an implausibly old year", () => {
    expect(birthDateError("0190-01-15")).toMatch(/año/i);
  });
});
