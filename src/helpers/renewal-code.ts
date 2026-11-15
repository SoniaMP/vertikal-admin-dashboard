import { randomInt } from "node:crypto";
import { RENEWAL_CODE_LENGTH } from "@/validations/renewal";

/**
 * A uniformly random code, zero-padded so every code is the same length.
 * `randomInt` rather than `Math.random`: this one guards personal data.
 */
export function generateRenewalCode(): string {
  const upperBound = 10 ** RENEWAL_CODE_LENGTH;
  return String(randomInt(0, upperBound)).padStart(RENEWAL_CODE_LENGTH, "0");
}
