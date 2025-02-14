"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import LoadingDots from "@/components/LoadingDots"

export default function SignIn() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setloading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setloading(true)
    const formData = new FormData(e.currentTarget)

    const response = await fetch("/api/auth", {
      method: "POST",
      body: JSON.stringify({
        username: formData.get("username"),
        password: formData.get("password"),
      }),
    })

    if (response.ok) {
      router.push("/")
      router.refresh()
    } else {
      setError("Invalid credentials")
    }
    setTimeout(() => {
    setloading(false)
      
    }, 1000);

  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to manage frames</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="username">
                Username
              </label>
              <Input id="username" name="username" required placeholder="admin" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <Input id="password" name="password" type="password" required placeholder="••••••••" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {loading?
            <div className="flex justify-center w-full"><LoadingDots/></div>
            :
              <Button type="submit" className="w-full" disabled={loading}>
                Sign In
              </Button>
            }

      </form>
        </CardContent>
      </Card>
    </div>
  )
}

