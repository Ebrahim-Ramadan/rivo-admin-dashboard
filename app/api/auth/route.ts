import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const { username, password } = body

  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
  //  @ts-ignore
    cookies().set(process.env.AUTH_COOKIE, process.env.TOKEN_VALUE, {
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
  // @ts-ignore
  cookies().delete(process.env.AUTH_COOKIE)
  return NextResponse.json({ success: true })
}

