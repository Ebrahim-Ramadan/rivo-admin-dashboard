"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function NavBar() {
  const router = useRouter()

  const handleSignOut = async () => {
    await fetch("/api/auth", { method: "DELETE" })
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold">Frame Management</h1>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </nav>
  )
}

