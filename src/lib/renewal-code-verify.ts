import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashRenewalCode } from "@/lib/renewal-code-hash";

/** Six digits is a million candidates, so guessing has to be cut off early. */
const MAX_ATTEMPTS = 5;

function hashesMatch(stored: string, candidate: string): boolean {
  const a = Buffer.from(stored, "hex");
  const b = Buffer.from(candidate, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Checks a code and consumes it. Every failure looks the same from outside —
 * wrong code, expired, already used, never issued — so the screen cannot be
 * turned into an oracle for which DNIs exist.
 *
 * A wrong code costs the member one of their attempts; running out burns the
 * code so a guessing loop has to request a new one and pay the send limit.
 */
export async function verifyRenewalCode(
  dni: string,
  code: string,
): Promise<boolean> {
  const record = await prisma.renewalCode.findFirst({
    where: { dni },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return false;

  const isSpent =
    record.expiresAt.getTime() < Date.now() || record.attempts >= MAX_ATTEMPTS;

  if (isSpent) {
    await prisma.renewalCode.delete({ where: { id: record.id } });
    return false;
  }

  if (!hashesMatch(record.codeHash, hashRenewalCode(code))) {
    await prisma.renewalCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return false;
  }

  await prisma.renewalCode.delete({ where: { id: record.id } });
  return true;
}
