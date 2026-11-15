import { prisma } from "@/lib/prisma";

export type EmailBrandingSettings = {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
};

/**
 * Sampled from `public/logo-horizontal-color.png`. The lime (#81b826) stays out
 * of here: it only reaches 2.3:1 on this background, so it cannot carry text.
 */
export const DEFAULT_BRANDING: EmailBrandingSettings = {
  logoUrl: null,
  primaryColor: "#004522",
  secondaryColor: "#3d5a47",
  backgroundColor: "#f9fafb",
};

const BRANDING_KEYS = [
  "EMAIL_LOGO_URL",
  "EMAIL_PRIMARY_COLOR",
  "EMAIL_SECONDARY_COLOR",
  "EMAIL_BG_COLOR",
] as const;

export async function getEmailBranding(): Promise<EmailBrandingSettings> {
  const settings = await prisma.appSetting.findMany({
    where: { key: { in: [...BRANDING_KEYS] } },
  });

  const map = new Map(settings.map((s) => [s.key, s.value]));
  const rawLogoUrl = map.get("EMAIL_LOGO_URL") || null;
  const logoUrl = rawLogoUrl?.startsWith("/")
    ? `${process.env.AUTH_URL}${rawLogoUrl}`
    : rawLogoUrl;

  return {
    logoUrl,
    primaryColor: map.get("EMAIL_PRIMARY_COLOR") || DEFAULT_BRANDING.primaryColor,
    secondaryColor: map.get("EMAIL_SECONDARY_COLOR") || DEFAULT_BRANDING.secondaryColor,
    backgroundColor: map.get("EMAIL_BG_COLOR") || DEFAULT_BRANDING.backgroundColor,
  };
}

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export function isValidHexColor(value: string): boolean {
  return HEX_COLOR_RE.test(value);
}
