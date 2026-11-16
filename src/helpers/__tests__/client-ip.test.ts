import { describe, it, expect } from "vitest";
import { clientIp } from "../client-ip";

function headers(entries: Record<string, string>): Headers {
  return new Headers(entries);
}

describe("clientIp", () => {
  it("takes the first address the proxy forwarded", () => {
    const ip = clientIp(headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }));
    expect(ip).toBe("1.2.3.4");
  });

  it("falls back to the real-ip header", () => {
    expect(clientIp(headers({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
  });

  it("puts everything it cannot identify in one bucket, which limits more", () => {
    expect(clientIp(headers({}))).toBe("unknown");
  });
});
