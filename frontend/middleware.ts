import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "laravel-session";

async function getSessionUser(request: NextRequest): Promise<{ role: string } | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_FETCH}/user`, {
      headers: {
        Cookie: request.headers.get("cookie") ?? "",
        Referer: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/applications") || pathname.startsWith("/admin");

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isProtectedRoute && sessionCookie) {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (isAuthRoute && sessionCookie) {
    const user = await getSessionUser(request);
    if (user) {
      const destination = user.role === "Super Admin" ? "/admin/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/applications/:path*", "/admin/:path*", "/login", "/register"],
};
