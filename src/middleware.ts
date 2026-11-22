import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { hasStaleSessionCookie } from "@/helpers/stale-session";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const INSTRUCTOR_ALLOWED_PREFIXES = [
  "/admin/login",
  "/admin/cursos",
  "/admin/cuenta",
];

function isInstructorAllowed(pathname: string): boolean {
  return INSTRUCTOR_ALLOWED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
}

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const isLoginPage = pathname === "/admin/login";
  const isAuthenticated = !!req.auth;

  if (isLoginPage && isAuthenticated) {
    const url = req.nextUrl.clone();
    const role = req.auth?.user?.role;
    url.pathname = role === "INSTRUCTOR" ? "/admin/cursos" : "/admin";
    // `?expired=1` belongs to the login screen. Carried over to the panel, its
    // advanced filters read it as one more filter and draw a chip for it.
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!isLoginPage && !isAuthenticated) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    // The page the volunteer was on may carry ids in its query, and none of
    // them mean anything on the login screen.
    url.search = "";
    const cookieNames = req.cookies.getAll().map((cookie) => cookie.name);
    if (hasStaleSessionCookie(cookieNames)) {
      url.searchParams.set("expired", "1");
    }
    return NextResponse.redirect(url);
  }

  const role = req.auth?.user?.role;
  if (isAuthenticated && role === "INSTRUCTOR" && !isInstructorAllowed(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/cursos";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
