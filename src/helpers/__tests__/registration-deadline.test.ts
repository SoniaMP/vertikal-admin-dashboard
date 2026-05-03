import { describe, it, expect } from "vitest";
import {
  endOfLocalDay,
  isRegistrationClosed,
  startOfLocalDay,
} from "@/helpers/registration-deadline";

describe("startOfLocalDay", () => {
  it("sets the time to 00:00:00.000 in local time", () => {
    const date = new Date(2026, 5, 15, 8, 30, 45);
    const result = startOfLocalDay(date);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("preserves the calendar day", () => {
    const date = new Date(2026, 5, 15, 23, 59, 59);
    const result = startOfLocalDay(date);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(15);
  });

  it("does not mutate the input", () => {
    const date = new Date(2026, 5, 15, 8, 0, 0);
    const before = date.getTime();
    startOfLocalDay(date);
    expect(date.getTime()).toBe(before);
  });
});

describe("endOfLocalDay", () => {
  it("sets the time to 23:59:59.000 in local time", () => {
    const date = new Date(2026, 5, 15, 8, 0, 0);
    const result = endOfLocalDay(date);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("does not mutate the input", () => {
    const date = new Date(2026, 5, 15, 8, 0, 0);
    const before = date.getTime();
    endOfLocalDay(date);
    expect(date.getTime()).toBe(before);
  });

  it("preserves the calendar day", () => {
    const date = new Date(2026, 5, 15, 0, 0, 0);
    const result = endOfLocalDay(date);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(15);
  });
});

describe("isRegistrationClosed", () => {
  const deadline = new Date(2026, 5, 15, 23, 59, 59);

  it("is false when now is before the deadline", () => {
    const now = new Date(2026, 5, 15, 12, 0, 0);
    expect(isRegistrationClosed(deadline, now)).toBe(false);
  });

  it("is false at the exact deadline boundary", () => {
    expect(isRegistrationClosed(deadline, new Date(deadline))).toBe(false);
  });

  it("is true when now is past the deadline", () => {
    const now = new Date(2026, 5, 16, 0, 0, 0);
    expect(isRegistrationClosed(deadline, now)).toBe(true);
  });
});
