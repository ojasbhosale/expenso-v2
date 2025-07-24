"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, PieChartIcon, BarChart3, Activity, Sparkles, DollarSign } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface CategoryStats {
  category: string
  amount: number
  count: number
}

interface MonthlyStats {
  month: string
  amount: number
}

const COLORS = [
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5A2B", // Brown
  "#EC4899", // Pink
  "#6366F1", // Indigo
]

// Helper functions for safe number formatting
const formatCurrency = (value: any): string => {
  const num = Number(value) || 0
  return num.toFixed(2)
}

const formatNumber = (value: any): number => {
  return Number(value) || 0
}

export default function StatsPage() {
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { setOpenMobile, isMobile } = useSidebar()

  // Close mobile sidebar when component mounts
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [isMobile, setOpenMobile])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch category stats
      const categoryResponse = await fetch(`${API_BASE_URL}/stats/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Fetch monthly stats
      const monthlyResponse = await fetch(`${API_BASE_URL}/stats/monthly`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json()
        // Ensure all amounts are properly formatted numbers
        const formattedCategoryData = categoryData.map((item: any) => ({
          ...item,
          amount: formatNumber(item.amount),
          count: formatNumber(item.count),
        }))
        setCategoryStats(formattedCategoryData)
      }

      if (monthlyResponse.ok) {
        const monthlyData = await monthlyResponse.json()
        // Ensure all amounts are properly formatted numbers
        const formattedMonthlyData = monthlyData.map((item: any) => ({
          ...item,
          amount: formatNumber(item.amount),
        }))
        setMonthlyStats(formattedMonthlyData)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate summary stats
  const totalSpent = categoryStats.reduce((sum, cat) => sum + cat.amount, 0)
  const totalTransactions = categoryStats.reduce((sum, cat) => sum + cat.count, 0)
  const avgPerTransaction = totalTransactions > 0 ? totalSpent / totalTransactions : 0
  const topCategory = categoryStats.length > 0 ? categoryStats[0] : null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg w-48 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>

          {/* Summary Cards Skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-purple-500" />
              Statistics
            </h1>
            <p className="text-gray-600 text-lg">Analyze your spending patterns and trends</p>
          </div>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="stat-card-1 text-white border-0 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-500 hover:-translate-y-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Spent</CardTitle>
              <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${formatCurrency(totalSpent)}</div>
              <p className="text-xs text-blue-100 flex items-center mt-2">
                <Sparkles className="h-3 w-3 mr-1" />
                Across all categories
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card-2 text-white border-0 shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-500 hover:-translate-y-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Transactions</CardTitle>
              <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Activity className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTransactions}</div>
              <p className="text-xs text-purple-100 flex items-center mt-2">
                <TrendingUp className="h-3 w-3 mr-1" />
                Total expenses recorded
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card-3 text-white border-0 shadow-2xl shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-500 hover:-translate-y-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-pink-100">Average/Transaction</CardTitle>
              <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${formatCurrency(avgPerTransaction)}</div>
              <p className="text-xs text-pink-100 flex items-center mt-2">
                <Activity className="h-3 w-3 mr-1" />
                Per expense entry
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card-4 text-white border-0 shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-500 hover:-translate-y-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-100">Top Category</CardTitle>
              <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <PieChartIcon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold truncate">{topCategory?.category || "N/A"}</div>
              <p className="text-xs text-indigo-100 flex items-center mt-2">
                <DollarSign className="h-3 w-3 mr-1" />${formatCurrency(topCategory?.amount || 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="card-modern border-0 shadow-2xl shadow-blue-500/10 hover:shadow-purple-500/20 transition-all duration-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Expenses by Category
                  </CardTitle>
                  <CardDescription className="text-gray-600">Amount spent per category</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer
                config={{
                  amount: {
                    label: "Amount ($)",
                    color: "#8B5CF6",
                  },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryStats} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value: any) => [`$${formatCurrency(value)}`, "Amount"]}
                    />
                    <Bar dataKey="amount" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#A855F7" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="card-modern border-0 shadow-2xl shadow-blue-500/10 hover:shadow-purple-500/20 transition-all duration-500">
            <CardHeader className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <PieChartIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Category Distribution
                  </CardTitle>
                  <CardDescription className="text-gray-600">Spending breakdown by percentage</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer
                config={{
                  amount: {
                    label: "Amount ($)",
                    color: "#10B981",
                  },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#10B981"
                      dataKey="amount"
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value: any) => [`$${formatCurrency(value)}`, "Amount"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="card-modern border-0 shadow-2xl shadow-blue-500/10 hover:shadow-purple-500/20 transition-all duration-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-cyan-50 to-sky-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Monthly Trends
                  </CardTitle>
                  <CardDescription className="text-gray-600">Spending trends over time</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer
                config={{
                  amount: {
                    label: "Amount ($)",
                    color: "#06B6D4",
                  },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value: any) => [`$${formatCurrency(value)}`, "Amount"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="url(#lineGradient)"
                      strokeWidth={4}
                      dot={{ fill: "#06B6D4", strokeWidth: 3, r: 6 }}
                      activeDot={{ r: 8, stroke: "#06B6D4", strokeWidth: 3, fill: "#ffffff" }}
                    />
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#06B6D4" />
                        <stop offset="100%" stopColor="#0891B2" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="card-modern border-0 shadow-2xl shadow-blue-500/10 hover:shadow-purple-500/20 transition-all duration-500">
            <CardHeader className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    Transaction Count
                  </CardTitle>
                  <CardDescription className="text-gray-600">Number of expenses per category</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer
                config={{
                  count: {
                    label: "Count",
                    color: "#F59E0B",
                  },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryStats} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value: any) => [formatNumber(value), "Count"]}
                    />
                    <Bar dataKey="count" fill="url(#countGradient)" radius={[6, 6, 0, 0]} />
                    <defs>
                      <linearGradient id="countGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#D97706" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {categoryStats.length === 0 && (
          <Card className="card-modern border-0 shadow-2xl shadow-blue-500/10">
            <CardContent className="text-center py-16">
              <div className="h-20 w-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-10 w-10 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                No data available for statistics
              </h3>
              <p className="text-gray-400 text-lg mb-6">Add some expenses to see beautiful charts and analytics!</p>
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">Start tracking your expenses to unlock insights</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
