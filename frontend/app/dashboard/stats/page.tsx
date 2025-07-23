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
import { TrendingUp, PieChartIcon, BarChart3, Activity } from "lucide-react"

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

const COLORS = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5A2B"]

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

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Statistics
        </h1>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        Statistics
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-hover bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-gray-800">Expenses by Category</CardTitle>
            </div>
            <CardDescription className="text-gray-600">Distribution of expenses across categories</CardDescription>
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
                <BarChart data={categoryStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: any) => [`$${formatCurrency(value)}`, "Amount"]}
                  />
                  <Bar dataKey="amount" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="card-hover bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-green-600" />
              <CardTitle className="text-gray-800">Category Distribution</CardTitle>
            </div>
            <CardDescription className="text-gray-600">Pie chart showing expense distribution</CardDescription>
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

        <Card className="card-hover bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-gray-800">Monthly Trends</CardTitle>
            </div>
            <CardDescription className="text-gray-600">Expense trends over the last 6 months</CardDescription>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: any) => [`$${formatCurrency(value)}`, "Amount"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#06B6D4"
                    strokeWidth={3}
                    dot={{ fill: "#06B6D4", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#06B6D4", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="card-hover bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-gray-800">Expense Count by Category</CardTitle>
            </div>
            <CardDescription className="text-gray-600">Number of transactions per category</CardDescription>
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
                <BarChart data={categoryStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: any) => [formatNumber(value), "Count"]}
                  />
                  <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {categoryStats.length === 0 && (
        <Card className="card-hover bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardContent className="text-center py-12">
            <div className="h-16 w-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-gray-600 text-lg mb-2">No data available for statistics</p>
            <p className="text-gray-400 text-sm">Add some expenses to see charts and analytics!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
