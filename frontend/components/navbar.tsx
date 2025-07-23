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
import { LogOut } from "lucide-react"

interface AppUser {
  id: number
  name: string
  email: string
}

const getPageTitle = (pathname: string) => {
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

export function Navbar() {
  const [user, setUser] = useState<AppUser | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/auth")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white/80 backdrop-blur-sm px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hover:bg-gray-100 transition-colors" />
        <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          {getPageTitle(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-colors">
              <Avatar className="h-10 w-10 ring-2 ring-purple-100">
                <AvatarImage src="/placeholder.svg" alt={user?.name || ""} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-medium">
                  {user ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-sm border-gray-200/50" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-gray-900">{user?.name}</p>
                <p className="text-xs leading-none text-gray-500">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200/50" />
            <DropdownMenuItem className="hover:bg-gray-50 transition-colors">
              <span className="text-gray-700">Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200/50" />
            <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600 transition-colors">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
