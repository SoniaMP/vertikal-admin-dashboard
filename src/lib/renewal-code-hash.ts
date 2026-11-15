import { createHmac } from "node:crypto";

/**
 * HMAC rather than a plain digest. Six digits is a million candidates, so a
 * bare SHA-256 sitting in the database could be reversed by anyone who read
 * it. The key never leaves the environment, so a database dump on its own
 * proves nothing about any outstanding code.
 */
export function hashRenewalCode(code: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Missing AUTH_SECRET env var");
  return createHmac("sha256", secret).update(code).digest("hex");
}
