// Core types for the application
export interface User {
  id: number
  name: string
  email: string
}

export interface Category {
  id: number
  name: string
  description?: string
  expense_count: number
  total_amount: number
  user_id: number
  created_at: string
  updated_at: string
}

export interface Expense {
  id: number
  amount: number
  description: string
  category_id: number
  category_name: string
  user_id: number
  date: string
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  totalExpenses: number
  monthlyExpenses: number
  totalCategories: number
  recentExpenses: RecentExpense[]
}

export interface RecentExpense {
  id: number
  amount: number
  description: string
  category: string
  date: string
}

export interface CategoryStats {
  category: string
  amount: number
  count: number
}

export interface MonthlyStats {
  month: string
  amount: number
}

export interface ApiResponse<T = unknown> {
  message: string
  data?: T
}

export interface AuthResponse {
  message: string
  token: string
  user: User
}

// Form types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
}

export interface ExpenseFormData {
  amount: number
  description: string
  category_id: number
  date: string
}

export interface CategoryFormData {
  name: string
  description?: string
}

// Chart data types
export interface ChartDataPoint {
  name: string
  value: number
  color?: string
}

export interface LineChartDataPoint {
  month: string
  amount: number
}

export interface BarChartDataPoint {
  category: string
  amount: number
  count: number
}
