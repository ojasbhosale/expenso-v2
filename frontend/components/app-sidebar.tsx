"use client"

import { Home, Receipt, Tag, BarChart3, Sparkles, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"

const items = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: Home,
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "Expenses",
    url: "/dashboard/expenses",
    icon: Receipt,
    color: "from-purple-500 to-purple-600",
  },
  {
    title: "Categories",
    url: "/dashboard/categories",
    icon: Tag,
    color: "from-pink-500 to-pink-600",
  },
  {
    title: "Statistics",
    url: "/dashboard/stats",
    icon: BarChart3,
    color: "from-indigo-500 to-indigo-600",
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { setOpenMobile, isMobile } = useSidebar()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/auth")
  }

  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar className="sidebar-modern border-0 shadow-xl shadow-blue-500/10">
      <SidebarHeader className="border-b border-blue-100 px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/25">
            <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Expenso
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Sparkles className="h-3 w-3" />
              Smart Tracking
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 sm:px-4 py-4 sm:py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium mb-3 sm:mb-4 text-xs sm:text-sm">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 sm:space-y-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className={`rounded-lg sm:rounded-xl p-2.5 sm:p-3 transition-all duration-300 hover:shadow-lg touch-target ${
                      pathname === item.url
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg hover:shadow-xl`
                        : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-gray-800"
                    }`}
                  >
                    <Link href={item.url} className="flex items-center gap-3 min-w-0" onClick={handleMenuClick}>
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-blue-100 p-3 sm:p-4 safe-area-inset-bottom">
        <Button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white font-medium rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-pink-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base touch-target"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
