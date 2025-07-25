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
import { Plus, Edit, Trash2, Receipt, DollarSign } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface Expense {
  id: number
  amount: number
  description: string
  category_id: number
  category_name: string
  date: string
}

interface Category {
  id: number
  name: string
}

// Add these helper functions at the top of the component
const formatCurrency = (value: number | string | null | undefined): string => {
  const num = Number(value) || 0
  return num.toFixed(2)
}





export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const { toast } = useToast()
  const { setOpenMobile, isMobile } = useSidebar()

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

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
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
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const expenseData = {
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
      console.error("Error saving expense:", error)
      toast({
        title: "Network Error 🌐",
        description: "Please check your connection and try again.",
        variant: "destructive",
      })
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg w-48 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-gradient-to-r from-blue-200 to-purple-200 rounded-xl animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl animate-pulse"></div>
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
              <Receipt className="h-8 w-8 text-purple-500" />
              Expenses
            </h1>
            <p className="text-gray-600 text-lg">Manage and track all your expenses</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openCreateDialog}
                className="btn-modern shadow-2xl shadow-blue-500/25 hover:shadow-purple-500/30"
              >
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
              <form onSubmit={handleSubmit} className="space-y-5">
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
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                          className="hover:bg-blue-50 rounded-lg"
                        >
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
                <Button type="submit" className="btn-modern w-full">
                  {editingExpense ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Expense ✨
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense ✨
                    </>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="card-modern border-0 shadow-2xl shadow-blue-500/10">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-t-2xl">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-purple-500" />
              All Expenses
            </CardTitle>
            <CardDescription className="text-gray-600">Manage and track all your expense records</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {expenses.length ? (
              <div className="divide-y divide-blue-100">
                {expenses.map((expense, index) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                          index % 4 === 0
                            ? "bg-gradient-to-br from-blue-400 to-blue-500"
                            : index % 4 === 1
                              ? "bg-gradient-to-br from-purple-400 to-purple-500"
                              : index % 4 === 2
                                ? "bg-gradient-to-br from-pink-400 to-pink-500"
                                : "bg-gradient-to-br from-indigo-400 to-indigo-500"
                        }`}
                      >
                        <Receipt className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-lg">{expense.description}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                            {expense.category_name}
                          </span>
                          • {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ${formatCurrency(expense.amount)}
                        </div>
                      </div>
                      <div className="flex gap-2 ">
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
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="h-20 w-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="h-10 w-10 text-purple-500" />
                </div>
                <p className="text-gray-600 text-xl font-medium mb-2">No expenses found</p>
                <p className="text-gray-400">Add your first expense to get started tracking your spending!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
