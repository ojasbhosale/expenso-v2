-- Create database
CREATE DATABASE IF NOT EXISTS expenso_db;
USE expenso_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    category_id INT NOT NULL,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    INDEX idx_date (date)
);

-- Insert sample data (optional)
-- You can uncomment these lines to add sample data

INSERT INTO users (name, email, password) VALUES 
('John Doe', 'john@example.com', '$2a$10$example_hashed_password');

INSERT INTO categories (name, description, user_id) VALUES 
('Food & Dining', 'Restaurant meals, groceries, and food delivery', 1),
('Transportation', 'Gas, public transport, rideshare, and vehicle maintenance', 1),
('Shopping', 'Clothing, electronics, and general purchases', 1),
('Entertainment', 'Movies, games, subscriptions, and leisure activities', 1),
('Bills & Utilities', 'Rent, electricity, water, internet, and phone bills', 1),
('Healthcare', 'Medical expenses, pharmacy, and health insurance', 1);
