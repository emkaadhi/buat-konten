import { auth } from "@/src/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ["/products", "/api/products"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and visiting login page, redirect to products
  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/products", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files, api/auth, and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|api/auth).*)",
  ],
};