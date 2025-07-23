"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface DashboardStats {
  totalExpenses: number
  monthlyExpenses: number
  totalCategories: number
  recentExpenses: Array<{
    id: number
    amount: number
    description: string
    category: string
    date: string
  }>
}

// Helper function to safely format numbers
const formatCurrency = (value: any): string => {
  const num = Number(value) || 0
  return num.toFixed(2)
}

const formatNumber = (value: any): number => {
  return Number(value) || 0
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const totalExpenses = formatNumber(stats?.totalExpenses)
  const monthlyExpenses = formatNumber(stats?.monthlyExpenses)
  const totalCategories = formatNumber(stats?.totalCategories)
  const avgDaily = monthlyExpenses / 30

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Total Expenses</CardTitle>
            <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-purple-100 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              All time expenses
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">This Month</CardTitle>
            <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatCurrency(monthlyExpenses)}</div>
            <p className="text-xs text-blue-100 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Current month expenses
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Categories</CardTitle>
            <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-green-100 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Active categories
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Avg. Daily</CardTitle>
            <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatCurrency(avgDaily)}</div>
            <p className="text-xs text-orange-100 flex items-center mt-1">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              Average per day
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover bg-white/80 backdrop-blur-sm border-gray-200/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">Recent Expenses</CardTitle>
          <CardDescription className="text-gray-600">Your latest expense entries</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentExpenses?.length ? (
            <div className="space-y-4">
              {stats.recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{expense.description}</p>
                      <p className="text-sm text-gray-500">
                        {expense.category} • {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">${formatCurrency(expense.amount)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No expenses yet</p>
              <p className="text-gray-400 text-sm">Start tracking your expenses to see them here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
