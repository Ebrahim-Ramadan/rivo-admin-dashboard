import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "admin123"
const AUTH_COOKIE = "auth_token"
const TOKEN_VALUE = "authenticated" // In production, use a proper JWT token

export async function POST(request: Request) {
  const body = await request.json()
  const { username, password } = body

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    cookies().set(AUTH_COOKIE, TOKEN_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
}

export async function DELETE() {
  cookies().delete(AUTH_COOKIE)
  return NextResponse.json({ success: true })
}

