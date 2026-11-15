"use server";

import { prisma } from "@/lib/prisma";
import { dniSchema } from "@/validations/registration";
import { renewalCodeSchema } from "@/validations/renewal";
import { recordRenewalSend } from "@/lib/renewal-send-limit";
import { issueRenewalCode } from "@/lib/renewal-code-issue";
import { verifyRenewalCode } from "@/lib/renewal-code-verify";
import { sendRenewalCodeEmail } from "@/lib/send-renewal-code-email";
import {
  fetchRenewalPrefill,
  type RenewalPrefill,
} from "@/lib/renewal-prefill";

export type CodeRequestResult =
  | { status: "sent" }
  | { status: "invalid_dni" }
  | { status: "rate_limited" };

/**
 * Sends a one-time code to the address the club already holds for this DNI.
 *
 * It answers `sent` whether or not that member exists, and whether or not the
 * mail went out. The screen is public, a Spanish DNI is eight digits plus a
 * derivable letter, and any answer that varied by existence would turn this
 * form into a way to enumerate the club's members. The member is never stuck
 * on this: the screen also offers to continue without recovering anything.
 */
export async function requestRenewalCode(
  dni: string,
): Promise<CodeRequestResult> {
  const parsed = dniSchema.safeParse(dni);
  if (!parsed.success) return { status: "invalid_dni" };

  // Checked before the lookup, so a throttled DNI and an unknown DNI are
  // indistinguishable from outside.
  if (!recordRenewalSend(parsed.data)) return { status: "rate_limited" };

  const member = await prisma.member.findUnique({
    where: { dni: parsed.data },
    select: { firstName: true, email: true },
  });

  // The whole branch is guarded, not just the send. Everything inside it runs
  // only for a member who exists, so an error escaping here would surface on
  // the screen for real members and not for strangers — the very oracle this
  // action exists to avoid. Nothing else records these failures, so the log
  // has to be loud.
  if (member) {
    try {
      const code = await issueRenewalCode(parsed.data);
      await sendRenewalCodeEmail({
        to: member.email,
        firstName: member.firstName,
        code,
      });
    } catch (error) {
      console.error("Could not issue or send renewal code:", error);
    }
  }

  return { status: "sent" };
}

export type CodeRedemptionResult =
  | { status: "ok"; prefill: RenewalPrefill }
  | { status: "invalid" };

/**
 * Exchanges a valid code for the member's own stored data.
 *
 * Every failure answers `invalid` — wrong code, expired, already used, never
 * issued, member gone — for the same reason as above.
 */
export async function redeemRenewalCode(
  dni: string,
  code: string,
): Promise<CodeRedemptionResult> {
  const parsedDni = dniSchema.safeParse(dni);
  const parsedCode = renewalCodeSchema.safeParse(code);
  if (!parsedDni.success || !parsedCode.success) return { status: "invalid" };

  const isValid = await verifyRenewalCode(parsedDni.data, parsedCode.data);
  if (!isValid) return { status: "invalid" };

  const prefill = await fetchRenewalPrefill(parsedDni.data);
  if (!prefill) return { status: "invalid" };

  return { status: "ok", prefill };
}
