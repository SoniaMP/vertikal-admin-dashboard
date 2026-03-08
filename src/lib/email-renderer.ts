import { render } from "@react-email/components";
import { cloneElement } from "react";
import { getEmailBranding, type EmailBrandingSettings } from "@/lib/email-branding";

/**
 * Render a React Email component to an HTML string.
 * Thin wrapper to serve as the future integration point for sending.
 */
export async function renderEmail(
  component: React.ReactElement,
): Promise<string> {
  return render(component);
}

/**
 * Render a React Email component with branding from DB settings.
 * Fetches branding and injects it as a `branding` prop.
 */
export async function renderBrandedEmail(
  component: React.ReactElement,
): Promise<string> {
  const branding = await getEmailBranding();
  const branded = cloneElement(component, { branding } as { branding: EmailBrandingSettings });
  return render(branded);
}
