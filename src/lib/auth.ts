import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";
import { hashPassword, verifyPassword } from "./password";

/**
 * Rewrites a password that validated against an outdated hash. It runs after
 * the password is known to be right, so the new hash is written from a value
 * the member just proved they know. A failure here must not cost them the
 * login: the old hash still works, and the next sign-in tries again.
 */
async function upgradeStoredHash(userId: string, password: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(password) },
    });
  } catch (error) {
    console.error("Could not upgrade the stored password hash:", error);
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { roles: { include: { role: true } } },
        });

        if (!user) return null;

        const { isValid, needsRehash } = await verifyPassword(
          password,
          user.passwordHash,
        );
        if (!isValid) return null;
        if (needsRehash) await upgradeStoredHash(user.id, password);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.roles[0]?.role.name ?? "ADMIN",
        };
      },
    }),
  ],
});
