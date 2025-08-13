"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const validateToken = async (token: string) => {
    try {
      // Make a quick API call to validate the token
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      return response.ok
    } catch (error) {
      console.error("Token validation error:", error)
      return false
    }
  }

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token")
        const user = localStorage.getItem("user")

        if (!token || !user) {
          // No token or user data found
          setIsAuthenticated(false)
          setIsLoading(false)
          router.push("/auth")
          return
        }

        // Validate token with backend
        const isValidToken = await validateToken(token)
        
        if (isValidToken) {
          // Token is valid, user remains logged in
          setIsAuthenticated(true)
        } else {
          // Token is invalid or expired, clear storage and redirect
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          setIsAuthenticated(false)
          router.push("/auth")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        // On error, assume user needs to login again
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setIsAuthenticated(false)
        router.push("/auth")
      } finally {
        setIsLoading(false)
      }
    }

    // Add a small delay to ensure localStorage is available
    const timeoutId = setTimeout(() => {
      checkAuthStatus()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [router])

  // Listen for storage changes (useful for multi-tab scenarios)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" && !e.newValue) {
        // Token was removed, user logged out in another tab
        setIsAuthenticated(false)
        router.push("/auth")
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to auth page
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}