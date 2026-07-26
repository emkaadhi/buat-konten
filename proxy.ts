import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected routes — ganti/expand sesuai kebutuhan
const protectedPaths = ["/products", "/api/products"];

export default async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const isProtected = protectedPaths.some((path) =>
      pathname.startsWith(path)
    );

    if (!isProtected) {
      return NextResponse.next();
    }

    // Check session via cookie — NextAuth v5 stores session token
    const sessionToken =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/login", request.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch {
    // Fallback: jangan block halaman kalau ada error di proxy
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|api/auth|login).*)",
  ],
};