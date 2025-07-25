"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { LogOut, User, Sparkles } from "lucide-react"
import { getInitials } from "@/lib/utils"
import type { User as UserType } from "@/types"

const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case "/dashboard":
      return "Overview"
    case "/dashboard/expenses":
      return "Expenses"
    case "/dashboard/categories":
      return "Categories"
    case "/dashboard/stats":
      return "Statistics"
    default:
      return "Dashboard"
  }
}

const getPageIcon = (pathname: string): string => {
  switch (pathname) {
    case "/dashboard":
      return "🏠"
    case "/dashboard/expenses":
      return "💰"
    case "/dashboard/categories":
      return "🏷️"
    case "/dashboard/stats":
      return "📊"
    default:
      return "📱"
  }
}

export function Navbar() {
  const [user, setUser] = useState<UserType | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/auth")
  }

  return (
    <header className="navbar-modern flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 shadow-sm safe-area-inset-top">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <SidebarTrigger className="hover:bg-blue-50 transition-colors rounded-lg p-2 touch-target lg:hidden" />

        {/* Mobile: Compact title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <span className="text-lg sm:text-2xl">{getPageIcon(pathname)}</span>
          <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
            {getPageTitle(pathname)}
          </h1>
        </div>
      </div>

      {/* Welcome Message - Hidden on mobile, visible on desktop */}
      <div className="hidden xl:block flex-shrink-0 mx-4">
        <p className="text-sm text-gray-600 whitespace-nowrap">
          Welcome back,{" "}
          <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {user?.name?.split(" ")[0] || "User"}
          </span>
          ! 👋
        </p>
      </div>

      {/* User Menu */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl hover:bg-blue-50 transition-all duration-300 hover:shadow-lg touch-target"
            >
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-blue-200 shadow-lg">
                <AvatarImage src="/placeholder.svg" alt={user?.name || ""} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white font-bold text-xs sm:text-sm">
                  {user ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 sm:w-64 bg-white/95 backdrop-blur-xl border border-blue-100 shadow-2xl shadow-blue-500/10 rounded-xl sm:rounded-2xl"
            align="end"
            forceMount
          >
            <DropdownMenuLabel className="font-normal p-3 sm:p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                </div>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-blue-100" />
            <DropdownMenuItem className="hover:bg-blue-50 transition-colors rounded-lg m-1 p-3 cursor-pointer">
              <User className="mr-3 h-4 w-4 text-blue-500" />
              <span className="text-gray-700">Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-blue-100" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg m-1 p-3 cursor-pointer"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
