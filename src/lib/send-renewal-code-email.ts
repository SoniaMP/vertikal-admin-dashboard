import { createElement } from "react";
import { getResend } from "@/lib/resend";
import { renderBrandedEmail } from "@/lib/email-renderer";
import RenewalCode from "@/emails/renewal-code";

const EXPIRES_IN_MINUTES = 15;

type RenewalCodeEmail = {
  to: string;
  firstName: string;
  code: string;
};

/**
 * Sends the renewal code.
 *
 * It throws on failure rather than swallowing it, but the caller deliberately
 * does not pass that through to the browser: the screen answers the same way
 * whether or not the DNI exists, and a visible "could not send" would say that
 * it does. The caller logs instead, and the member always has the option of
 * continuing without recovering their data.
 */
export async function sendRenewalCodeEmail({
  to,
  firstName,
  code,
}: RenewalCodeEmail): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("Missing EMAIL_FROM env var");

  const html = await renderBrandedEmail(
    createElement(RenewalCode, {
      firstName,
      code,
      expiresInMinutes: EXPIRES_IN_MINUTES,
    }),
  );

  const resend = await getResend();
  await resend.emails.send({
    from,
    to,
    subject: `Tu código para renovar: ${code}`,
    html,
  });
}
