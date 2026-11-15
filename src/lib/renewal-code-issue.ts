import { prisma } from "@/lib/prisma";
import { generateRenewalCode } from "@/helpers/renewal-code";
import { hashRenewalCode } from "@/lib/renewal-code-hash";

/**
 * Fifteen minutes rather than the usual ten: the member has to open their
 * mail on a phone, possibly dig it out of spam, and come back.
 */
const CODE_TTL_MS = 15 * 60 * 1000;

/**
 * Issues a fresh code for this DNI and returns the plain code so it can be
 * sent. Only the hash is stored.
 *
 * Any earlier code for the same DNI is dropped, so a member never holds two
 * valid codes at once and the table cannot grow without bound.
 */
export async function issueRenewalCode(dni: string): Promise<string> {
  const code = generateRenewalCode();

  await prisma.renewalCode.deleteMany({ where: { dni } });
  await prisma.renewalCode.create({
    data: {
      dni,
      codeHash: hashRenewalCode(code),
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });

  return code;
}
