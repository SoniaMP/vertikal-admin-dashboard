import { describe, it, expect } from "vitest";
import { createHash, randomBytes, scrypt } from "node:crypto";
import { hashPassword, verifyPassword } from "../password";

const PASSWORD = "una contraseña del club";

/** How every password in the database was stored before this module. */
function legacyHash(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

describe("hashPassword", () => {
  it("writes the scheme and its cost into the stored value", async () => {
    const stored = await hashPassword(PASSWORD);
    expect(stored.startsWith("scrypt$32768$8$1$")).toBe(true);
  });

  it("never produces the same hash twice for the same password", async () => {
    const [first, second] = await Promise.all([
      hashPassword(PASSWORD),
      hashPassword(PASSWORD),
    ]);
    expect(first).not.toBe(second);
  });

  it("does not store the password", async () => {
    const stored = await hashPassword(PASSWORD);
    expect(stored).not.toContain(PASSWORD);
  });
});

describe("verifyPassword", () => {
  it("accepts the password it hashed, and asks for no rehash", async () => {
    const stored = await hashPassword(PASSWORD);
    expect(await verifyPassword(PASSWORD, stored)).toEqual({
      isValid: true,
      needsRehash: false,
    });
  });

  it("rejects a wrong password", async () => {
    const stored = await hashPassword(PASSWORD);
    const check = await verifyPassword("otra cosa", stored);
    expect(check.isValid).toBe(false);
    expect(check.needsRehash).toBe(false);
  });

  it("still lets in a user stored as plain SHA-256, and flags the row", async () => {
    expect(await verifyPassword(PASSWORD, legacyHash(PASSWORD))).toEqual({
      isValid: true,
      needsRehash: true,
    });
  });

  it("rejects a wrong password against a legacy hash without flagging it", async () => {
    expect(await verifyPassword("otra cosa", legacyHash(PASSWORD))).toEqual({
      isValid: false,
      needsRehash: false,
    });
  });

  it("asks for a rehash when the stored cost is below the current one", async () => {
    const stored = await hashWithCost(PASSWORD, 16384);
    expect(await verifyPassword(PASSWORD, stored)).toEqual({
      isValid: true,
      needsRehash: true,
    });
  });

  it("refuses anything that is not a hash it understands", async () => {
    for (const stored of ["", "plain-text", "scrypt$1$2$3", "bcrypt$x$y"]) {
      expect(await verifyPassword(PASSWORD, stored)).toEqual({
        isValid: false,
        needsRehash: false,
      });
    }
  });
});

/** A stored hash written with an earlier, cheaper work factor. */
async function hashWithCost(password: string, n: number): Promise<string> {
  const salt = randomBytes(16);
  const key: Buffer = await new Promise((resolve, reject) =>
    scrypt(password, salt, 64, { N: n, r: 8, p: 1 }, (error, derived) =>
      error ? reject(error) : resolve(derived),
    ),
  );
  return `scrypt$${n}$8$1$${salt.toString("hex")}$${key.toString("hex")}`;
}
