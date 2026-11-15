import { describe, it, expect } from "vitest";
import { recordRenewalSend } from "../renewal-send-limit";

const HOUR_MS = 60 * 60 * 1000;

// Each test uses its own DNI: the limiter keeps module-level state on purpose.
describe("recordRenewalSend", () => {
  it("allows three sends and refuses the fourth", () => {
    const dni = "11111111H";
    expect(recordRenewalSend(dni, 0)).toBe(true);
    expect(recordRenewalSend(dni, 1000)).toBe(true);
    expect(recordRenewalSend(dni, 2000)).toBe(true);
    expect(recordRenewalSend(dni, 3000)).toBe(false);
  });

  it("allows again once the window has passed", () => {
    const dni = "22222222J";
    recordRenewalSend(dni, 0);
    recordRenewalSend(dni, 0);
    recordRenewalSend(dni, 0);
    expect(recordRenewalSend(dni, HOUR_MS - 1)).toBe(false);
    expect(recordRenewalSend(dni, HOUR_MS + 1)).toBe(true);
  });

  it("counts each DNI separately, so one member cannot block another", () => {
    const blocked = "33333333P";
    recordRenewalSend(blocked, 0);
    recordRenewalSend(blocked, 0);
    recordRenewalSend(blocked, 0);
    expect(recordRenewalSend(blocked, 0)).toBe(false);
    expect(recordRenewalSend("44444444A", 0)).toBe(true);
  });

  it("does not let a refused attempt extend the window", () => {
    const dni = "55555555K";
    recordRenewalSend(dni, 0);
    recordRenewalSend(dni, 0);
    recordRenewalSend(dni, 0);
    expect(recordRenewalSend(dni, 10)).toBe(false);
    expect(recordRenewalSend(dni, HOUR_MS + 5)).toBe(true);
  });
});
