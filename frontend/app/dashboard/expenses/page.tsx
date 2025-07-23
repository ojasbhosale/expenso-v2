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
import { Plus, Edit, Trash2, Receipt } from "lucide-react"

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
const formatCurrency = (value: any): string => {
  const num = Number(value) || 0
  return num.toFixed(2)
}

const formatNumber = (value: any): number => {
  return Number(value) || 0
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const { toast } = useToast()

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
          title: "Success",
          description: `Expense ${editingExpense ? "updated" : "created"} successfully!`,
        })
        setIsDialogOpen(false)
        setEditingExpense(null)
        fetchExpenses()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.message || "Failed to save expense",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
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
          title: "Success",
          description: "Expense deleted successfully!",
        })
        fetchExpenses()
      }
    } catch (error) {
      toast({
        title: "Error",
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Expenses</h1>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Expenses
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreateDialog}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {editingExpense ? "Edit Expense" : "Add New Expense"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingExpense ? "Update expense details" : "Enter expense information"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                  Amount
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={editingExpense?.amount || ""}
                  required
                  className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Expense description"
                  defaultValue={editingExpense?.description || ""}
                  required
                  className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category_id" className="text-sm font-medium text-gray-700">
                  Category
                </Label>
                <Select name="category_id" defaultValue={editingExpense?.category_id?.toString() || ""} required>
                  <SelectTrigger className="bg-gray-50 border-gray-200 focus:bg-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
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
                  className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                {editingExpense ? "Update Expense" : "Add Expense"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="card-hover bg-white/80 backdrop-blur-sm border-gray-200/50">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardTitle className="text-xl font-semibold text-gray-800">All Expenses</CardTitle>
          <CardDescription className="text-gray-600">Manage your expense records</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {expenses.length ? (
            <div className="divide-y divide-gray-100">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{expense.description}</p>
                      <p className="text-sm text-gray-500">
                        {expense.category_name} • {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">${formatCurrency(expense.amount)}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(expense)}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-gray-600 text-lg mb-2">No expenses found</p>
              <p className="text-gray-400 text-sm">Add your first expense to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
