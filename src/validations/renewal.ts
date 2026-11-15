import { z } from "zod";

export const RENEWAL_CODE_LENGTH = 6;

/**
 * Six digits, kept numeric on purpose: a member reads it off a screen or hears
 * it read aloud, and phones autofill a numeric code straight from an SMS.
 */
export const renewalCodeSchema = z
  .string()
  .trim()
  .regex(new RegExp(`^\\d{${RENEWAL_CODE_LENGTH}}$`), {
    message: "El código son 6 dígitos",
  });
