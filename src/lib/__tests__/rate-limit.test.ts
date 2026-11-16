import { describe, it, expect, afterEach, vi } from "vitest";
import { hitRateLimit } from "../rate-limit";

const WINDOW = 10 * 60 * 1000;

function hit(key: string) {
  return hitRateLimit({ key, limit: 3, windowMs: WINDOW });
}

afterEach(() => vi.useRealTimers());

describe("hitRateLimit", () => {
  it("allows up to the limit and refuses the one after", () => {
    const key = "allows-up-to-the-limit";

    expect(hit(key).isAllowed).toBe(true);
    expect(hit(key).isAllowed).toBe(true);
    expect(hit(key).isAllowed).toBe(true);
    expect(hit(key).isAllowed).toBe(false);
  });

  it("counts each caller on its own", () => {
    const first = "separate-a";
    const second = "separate-b";
    hit(first);
    hit(first);
    hit(first);

    expect(hit(first).isAllowed).toBe(false);
    expect(hit(second).isAllowed).toBe(true);
  });

  it("says how long the caller has to wait", () => {
    const key = "retry-after";
    hit(key);
    hit(key);
    hit(key);

    const blocked = hit(key);

    expect(blocked.isAllowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(WINDOW / 1000);
  });

  it("opens again once the window has passed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-16T10:00:00Z"));
    const key = "window-reset";
    hit(key);
    hit(key);
    hit(key);
    expect(hit(key).isAllowed).toBe(false);

    vi.setSystemTime(new Date("2026-11-16T10:10:01Z"));

    expect(hit(key).isAllowed).toBe(true);
  });
});
