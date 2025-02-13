"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import logo from "@/public/logo.webp";
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
        {/* <h1 className="text-xl font-bold">Rivo Dashboard</h1> */}
        <div className="flex items-center gap-4">
          <Image
            src={logo}
            alt="Rivo Logo"
            width={60}
            height={60}
          />
          </div>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </nav>
  )
}

