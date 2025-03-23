"use client"

import { useState } from "react"
import Link from "next/link"
import { Bookmark, LogIn, UserPlus, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/theme-toggle"
import { authClient } from "@/utils/auth-client"
import { useRouter } from "next/navigation"

export function Navbar() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const { 
    data: session, 
    isPending: sessionLoading,
    error: sessionError,
    refetch: refetchSession
  } = authClient.useSession()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login")
            refetchSession()
          },
          onError: (error) => {
            console.error("Logout failed:", error)
          }
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <header className="border-b sticky top-0 bg-background z-10">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2 items-center text-xl font-bold">
            <Bookmark className="h-6 w-6 text-primary" />
            <span>SaveIT</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {session ? (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <img src={session.user?.image ?? ''} alt="User Image" className="h-6 w-6 rounded-full" />
                  <span className="text-sm">{session.user?.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoading || sessionLoading}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                {/* Mobile Auth Buttons */}
                <div className="flex md:hidden gap-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="px-2">
                      <LogIn className="h-4 w-4" />
                      <span className="sr-only">Login</span>
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="px-2">
                      <UserPlus className="h-4 w-4" />
                      <span className="sr-only">Sign Up</span>
                    </Button>
                  </Link>
                </div>

                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex gap-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </>
            )}

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}