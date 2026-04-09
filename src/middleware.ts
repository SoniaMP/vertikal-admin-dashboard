import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const INSTRUCTOR_ALLOWED_PREFIXES = [
  "/admin/login",
  "/admin/cursos",
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
    return NextResponse.redirect(url);
  }

  if (!isLoginPage && !isAuthenticated) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
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
