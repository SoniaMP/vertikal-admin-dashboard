import { describe, it, expect } from "vitest";
import { resolveLicenseVisibility } from "../license-visibility";

describe("resolveLicenseVisibility", () => {
  it("reads a never published row as a draft", () => {
    expect(
      resolveLicenseVisibility({ active: true, publishedAt: null }),
    ).toBe("draft");
  });

  it("keeps a draft a draft even when it is inactive", () => {
    expect(
      resolveLicenseVisibility({ active: false, publishedAt: null }),
    ).toBe("draft");
  });

  it("reads a published and active row as published", () => {
    expect(
      resolveLicenseVisibility({ active: true, publishedAt: new Date() }),
    ).toBe("published");
  });

  it("tells a retired row apart from a draft", () => {
    expect(
      resolveLicenseVisibility({ active: false, publishedAt: new Date() }),
    ).toBe("retired");
  });
});
