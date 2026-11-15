import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/**
 * Work factor. 32768 × 8 × 1 costs roughly 100 ms and 32 MB per attempt, which
 * is nothing for the three volunteers who log in and a wall for anyone running
 * a stolen database through a GPU.
 */
const CURRENT = { n: 32768, r: 8, p: 1 };
const MAX_MEMORY = 128 * 1024 * 1024;
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

/** The format this file replaced: a bare, unsalted SHA-256 in hex. */
const LEGACY_SHA256 = /^[0-9a-f]{64}$/;

export type PasswordCheck = {
  isValid: boolean;
  /** True when the stored hash is valid but written in an outdated format. */
  needsRehash: boolean;
};

type ScryptCost = { n: number; r: number; p: number };

function deriveKey(
  password: string,
  salt: Buffer,
  cost: ScryptCost,
  keyLength: number,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const options = { N: cost.n, r: cost.r, p: cost.p, maxmem: MAX_MEMORY };
    scrypt(password, salt, keyLength, options, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

/** Constant time, and false rather than a throw when the lengths differ. */
function equals(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await deriveKey(password, salt, CURRENT, KEY_LENGTH);
  return [
    "scrypt",
    CURRENT.n,
    CURRENT.r,
    CURRENT.p,
    salt.toString("hex"),
    key.toString("hex"),
  ].join("$");
}

function verifyLegacy(password: string, stored: string): PasswordCheck {
  const digest = createHash("sha256").update(password).digest();
  const isValid = equals(digest, Buffer.from(stored, "hex"));
  return { isValid, needsRehash: isValid };
}

async function verifyScrypt(
  password: string,
  stored: string,
): Promise<PasswordCheck> {
  const [scheme, n, r, p, saltHex, keyHex] = stored.split("$");
  if (scheme !== "scrypt" || !keyHex) {
    return { isValid: false, needsRehash: false };
  }

  const cost = { n: Number(n), r: Number(r), p: Number(p) };
  const expected = Buffer.from(keyHex, "hex");

  let key: Buffer;
  try {
    key = await deriveKey(password, Buffer.from(saltHex, "hex"), cost, expected.length);
  } catch {
    // Unparseable or absurd parameters: treat as a hash nobody can match.
    return { isValid: false, needsRehash: false };
  }

  const isValid = equals(key, expected);
  const isCurrent =
    cost.n === CURRENT.n && cost.r === CURRENT.r && cost.p === CURRENT.p;
  return { isValid, needsRehash: isValid && !isCurrent };
}

/**
 * Checks a password against whatever format the record happens to hold.
 *
 * Hashing is one way, so the old SHA-256 rows cannot be converted in a
 * migration. They are accepted here and reported as needing a rehash, which
 * lets the database upgrade itself as people log in, without a password reset
 * that this app has no way to deliver.
 */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<PasswordCheck> {
  if (LEGACY_SHA256.test(stored)) return verifyLegacy(password, stored);
  return verifyScrypt(password, stored);
}
