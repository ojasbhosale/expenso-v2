"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Plus, Edit, Trash2, Tag, TrendingUp, Receipt, Search, MoreVertical } from "lucide-react"
import { formatCurrency, formatNumber, truncateText } from "@/lib/utils"
import type { Category, CategoryFormData } from "@/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
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
    fetchCategories()
  }, [])

  // Filter categories based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = categories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(categories)
    }
  }, [categories, searchTerm])

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
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const categoryData: CategoryFormData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    }

    try {
      const token = localStorage.getItem("token")
      const url = editingCategory ? `${API_BASE_URL}/categories/${editingCategory.id}` : `${API_BASE_URL}/categories`

      const response = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      })

      if (response.ok) {
        toast({
          title: "Success! 🎉",
          description: `Category ${editingCategory ? "updated" : "created"} successfully!`,
        })
        setIsDialogOpen(false)
        setEditingCategory(null)
        fetchCategories()
      } else {
        const data = await response.json()
        toast({
          title: "Error 😔",
          description: data.message || "Failed to save category",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
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
    if (!confirm("Are you sure you want to delete this category? This will also delete all associated expenses."))
      return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Success! ✨",
          description: "Category deleted successfully!",
        })
        fetchCategories()
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error 😔",
        description: "Failed to delete category",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingCategory(null)
    setIsDialogOpen(true)
  }

  const CategoryForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
          Category Name
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g., Food & Dining"
          defaultValue={editingCategory?.name || ""}
          required
          className="input-modern"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
          Description (Optional)
        </Label>
        <Input
          id="description"
          name="description"
          placeholder="Brief description of this category"
          defaultValue={editingCategory?.description || ""}
          className="input-modern"
        />
      </div>
      <Button type="submit" className="btn-modern w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            {editingCategory ? "Updating..." : "Creating..."}
          </>
        ) : (
          <>
            {editingCategory ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {editingCategory ? "Update Category ✨" : "Create Category ✨"}
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
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-40 sm:h-48 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl loading-skeleton"
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
              <Tag className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              Categories
            </h1>
            <p className="text-gray-600 text-sm sm:text-lg">Organize and manage your expense categories</p>
          </div>

          {/* Add Category Button */}
          {isMobileDevice ? (
            <>
              <Button onClick={openCreateDialog} className="btn-modern w-full sm:w-auto">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Add Category
              </Button>
              <MobileDrawer
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title={editingCategory ? "Edit Category" : "Add New Category"}
              >
                <div className="p-4 sm:p-6">
                  <CategoryForm />
                </div>
              </MobileDrawer>
            </>
          ) : (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="btn-modern">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border border-blue-100 shadow-2xl shadow-blue-500/10 rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                    {editingCategory ? (
                      <>
                        <Edit className="h-6 w-6 text-purple-500" />
                        Edit Category
                      </>
                    ) : (
                      <>
                        <Plus className="h-6 w-6 text-purple-500" />
                        Add New Category
                      </>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    {editingCategory
                      ? "Update your category details"
                      : "Create a new category to organize your expenses"}
                  </DialogDescription>
                </DialogHeader>
                <CategoryForm />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-modern pl-10"
          />
        </div>

        {/* Categories Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category, index) => (
            <Card
              key={category.id}
              className="card-modern border-0 shadow-lg sm:shadow-2xl shadow-blue-500/10 hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2 group overflow-hidden"
            >
              <CardHeader
                className={`pb-3 sm:pb-4 relative ${
                  index % 4 === 0
                    ? "bg-gradient-to-br from-blue-50 via-blue-100 to-purple-50"
                    : index % 4 === 1
                      ? "bg-gradient-to-br from-purple-50 via-purple-100 to-pink-50"
                      : index % 4 === 2
                        ? "bg-gradient-to-br from-pink-50 via-pink-100 to-red-50"
                        : "bg-gradient-to-br from-indigo-50 via-indigo-100 to-blue-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 flex-shrink-0 ${
                        index % 4 === 0
                          ? "bg-gradient-to-br from-blue-400 to-blue-500"
                          : index % 4 === 1
                            ? "bg-gradient-to-br from-purple-400 to-purple-500"
                            : index % 4 === 2
                              ? "bg-gradient-to-br from-pink-400 to-pink-500"
                              : "bg-gradient-to-br from-indigo-400 to-indigo-500"
                      }`}
                    >
                      <Tag className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg font-bold text-gray-800 truncate">
                        {isMobileDevice ? truncateText(category.name, 15) : category.name}
                      </CardTitle>
                    </div>
                  </div>

                  {/* Mobile: Dropdown Menu */}
                  {isMobileDevice ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity touch-target"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-white/95 backdrop-blur-xl border border-blue-100 rounded-xl"
                      >
                        <DropdownMenuItem
                          onClick={() => openEditDialog(category)}
                          className="hover:bg-blue-50 rounded-lg cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2 text-blue-600" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(category.id)}
                          className="hover:bg-red-50 text-red-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    /* Desktop: Inline Buttons */
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(category)}
                        className="h-8 w-8 p-0 hover:bg-white/80 hover:text-blue-600 rounded-xl"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="h-8 w-8 p-0 hover:bg-white/80 hover:text-red-600 rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {category.description && (
                  <CardDescription className="text-gray-600 mt-2 text-xs sm:text-sm leading-relaxed">
                    {isMobileDevice ? truncateText(category.description, 50) : category.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-3 sm:pt-4 space-y-3 sm:space-y-4 p-4 sm:p-6">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                    <div className="flex items-center justify-center mb-1 sm:mb-2">
                      <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-blue-700">
                      {formatNumber(category.expense_count)}
                    </div>
                    <div className="text-xs text-blue-600 font-medium">Expenses</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                    <div className="flex items-center justify-center mb-1 sm:mb-2">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-green-700">
                      ${formatCurrency(category.total_amount)}
                    </div>
                    <div className="text-xs text-green-600 font-medium">Total</div>
                  </div>
                </div>

                {/* Progress bar showing relative spending */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Activity Level</span>
                    <span>{category.expense_count > 0 ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        category.expense_count > 10
                          ? "bg-gradient-to-r from-green-400 to-green-500"
                          : category.expense_count > 5
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                            : category.expense_count > 0
                              ? "bg-gradient-to-r from-blue-400 to-blue-500"
                              : "bg-gray-300"
                      }`}
                      style={{
                        width: `${Math.min((category.expense_count / 20) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <Card className="card-modern border-0 shadow-lg sm:shadow-2xl shadow-blue-500/10">
            <CardContent className="text-center py-12 sm:py-16 p-4 sm:p-6">
              <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Tag className="h-8 w-8 sm:h-10 sm:w-10 text-purple-500" />
              </div>
              <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {searchTerm ? "No matching categories found" : "No categories found"}
              </h3>
              <p className="text-gray-400 text-sm sm:text-lg mb-6">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Create your first category to start organizing your expenses!"}
              </p>
              {!searchTerm && (
                <Button onClick={openCreateDialog} className="btn-modern">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Category ✨
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
