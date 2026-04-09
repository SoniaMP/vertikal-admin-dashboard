import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appSetting: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

import { getEmailBranding, isValidHexColor, DEFAULT_BRANDING } from "../email-branding";

const AUTH_URL = "https://app.clubvertikal.es";

describe("getEmailBranding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH_URL = AUTH_URL;
  });

  it("returns defaults when no settings exist", async () => {
    mockFindMany.mockResolvedValue([]);
    const result = await getEmailBranding();
    expect(result).toEqual(DEFAULT_BRANDING);
  });

  it("returns stored values and resolves relative logo URL to absolute", async () => {
    mockFindMany.mockResolvedValue([
      { key: "EMAIL_LOGO_URL", value: "/api/uploads/branding/logo.png" },
      { key: "EMAIL_PRIMARY_COLOR", value: "#ff0000" },
      { key: "EMAIL_SECONDARY_COLOR", value: "#00ff00" },
      { key: "EMAIL_BG_COLOR", value: "#0000ff" },
    ]);

    const result = await getEmailBranding();
    expect(result).toEqual({
      logoUrl: `${AUTH_URL}/api/uploads/branding/logo.png`,
      primaryColor: "#ff0000",
      secondaryColor: "#00ff00",
      backgroundColor: "#0000ff",
    });
  });

  it("keeps absolute logo URL unchanged", async () => {
    mockFindMany.mockResolvedValue([
      { key: "EMAIL_LOGO_URL", value: "https://cdn.example.com/logo.png" },
    ]);

    const result = await getEmailBranding();
    expect(result.logoUrl).toBe("https://cdn.example.com/logo.png");
  });

  it("falls back to defaults for missing keys", async () => {
    mockFindMany.mockResolvedValue([
      { key: "EMAIL_PRIMARY_COLOR", value: "#ff0000" },
    ]);

    const result = await getEmailBranding();
    expect(result.primaryColor).toBe("#ff0000");
    expect(result.logoUrl).toBeNull();
    expect(result.secondaryColor).toBe(DEFAULT_BRANDING.secondaryColor);
    expect(result.backgroundColor).toBe(DEFAULT_BRANDING.backgroundColor);
  });
});

describe("isValidHexColor", () => {
  it("accepts valid 6-digit hex colors", () => {
    expect(isValidHexColor("#1d4ed8")).toBe(true);
    expect(isValidHexColor("#FFFFFF")).toBe(true);
    expect(isValidHexColor("#000000")).toBe(true);
    expect(isValidHexColor("#aaBB11")).toBe(true);
  });

  it("rejects invalid colors", () => {
    expect(isValidHexColor("")).toBe(false);
    expect(isValidHexColor("#fff")).toBe(false);
    expect(isValidHexColor("1d4ed8")).toBe(false);
    expect(isValidHexColor("#gggggg")).toBe(false);
    expect(isValidHexColor("#1234567")).toBe(false);
    expect(isValidHexColor("red")).toBe(false);
  });
});
