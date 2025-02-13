import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"
import type React from "react" // Import React
import { NavBar } from "@/components/nav-bar"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavBar />
        {children}
        <Toaster richColors/>
      </body>
    </html>
  )
}

