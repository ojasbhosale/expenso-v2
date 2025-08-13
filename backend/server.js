const express = require("express")
const cors = require("cors")
const { Pool } = require("pg")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://expenso-bay.vercel.app',
  'https://expenso-v2.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // if you're using cookies or Authorization headers
}));

app.use(express.json())

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "expenso_db",
  port: process.env.DB_PORT || 5432,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
})

async function initializeDatabase() {
  try {
    // Test the connection
    const client = await pool.connect()
    console.log("Connected to PostgreSQL database")

    // Create tables if they don't exist
    await createTables(client)

    client.release()
  } catch (error) {
    console.error("Database connection failed:", error)
    process.exit(1)
  }
}

async function createTables(client) {
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Expenses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        category_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date)`)

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
  const client = await pool.connect()

  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await client.query("SELECT id FROM users WHERE email = $1", [email])

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const result = await client.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id", [
      name,
      email,
      hashedPassword,
    ])

    const userId = result.rows[0].id

    // Create default categories for new user
    const defaultCategories = [
      { name: "Food & Dining", description: "Restaurant meals, groceries, and food delivery" },
      { name: "Transportation", description: "Gas, public transport, rideshare, and vehicle maintenance" },
      { name: "Shopping", description: "Clothing, electronics, and general purchases" },
      { name: "Entertainment", description: "Movies, games, subscriptions, and leisure activities" },
      { name: "Bills & Utilities", description: "Rent, electricity, water, internet, and phone bills" },
      { name: "Healthcare", description: "Medical expenses, pharmacy, and health insurance" },
    ]

    for (const category of defaultCategories) {
      await client.query("INSERT INTO categories (name, description, user_id) VALUES ($1, $2, $3)", [
        category.name,
        category.description,
        userId,
      ])
    }

    // Generate JWT token
    const token = jwt.sign({ userId: userId, email: email }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    })

    res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: userId, name, email },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Server error" })
  } finally {
    client.release()
  }
})

app.post("/api/auth/login", async (req, res) => {
  const client = await pool.connect()

  try {
    const { email, password } = req.body

    // Find user
    const result = await client.query("SELECT id, name, email, password FROM users WHERE email = $1", [email])

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const user = result.rows[0]

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    })

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  } finally {
    client.release()
  }
})

// Dashboard Routes
app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
  const client = await pool.connect()

  try {
    const userId = req.user.userId

    // Get total expenses
    const totalResult = await client.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = $1",
      [userId],
    )

    // Get monthly expenses
    const monthlyResult = await client.query(
      `SELECT COALESCE(SUM(amount), 0) as monthly 
       FROM expenses 
       WHERE user_id = $1 AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE) 
       AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
      [userId],
    )

    // Get total categories
    const categoriesResult = await client.query("SELECT COUNT(*) as count FROM categories WHERE user_id = $1", [userId])

    // Get recent expenses
    const recentExpenses = await client.query(
      `SELECT e.id, e.amount, e.description, e.date, c.name as category
       FROM expenses e
       JOIN categories c ON e.category_id = c.id
       WHERE e.user_id = $1
       ORDER BY e.created_at DESC
       LIMIT 5`,
      [userId],
    )

    // Format the results
    const formattedRecentExpenses = recentExpenses.rows.map((expense) => ({
      ...expense,
      amount: Number.parseFloat(expense.amount) || 0,
    }))

    res.json({
      totalExpenses: Number.parseFloat(totalResult.rows[0].total) || 0,
      monthlyExpenses: Number.parseFloat(monthlyResult.rows[0].monthly) || 0,
      totalCategories: Number.parseInt(categoriesResult.rows[0].count) || 0,
      recentExpenses: formattedRecentExpenses,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    res.status(500).json({ message: "Server error" })
  } finally {
    client.release()
  }
})

// Categories Routes
app.get("/api/categories", authenticateToken, async (req, res) => {
  const client = await pool.connect()

  try {
    const userId = req.user.userId
    const result = await client.query(
      `SELECT c.*, 
              COUNT(e.id) as expense_count,
              COALESCE(SUM(e.amount), 0) as total_amount
       FROM categories c
       LEFT JOIN expenses e ON c.id = e.category_id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.name`,
      [userId],
    )

    // Format the results
    const formattedCategories = result.rows.map((category) => ({
      ...category,
      expense_count: Number.parseInt(category.expense_count) || 0,
      total_amount: Number.parseFloat(category.total_amount) || 0,
    }))

    res.json(formattedCategories)
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({ message: "Server error" })
  } finally {
    client.release()
  }
})

app.post("/api/categories", authenticateToken, async (req, res) => {
  const client = await pool.connect()

  try {
    const { name, description } = req.body
    const userId = req.user.userId

    const result = await client.query(
      "INSERT INTO categories (name, description, user_id) VALUES ($1, $2, $3) RETURNING id",
      [name, description || null, userId],
    )

    res.status(201).json({
      message: "Category created successfully",
      id: result.rows[0].id,
    })
  } catch (error) {
    console.error("Create category error:", error)
    res.status(500).json({ message: "Server error" })
  } finally {
    client.release()
  }
})

app.put("/api/categories/:id", authenticateToken, async (req, res) => {
  const client = await pool.connect()

  try {
    const { id } = req.params
    const { name, description } = req.body
    const userId = req.user.userId

    await client.query(
      "UPDATE categories SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4",
      [name, description || null, id, userId],
    )

    res.json({ message: "Category updated successfully" })
  } catch (error) {
    console.error("Update category error:", error)
    res.status(500).json({ message: "Server error" })
  } finally {
    client.release()
  }
})

app.delete("/api/categories/:id", authenticateToken, async (req, res) => {
  const client = await pool.connect()

  try {
    const { id } = req.params
    const userId = req.user.userId

    await client.query("DELETE FROM categories WHERE id = $1 AND user_id = $2", [id, userId])

    res.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Delete category error:", error)
    res.status(500).json({ message: "Server error" })
  } finally {
    client.release()
  }
})

// Expenses Routes
app.get("/api/expenses", authenticateToken, async (req, res) => {
  const client = await pool.connect()

  try {
    const userId = req.user.userId
    const result = await client.query(
      `SELECT e.*, c.name as category_name
       FROM expenses e
       JOIN categories c ON e.category_id = c.id
       WHERE e.user_id = $1
       ORDER BY e.date DESC, e.created_at DESC`,
      [userId],
    )

    // Format the results
    const formattedExpenses = result.rows.map((expense) => ({
      ...expense,
      amount: Number.parseFloat(expense.amount) || 0,
    }))

    res.json(formattedExpenses)
  } catch (error) {
    console.error("Get expenses error:", error)
    res.status(500).json({ message: "Server error" })
  } finally {
    client.release()
  }
})

app.post("/api/expenses", authenticateToken, async (req, res) => {
  const client = await pool.connect()

  try {
    const { amount, description, category_id, date } = req.body
    const userId = req.user.userId

    // Verify category belongs to user
    const categoryCheck = await client.query("SELECT id FROM categories WHERE id = $1 AND user_id = $2", [
      category_id,
      userId,
    ])

    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({ message: "Invalid category" })
    }

    const result = await client.query(
      "INSERT INTO expenses (amount, description, category_id, user_id, date) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [amount, description, category_id, userId, date],
    )

    res.status(201).json({
      message: "Expense created successfully",
      id: result.rows[0].id,
    })
  } catch (error) {
    console.error("Create expense error:", error)
    res.status(500).json({ message: "Server error" })
  } finally {
    client.release()
  }
})

app.put("/api/expenses/:id", authenticateToken, async (req, res) => {
  const client = await pool.connect()

  try {
    const { id } = req.params
    const { amount, description, category_id, date } = req.body
    const userId = req.user.userId

    // Verify category belongs to user
    const categoryCheck = await client.query("SELECT id FROM categories WHERE id = $1 AND user_id = $2", [
      category_id,
      userId,
    ])

    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({ message: "Invalid category" })
    }

    await client.query(
      "UPDATE expenses SET amount = $1, description = $2, category_id = $3, date = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND user_id = $6",
      [amount, description, category_id, date, id, userId],
    )

    res.json({ message: "Expense updated successfully" })
  } catch (error) {
    console.error("Update expense error:", error)
    res.status(500).json({ message: "Server error" })
  } finally {
    client.release()
  }
})

app.delete("/api/expenses/:id", authenticateToken, async (req, res) => {
  const client = await pool.connect()

  try {
    const { id } = req.params
    const userId = req.user.userId

    await client.query("DELETE FROM expenses WHERE id = $1 AND user_id = $2", [id, userId])

    res.json({ message: "Expense deleted successfully" })
  } catch (error) {
    console.error("Delete expense error:", error)
    res.status(500).json({ message: "Server error" })
  } finally {
    client.release()
  }
})

// Statistics Routes
app.get("/api/stats/categories", authenticateToken, async (req, res) => {
  const client = await pool.connect()

  try {
    const userId = req.user.userId
    const result = await client.query(
      `SELECT c.name as category, 
              COALESCE(SUM(e.amount), 0) as amount,
              COUNT(e.id) as count
       FROM categories c
       LEFT JOIN expenses e ON c.id = e.category_id
       WHERE c.user_id = $1
       GROUP BY c.id, c.name
       HAVING COALESCE(SUM(e.amount), 0) > 0
       ORDER BY amount DESC`,
      [userId],
    )

    // Format the results
    const formattedStats = result.rows.map((stat) => ({
      category: stat.category,
      amount: Number.parseFloat(stat.amount) || 0,
      count: Number.parseInt(stat.count) || 0,
    }))

    res.json(formattedStats)
  } catch (error) {
    console.error("Category stats error:", error)
    res.status(500).json({ message: "Server error" })
  } finally {
    client.release()
  }
})

app.get("/api/stats/monthly", authenticateToken, async (req, res) => {
  const client = await pool.connect()

  try {
    const userId = req.user.userId
    const result = await client.query(
      `SELECT TO_CHAR(date, 'YYYY-MM') as month,
              SUM(amount) as amount
       FROM expenses
       WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY TO_CHAR(date, 'YYYY-MM')
       ORDER BY month`,
      [userId],
    )

    // Format the results
    const formattedStats = result.rows.map((stat) => ({
      month: stat.month,
      amount: Number.parseFloat(stat.amount) || 0,
    }))

    res.json(formattedStats)
  } catch (error) {
    console.error("Monthly stats error:", error)
    res.status(500).json({ message: "Server error" })
  } finally {
    client.release()
  }
})

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...")
  await pool.end()
  process.exit(0)
})

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...")
  await pool.end()
  process.exit(0)
})

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
