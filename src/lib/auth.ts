import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";
import { hashPassword } from "./hash-password";

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

        const passwordHash = await hashPassword(password);
        if (!user || passwordHash !== user.passwordHash) {
          return null;
        }

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
