import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const AUTH_COOKIE = "auth_token"
const TOKEN_VALUE = "authenticated"

export function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = ["/sign-in"]
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // Check for authentication cookie
  const authToken = request.cookies.get(AUTH_COOKIE)
  const isAuthenticated = authToken?.value === TOKEN_VALUE

  // If not authenticated, redirect to sign-in
  if (!isAuthenticated) {
    const signInUrl = new URL("/sign-in", request.url)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}

