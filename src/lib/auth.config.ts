import type { NextAuthConfig } from "next-auth";

/**
 * How long a session survives without being used. A volunteer's working day,
 * instead of the 30 days NextAuth defaults to: nobody signs out of the panel,
 * so that default left a borrowed or stolen laptop with a month of access.
 */
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

/**
 * How often an active session's cookie is reissued, which is what makes the
 * window slide instead of being a hard cap. It has to stay well under
 * `SESSION_MAX_AGE_SECONDS`: NextAuth defaults it to 24 h, and leaving it
 * there would expire the cookie long before it was ever refreshed, cutting off
 * someone in the middle of their work.
 */
const SESSION_UPDATE_AGE_SECONDS = 60 * 60;

// Edge-compatible config — no Node.js modules (no Prisma, no fs).
// Used by the middleware to validate JWT sessions.
// Callbacks must be here too so middleware can read role from the session.
export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
    updateAge: SESSION_UPDATE_AGE_SECONDS,
  },
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
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.role) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
