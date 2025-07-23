const express = require("express")
const cors = require("cors")
const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "expenso_db",
}

let db

async function initializeDatabase() {
  try {
    db = await mysql.createConnection(dbConfig)
    console.log("Connected to MySQL database")

    // Create tables if they don't exist
    await createTables()
  } catch (error) {
    console.error("Database connection failed:", error)
    process.exit(1)
  }
}

async function createTables() {
  try {
    // Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Categories table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Expenses table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        category_id INT NOT NULL,
        user_id INT NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    console.log("Database tables created successfully")
  } catch (error) {
    console.error("Error creating tables:", error)
  }
}

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Access token required" })
  }

  jwt.verify(token, process.env.JWT_SECRET || "your-secret-key", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" })
    }
    req.user = user
    next()
  })
}

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const [existingUsers] = await db.execute("SELECT id FROM users WHERE email = ?", [email])

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const [result] = await db.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
      name,
      email,
      hashedPassword,
    ])

    // Create default categories for new user
    const userId = result.insertId
    const defaultCategories = [
      { name: "Food & Dining", description: "Restaurant meals, groceries, and food delivery" },
      { name: "Transportation", description: "Gas, public transport, rideshare, and vehicle maintenance" },
      { name: "Shopping", description: "Clothing, electronics, and general purchases" },
      { name: "Entertainment", description: "Movies, games, subscriptions, and leisure activities" },
      { name: "Bills & Utilities", description: "Rent, electricity, water, internet, and phone bills" },
      { name: "Healthcare", description: "Medical expenses, pharmacy, and health insurance" },
    ]

    for (const category of defaultCategories) {
      await db.execute("INSERT INTO categories (name, description, user_id) VALUES (?, ?, ?)", [
        category.name,
        category.description,
        userId,
      ])
    }

    // Generate JWT token
    const token = jwt.sign({ userId: userId, email: email }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "24h",
    })

    res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: userId, name, email },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const [users] = await db.execute("SELECT id, name, email, password FROM users WHERE email = ?", [email])

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const user = users[0]

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "24h",
    })

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Dashboard Routes
app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    // Get total expenses
    const [totalResult] = await db.execute("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ?", [
      userId,
    ])

    // Get monthly expenses
    const [monthlyResult] = await db.execute(
      `SELECT COALESCE(SUM(amount), 0) as monthly 
       FROM expenses 
       WHERE user_id = ? AND MONTH(date) = MONTH(CURRENT_DATE()) AND YEAR(date) = YEAR(CURRENT_DATE())`,
      [userId],
    )

    // Get total categories
    const [categoriesResult] = await db.execute("SELECT COUNT(*) as count FROM categories WHERE user_id = ?", [userId])

    // Get recent expenses
    const [recentExpenses] = await db.execute(
      `SELECT e.id, e.amount, e.description, e.date, c.name as category
       FROM expenses e
       JOIN categories c ON e.category_id = c.id
       WHERE e.user_id = ?
       ORDER BY e.created_at DESC
       LIMIT 5`,
      [userId],
    )

    // Ensure all numbers are properly formatted
    const formattedRecentExpenses = recentExpenses.map((expense) => ({
      ...expense,
      amount: Number.parseFloat(expense.amount) || 0,
    }))

    res.json({
      totalExpenses: Number.parseFloat(totalResult[0].total) || 0,
      monthlyExpenses: Number.parseFloat(monthlyResult[0].monthly) || 0,
      totalCategories: Number.parseInt(categoriesResult[0].count) || 0,
      recentExpenses: formattedRecentExpenses,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Categories Routes
app.get("/api/categories", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const [categories] = await db.execute(
      `SELECT c.*, 
              COUNT(e.id) as expense_count,
              COALESCE(SUM(e.amount), 0) as total_amount
       FROM categories c
       LEFT JOIN expenses e ON c.id = e.category_id
       WHERE c.user_id = ?
       GROUP BY c.id
       ORDER BY c.name`,
      [userId],
    )

    // Ensure all numbers are properly formatted
    const formattedCategories = categories.map((category) => ({
      ...category,
      expense_count: Number.parseInt(category.expense_count) || 0,
      total_amount: Number.parseFloat(category.total_amount) || 0,
    }))

    res.json(formattedCategories)
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.post("/api/categories", authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body
    const userId = req.user.userId

    const [result] = await db.execute("INSERT INTO categories (name, description, user_id) VALUES (?, ?, ?)", [
      name,
      description || null,
      userId,
    ])

    res.status(201).json({
      message: "Category created successfully",
      id: result.insertId,
    })
  } catch (error) {
    console.error("Create category error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.put("/api/categories/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { name, description } = req.body
    const userId = req.user.userId

    await db.execute("UPDATE categories SET name = ?, description = ? WHERE id = ? AND user_id = ?", [
      name,
      description || null,
      id,
      userId,
    ])

    res.json({ message: "Category updated successfully" })
  } catch (error) {
    console.error("Update category error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.delete("/api/categories/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    await db.execute("DELETE FROM categories WHERE id = ? AND user_id = ?", [id, userId])

    res.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Delete category error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Expenses Routes
app.get("/api/expenses", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const [expenses] = await db.execute(
      `SELECT e.*, c.name as category_name
       FROM expenses e
       JOIN categories c ON e.category_id = c.id
       WHERE e.user_id = ?
       ORDER BY e.date DESC, e.created_at DESC`,
      [userId],
    )

    // Ensure all amounts are properly formatted
    const formattedExpenses = expenses.map((expense) => ({
      ...expense,
      amount: Number.parseFloat(expense.amount) || 0,
    }))

    res.json(formattedExpenses)
  } catch (error) {
    console.error("Get expenses error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.post("/api/expenses", authenticateToken, async (req, res) => {
  try {
    const { amount, description, category_id, date } = req.body
    const userId = req.user.userId

    // Verify category belongs to user
    const [categories] = await db.execute("SELECT id FROM categories WHERE id = ? AND user_id = ?", [
      category_id,
      userId,
    ])

    if (categories.length === 0) {
      return res.status(400).json({ message: "Invalid category" })
    }

    const [result] = await db.execute(
      "INSERT INTO expenses (amount, description, category_id, user_id, date) VALUES (?, ?, ?, ?, ?)",
      [amount, description, category_id, userId, date],
    )

    res.status(201).json({
      message: "Expense created successfully",
      id: result.insertId,
    })
  } catch (error) {
    console.error("Create expense error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.put("/api/expenses/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { amount, description, category_id, date } = req.body
    const userId = req.user.userId

    // Verify category belongs to user
    const [categories] = await db.execute("SELECT id FROM categories WHERE id = ? AND user_id = ?", [
      category_id,
      userId,
    ])

    if (categories.length === 0) {
      return res.status(400).json({ message: "Invalid category" })
    }

    await db.execute(
      "UPDATE expenses SET amount = ?, description = ?, category_id = ?, date = ? WHERE id = ? AND user_id = ?",
      [amount, description, category_id, date, id, userId],
    )

    res.json({ message: "Expense updated successfully" })
  } catch (error) {
    console.error("Update expense error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.delete("/api/expenses/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    await db.execute("DELETE FROM expenses WHERE id = ? AND user_id = ?", [id, userId])

    res.json({ message: "Expense deleted successfully" })
  } catch (error) {
    console.error("Delete expense error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Statistics Routes
app.get("/api/stats/categories", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const [stats] = await db.execute(
      `SELECT c.name as category, 
              COALESCE(SUM(e.amount), 0) as amount,
              COUNT(e.id) as count
       FROM categories c
       LEFT JOIN expenses e ON c.id = e.category_id
       WHERE c.user_id = ?
       GROUP BY c.id, c.name
       HAVING amount > 0
       ORDER BY amount DESC`,
      [userId],
    )

    // Ensure all numbers are properly formatted
    const formattedStats = stats.map((stat) => ({
      category: stat.category,
      amount: Number.parseFloat(stat.amount) || 0,
      count: Number.parseInt(stat.count) || 0,
    }))

    res.json(formattedStats)
  } catch (error) {
    console.error("Category stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/api/stats/monthly", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const [stats] = await db.execute(
      `SELECT DATE_FORMAT(date, '%Y-%m') as month,
              SUM(amount) as amount
       FROM expenses
       WHERE user_id = ? AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(date, '%Y-%m')
       ORDER BY month`,
      [userId],
    )

    // Ensure all amounts are properly formatted
    const formattedStats = stats.map((stat) => ({
      month: stat.month,
      amount: Number.parseFloat(stat.amount) || 0,
    }))

    res.json(formattedStats)
  } catch (error) {
    console.error("Monthly stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
