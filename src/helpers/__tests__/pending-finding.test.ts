import { describe, expect, it } from "vitest";
import { formatPendingFinding } from "../pending-finding";

describe("formatPendingFinding", () => {
  it("names how many are unpaid and how far back they go", () => {
    expect(formatPendingFinding(4, new Date("2026-09-08T10:00:00Z"))).toBe(
      "4 altas siguen sin cobrar. La más antigua es del 8 de septiembre.",
    );
  });

  it("counts one alta in the singular", () => {
    expect(formatPendingFinding(1, new Date("2026-10-01T10:00:00Z"))).toBe(
      "1 alta sigue sin cobrar. La más antigua es del 1 de octubre.",
    );
  });

  it("says so plainly when nothing is owed", () => {
    expect(formatPendingFinding(0, null)).toBe(
      "Todas las altas de la temporada están cobradas.",
    );
  });

  it("drops the date when there is none to give", () => {
    expect(formatPendingFinding(2, null)).toBe("2 altas siguen sin cobrar.");
  });
});
