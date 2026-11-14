import { z } from "zod";
import { birthDateError } from "@/helpers/birth-date";

/**
 * One rule shared by every form that asks for a birth date, so the public
 * registration, the course signup and the admin screens cannot drift apart.
 * `superRefine` instead of chained `refine` calls: it stops at the first
 * problem, so a date that is neither a date nor in the past reports one
 * message rather than two.
 */
export const birthDateSchema = z.string().superRefine((value, ctx) => {
  const message = birthDateError(value);
  if (message) ctx.addIssue({ code: "custom", message });
});
