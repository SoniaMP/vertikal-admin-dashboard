import { describe, expect, it } from "vitest";
import { hasStaleSessionCookie } from "../stale-session";

describe("hasStaleSessionCookie", () => {
  it("recognises the session cookie as development serves it", () => {
    expect(hasStaleSessionCookie(["authjs.session-token"])).toBe(true);
  });

  it("recognises the secure name production serves over https", () => {
    expect(hasStaleSessionCookie(["__Secure-authjs.session-token"])).toBe(true);
  });

  it("recognises a session split into chunks", () => {
    expect(
      hasStaleSessionCookie([
        "__Secure-authjs.session-token.0",
        "__Secure-authjs.session-token.1",
      ]),
    ).toBe(true);
  });

  it("finds it among the other cookies of the request", () => {
    expect(
      hasStaleSessionCookie([
        "authjs.csrf-token",
        "authjs.session-token",
        "sidebar_state",
      ]),
    ).toBe(true);
  });

  /** A first-time visitor must not be told a session of theirs ran out. */
  it("says no when nothing resembling a session arrived", () => {
    expect(hasStaleSessionCookie(["authjs.csrf-token"])).toBe(false);
    expect(hasStaleSessionCookie([])).toBe(false);
  });

  it("is not fooled by a name that merely starts the same", () => {
    expect(hasStaleSessionCookie(["authjs.session-token-backup"])).toBe(false);
  });
});
