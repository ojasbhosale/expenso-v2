"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { MobileDrawer } from "@/components/ui/mobile-drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { Plus, DollarSign, TrendingUp, CreditCard, Calendar, ArrowUpRight, Sparkles } from "lucide-react"
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils"
import type { DashboardStats, Category, ExpenseFormData } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const isMobile = useIsMobile()

  useEffect(() => {
    fetchDashboardStats()
    fetchCategories()
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
        const data: DashboardStats = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data: Category[] = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const expenseData: ExpenseFormData = {
      amount: Number.parseFloat(formData.get("amount") as string),
      description: formData.get("description") as string,
      category_id: Number.parseInt(formData.get("category_id") as string),
      date: formData.get("date") as string,
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expenseData),
      })

      if (response.ok) {
        toast({
          title: "Success! 🎉",
          description: "Expense added successfully!",
        })
        setIsDialogOpen(false)
        // Reset form
        const form = e.target as HTMLFormElement
        form.reset()
        // Refresh dashboard stats
        fetchDashboardStats()
      } else {
        const data = await response.json()
        toast({
          title: "Error 😔",
          description: data.message || "Failed to add expense",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving expense:", error)
      toast({
        title: "Network Error 🌐",
        description: "Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 container-mobile section-spacing">
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-6 sm:h-8 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg w-32 sm:w-48 loading-skeleton"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32 loading-skeleton"></div>
            </div>
            <div className="h-10 sm:h-12 w-full sm:w-32 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg sm:rounded-xl loading-skeleton"></div>
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card-modern loading-skeleton h-24 sm:h-32"></div>
            ))}
          </div>
          <div className="card-modern loading-skeleton h-64 sm:h-80"></div>
        </div>
      </div>
    )
  }

  const totalExpenses = formatNumber(stats?.totalExpenses)
  const monthlyExpenses = formatNumber(stats?.monthlyExpenses)
  const totalCategories = formatNumber(stats?.totalCategories)
  const avgDaily = monthlyExpenses / 30

  const ExpenseForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="space-y-2">
        <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
          Amount ($)
        </Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          required
          className="input-modern"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
          Description
        </Label>
        <Input
          id="description"
          name="description"
          placeholder="What did you spend on?"
          required
          className="input-modern"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category_id" className="text-sm font-medium text-gray-700">
          Category
        </Label>
        <Select name="category_id" required>
          <SelectTrigger className="input-modern">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-xl border border-blue-100 rounded-xl">
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()} className="hover:bg-blue-50 rounded-lg">
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="date" className="text-sm font-medium text-gray-700">
          Date
        </Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={new Date().toISOString().split("T")[0]}
          required
          className="input-modern"
        />
      </div>
      <Button type="submit" className="btn-modern w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Adding...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense ✨
          </>
        )}
      </Button>
    </form>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 container-mobile section-spacing">
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              Dashboard
            </h1>
            <p className="text-gray-600 text-sm sm:text-lg">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Add Expense Button */}
          {isMobile ? (
            <>
              <Button onClick={() => setIsDialogOpen(true)} className="btn-modern w-full sm:w-auto">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Add Expense
              </Button>
              <MobileDrawer isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Add New Expense">
                <div className="p-4 sm:p-6">
                  <ExpenseForm />
                </div>
              </MobileDrawer>
            </>
          ) : (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-modern">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border border-blue-100 shadow-2xl shadow-blue-500/10 rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                    <Plus className="h-6 w-6 text-purple-500" />
                    Add New Expense
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Track your spending by adding a new expense entry
                  </DialogDescription>
                </DialogHeader>
                <ExpenseForm />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          <Card className="stat-card-1 text-white border-0 shadow-lg sm:shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-100">Total Expenses</CardTitle>
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-3xl font-bold">${formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-blue-100 flex items-center mt-1 sm:mt-2">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                All time expenses
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card-2 text-white border-0 shadow-lg sm:shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-purple-100">This Month</CardTitle>
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-3xl font-bold">${formatCurrency(monthlyExpenses)}</div>
              <p className="text-xs text-purple-100 flex items-center mt-1 sm:mt-2">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Current month
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card-3 text-white border-0 shadow-lg sm:shadow-2xl shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-pink-100">Categories</CardTitle>
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-3xl font-bold">{totalCategories}</div>
              <p className="text-xs text-pink-100 flex items-center mt-1 sm:mt-2">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Active categories
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card-4 text-white border-0 shadow-lg sm:shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-indigo-100">Daily Average</CardTitle>
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-3xl font-bold">${formatCurrency(avgDaily)}</div>
              <p className="text-xs text-indigo-100 flex items-center mt-1 sm:mt-2">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Average per day
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Expenses */}
        <Card className="card-modern border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-t-xl sm:rounded-t-2xl p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
              Recent Expenses
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm sm:text-base">
              Your latest expense entries
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {stats?.recentExpenses?.length ? (
              <div className="divide-y divide-blue-100">
                {stats.recentExpenses.map((expense, index) => (
                  <div
                    key={expense.id}
                    className="expense-item flex items-center justify-between p-4 sm:p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                      <div
                        className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                          index % 4 === 0
                            ? "bg-gradient-to-br from-blue-400 to-blue-500"
                            : index % 4 === 1
                              ? "bg-gradient-to-br from-purple-400 to-purple-500"
                              : index % 4 === 2
                                ? "bg-gradient-to-br from-pink-400 to-pink-500"
                                : "bg-gradient-to-br from-indigo-400 to-indigo-500"
                        }`}
                      >
                        <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                          {expense.description}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {expense.category} • {formatDate(expense.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ${formatCurrency(expense.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16 p-4 sm:p-6">
                <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 sm:h-10 sm:w-10 text-purple-500" />
                </div>
                <p className="text-gray-600 text-lg sm:text-xl font-medium mb-2">No expenses yet</p>
                <p className="text-gray-400 text-sm sm:text-base">Start tracking your expenses to see them here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
