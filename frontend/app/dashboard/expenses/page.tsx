"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useSidebar } from "@/components/ui/sidebar"
import { Plus, Edit, Trash2, Receipt, DollarSign, Search, Filter, MoreVertical } from "lucide-react"
import { formatCurrency, formatDate, truncateText } from "@/lib/utils"
import type { Expense, Category, ExpenseFormData } from "@/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const { toast } = useToast()
  const { setOpenMobile, isMobile } = useSidebar()
  const isMobileDevice = useIsMobile()

  // Close mobile sidebar when component mounts
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [isMobile, setOpenMobile])

  useEffect(() => {
    fetchExpenses()
    fetchCategories()
  }, [])

  // Filter expenses based on search and category
  useEffect(() => {
    let filtered = expenses

    if (searchTerm) {
      filtered = filtered.filter(
        (expense) =>
          expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.category_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((expense) => expense.category_id.toString() === selectedCategory)
    }

    setFilteredExpenses(filtered)
  }, [expenses, searchTerm, selectedCategory])

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data: Expense[] = await response.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error("Error fetching expenses:", error)
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
      const url = editingExpense ? `${API_BASE_URL}/expenses/${editingExpense.id}` : `${API_BASE_URL}/expenses`

      const response = await fetch(url, {
        method: editingExpense ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expenseData),
      })

      if (response.ok) {
        toast({
          title: "Success! 🎉",
          description: `Expense ${editingExpense ? "updated" : "created"} successfully!`,
        })
        setIsDialogOpen(false)
        setEditingExpense(null)
        fetchExpenses()
      } else {
        const data = await response.json()
        toast({
          title: "Error 😔",
          description: data.message || "Failed to save expense",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting expense:", error)
      toast({
        title: "Network Error 🌐",
        description: "Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Success! ✨",
          description: "Expense deleted successfully!",
        })
        fetchExpenses()
      }
    } catch (error) {
      console.error("Error deleting expense:", error)
      toast({
        title: "Error 😔",
        description: "Failed to delete expense",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense)
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingExpense(null)
    setIsDialogOpen(true)
  }

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
          defaultValue={editingExpense?.amount || ""}
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
          defaultValue={editingExpense?.description || ""}
          required
          className="input-modern"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category_id" className="text-sm font-medium text-gray-700">
          Category
        </Label>
        <Select name="category_id" defaultValue={editingExpense?.category_id?.toString() || ""} required>
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
          defaultValue={editingExpense?.date?.split("T")[0] || new Date().toISOString().split("T")[0]}
          required
          className="input-modern"
        />
      </div>
      <Button type="submit" className="btn-modern w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            {editingExpense ? "Updating..." : "Adding..."}
          </>
        ) : (
          <>
            {editingExpense ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {editingExpense ? "Update Expense ✨" : "Add Expense ✨"}
          </>
        )}
      </Button>
    </form>
  )

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
          <div className="space-y-3 sm:space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 sm:h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl loading-skeleton"
              ></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 container-mobile section-spacing">
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
              <Receipt className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              Expenses
            </h1>
            <p className="text-gray-600 text-sm sm:text-lg">Manage and track all your expenses</p>
          </div>

          {/* Add Expense Button */}
          {isMobileDevice ? (
            <>
              <Button onClick={openCreateDialog} className="btn-modern w-full sm:w-auto">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Add Expense
              </Button>
              <MobileDrawer
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title={editingExpense ? "Edit Expense" : "Add New Expense"}
              >
                <div className="p-4 sm:p-6">
                  <ExpenseForm />
                </div>
              </MobileDrawer>
            </>
          ) : (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="btn-modern">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border border-blue-100 shadow-2xl shadow-blue-500/10 rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                    {editingExpense ? (
                      <>
                        <Edit className="h-6 w-6 text-purple-500" />
                        Edit Expense
                      </>
                    ) : (
                      <>
                        <Plus className="h-6 w-6 text-purple-500" />
                        Add New Expense
                      </>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    {editingExpense ? "Update your expense details" : "Track your spending by adding a new expense"}
                  </DialogDescription>
                </DialogHeader>
                <ExpenseForm />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="input-modern w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl border border-blue-100 rounded-xl">
                <SelectItem value="all" className="hover:bg-blue-50 rounded-lg">
                  All Categories
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()} className="hover:bg-blue-50 rounded-lg">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Expenses List */}
        <Card className="card-modern border-0 shadow-lg sm:shadow-2xl shadow-blue-500/10">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-t-xl sm:rounded-t-2xl p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
              All Expenses ({filteredExpenses.length})
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm sm:text-base">
              Manage and track all your expense records
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredExpenses.length ? (
              <div className="divide-y divide-blue-100">
                {filteredExpenses.map((expense, index) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 sm:p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                      <div
                        className={`h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 flex-shrink-0 ${
                          index % 4 === 0
                            ? "bg-gradient-to-br from-blue-400 to-blue-500"
                            : index % 4 === 1
                              ? "bg-gradient-to-br from-purple-400 to-purple-500"
                              : index % 4 === 2
                                ? "bg-gradient-to-br from-pink-400 to-pink-500"
                                : "bg-gradient-to-br from-indigo-400 to-indigo-500"
                        }`}
                      >
                        <Receipt className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 text-sm sm:text-lg truncate">
                          {isMobileDevice ? truncateText(expense.description, 20) : expense.description}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium inline-block w-fit">
                            {isMobileDevice ? truncateText(expense.category_name, 12) : expense.category_name}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">{formatDate(expense.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ${formatCurrency(expense.amount)}
                        </div>
                      </div>

                      {/* Mobile: Dropdown Menu */}
                      {isMobileDevice ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full touch-target"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-white/95 backdrop-blur-xl border border-blue-100 rounded-xl"
                          >
                            <DropdownMenuItem
                              onClick={() => openEditDialog(expense)}
                              className="hover:bg-blue-50 rounded-lg cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2 text-blue-600" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(expense.id)}
                              className="hover:bg-red-50 text-red-600 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        /* Desktop: Inline Buttons */
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(expense)}
                            className="h-10 w-10 p-0 bg-white/80 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(expense.id)}
                            className="h-10 w-10 p-0 bg-white/80 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl shadow-lg hover:shadow-red-500/20 transition-all duration-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16 p-4 sm:p-6">
                <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="h-8 w-8 sm:h-10 sm:w-10 text-purple-500" />
                </div>
                <p className="text-gray-600 text-lg sm:text-xl font-medium mb-2">
                  {searchTerm || selectedCategory !== "all" ? "No matching expenses found" : "No expenses found"}
                </p>
                <p className="text-gray-400 text-sm sm:text-base">
                  {searchTerm || selectedCategory !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Add your first expense to get started tracking your spending!"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
