import type { NextAuthConfig } from "next-auth";

// Edge-compatible config — no Node.js modules (no Prisma, no fs).
// Used by the middleware to validate JWT sessions.
// Callbacks must be here too so middleware can read role from the session.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token.role) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
