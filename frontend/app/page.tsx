"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const token = localStorage.getItem("token")
        const user = localStorage.getItem("user")

        if (!token || !user) {
          // No authentication data, redirect to auth page
          router.replace("/auth")
          return
        }

        // Validate token with backend
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          // Token is valid, redirect to dashboard
          router.replace("/dashboard")
        } else {
          // Token is invalid, clear storage and redirect to auth
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.replace("/auth")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        // On error, redirect to auth
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.replace("/auth")
      } finally {
        setIsLoading(false)
      }
    }

    // Add a small delay to ensure localStorage is available
    const timeoutId = setTimeout(() => {
      checkAuthAndRedirect()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // This will not be reached as we redirect before setting isLoading to false
  return null
}