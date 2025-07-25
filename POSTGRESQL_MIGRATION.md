# PostgreSQL Migration Guide

This guide will help you migrate from MySQL to PostgreSQL for the Expenso application.

## 📋 Prerequisites

1. **Install PostgreSQL**
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql`
   - Ubuntu/Debian: `sudo apt-get install postgresql postgresql-contrib`

2. **Start PostgreSQL Service**
   - Windows: Service starts automatically
   - macOS: `brew services start postgresql`
   - Ubuntu/Debian: `sudo systemctl start postgresql`

## 🚀 Step-by-Step Migration

### Step 1: Install PostgreSQL Node.js Driver

\`\`\`bash
cd backend
npm uninstall mysql2
npm install pg@^8.11.3
\`\`\`

### Step 2: Update Environment Variables

Update your `backend/.env` file:

\`\`\`env
# Database Configuration
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
DB_NAME=expenso_db
DB_PORT=5432

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development
\`\`\`

### Step 3: Create PostgreSQL Database

1. **Connect to PostgreSQL as superuser:**
   \`\`\`bash
   # On most systems
   sudo -u postgres psql
   
   # Or if you have a postgres user password
   psql -U postgres -h localhost
   \`\`\`

2. **Create the database:**
   \`\`\`sql
   CREATE DATABASE expenso_db;
   \q
   \`\`\`

### Step 4: Run Database Schema

1. **Connect to your new database:**
   \`\`\`bash
   psql -U postgres -h localhost -d expenso_db
   \`\`\`

2. **Run the schema from the file:**
   \`\`\`bash
   psql -U postgres -h localhost -d expenso_db -f scripts/create-database.sql
   \`\`\`

   Or copy and paste the SQL commands from `scripts/create-database.sql`

### Step 5: Update Server Configuration

The `server.js` file has been updated with:
- PostgreSQL connection pool using `pg` library
- Parameterized queries using `$1, $2, $3...` instead of `?`
- Proper connection management with client pooling
- PostgreSQL-specific SQL syntax

### Step 6: Test the Migration

1. **Start the backend server:**
   \`\`\`bash
   cd backend
   npm run dev
   \`\`\`

2. **Check the logs for:**
   - "Connected to PostgreSQL database"
   - "Database tables created successfully"
   - "Server running on port 5000"

3. **Test the frontend:**
   \`\`\`bash
   cd frontend
   npm run dev
   \`\`\`

## 🔄 Key Differences from MySQL

### 1. **Auto-increment Fields**
- MySQL: `AUTO_INCREMENT`
- PostgreSQL: `SERIAL` or `IDENTITY`

### 2. **Parameter Placeholders**
- MySQL: `?` placeholders
- PostgreSQL: `$1, $2, $3...` placeholders

### 3. **Date Functions**
- MySQL: `MONTH(date)`, `YEAR(date)`
- PostgreSQL: `EXTRACT(MONTH FROM date)`, `EXTRACT(YEAR FROM date)`

### 4. **String Functions**
- MySQL: `DATE_FORMAT(date, '%Y-%m')`
- PostgreSQL: `TO_CHAR(date, 'YYYY-MM')`

### 5. **Connection Management**
- MySQL: Single connection with reconnection
- PostgreSQL: Connection pooling for better performance

## 🛠️ Troubleshooting

### Common Issues:

1. **Connection Refused**
   - Ensure PostgreSQL is running: `sudo systemctl status postgresql`
   - Check if port 5432 is open: `netstat -an | grep 5432`

2. **Authentication Failed**
   - Update `pg_hba.conf` to allow local connections
   - Set password for postgres user: `sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'your_password';"`

3. **Database Does Not Exist**
   - Create database manually: `createdb -U postgres expenso_db`

4. **Permission Denied**
   - Ensure your user has proper permissions
   - Grant privileges: `GRANT ALL PRIVILEGES ON DATABASE expenso_db TO your_user;`

## 🎯 Performance Benefits

PostgreSQL offers several advantages:

1. **Better Concurrency**: MVCC (Multi-Version Concurrency Control)
2. **Advanced Features**: JSON support, full-text search, custom functions
3. **Better Standards Compliance**: More SQL standard compliant
4. **Extensibility**: Custom data types, operators, and functions
5. **Connection Pooling**: Built-in connection pooling support

## 🔒 Security Improvements

1. **Row Level Security**: Can be enabled for multi-tenant applications
2. **Better Authentication**: Multiple authentication methods
3. **SSL Support**: Built-in SSL/TLS support
4. **Audit Logging**: Comprehensive logging capabilities

## 📊 Data Migration (if needed)

If you have existing MySQL data to migrate:

1. **Export from MySQL:**
   \`\`\`bash
   mysqldump -u root -p expenso_db > mysql_backup.sql
   \`\`\`

2. **Convert MySQL dump to PostgreSQL format:**
   - Use tools like `mysql2postgresql` or manual conversion
   - Update syntax differences (AUTO_INCREMENT → SERIAL, etc.)

3. **Import to PostgreSQL:**
   \`\`\`bash
   psql -U postgres -d expenso_db -f converted_backup.sql
   \`\`\`

## ✅ Verification Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `expenso_db` created
- [ ] Tables created successfully
- [ ] Backend connects without errors
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads with data
- [ ] Expenses can be created/updated/deleted
- [ ] Categories can be managed
- [ ] Statistics page displays charts

Your Expenso application is now running on PostgreSQL! 🎉
