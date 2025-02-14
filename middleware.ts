import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"


export function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = ["/sign-in"]
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // Check for authentication cookie
  // @ts-ignore
  const authToken = request.cookies.get(process.env.AUTH_COOKIE)
  const isAuthenticated = authToken?.value === process.env.TOKEN_VALUE

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

