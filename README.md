# Expenso - Full-Stack Expense Tracker

A comprehensive expense tracking application built with Next.js, Express.js, and MySQL.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Expense Management**: Add, edit, delete, and categorize expenses
- **Category Management**: Create and manage custom expense categories
- **Dashboard Overview**: Visual dashboard with expense statistics
- **Statistics & Analytics**: Charts and graphs showing spending patterns
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Real-time Updates**: Dynamic data updates without page refresh

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Recharts** for data visualization
- **React Hooks** for state management

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** enabled

## 📁 Project Structure

```
expenso/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App router pages
│   ├── components/          # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utility functions
├── backend/                 # Express.js backend API
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables
└── scripts/                # Database setup scripts
    └── create-database.sql # Database schema
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your configuration:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=expenso_db
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

4. Create the MySQL database:
\`\`\`bash
mysql -u root -p < ../scripts/create-database.sql
\`\`\`

5. Start the backend server:
\`\`\`bash
npm run dev
\`\`\`

The backend API will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
\`\`\`bash
cd frontend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a `.env.local` file:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The frontend will be running on `http://localhost:3000`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Statistics
- `GET /api/stats/categories` - Get category-wise statistics
- `GET /api/stats/monthly` - Get monthly expense trends

## 🔐 Security Features

- **Password Hashing**: Passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: All API endpoints require authentication
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Properly configured CORS policies

## 🎨 UI Features

- **Modern Design**: Clean and intuitive interface
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Dark Mode Ready**: Built with dark mode support
- **Interactive Charts**: Visual representation of expense data
- **Real-time Updates**: Instant feedback on user actions
- **Loading States**: Smooth loading animations

## 📱 Pages

1. **Authentication** (`/auth`) - Login and registration
2. **Dashboard** (`/dashboard`) - Overview with statistics
3. **Expenses** (`/dashboard/expenses`) - Manage expenses
4. **Categories** (`/dashboard/categories`) - Manage categories
5. **Statistics** (`/dashboard/stats`) - Charts and analytics

## 🔧 Development

### Running in Development Mode

Backend:
\`\`\`bash
cd backend && npm run dev
\`\`\`

Frontend:
\`\`\`bash
cd frontend && npm run dev
\`\`\`

### Building for Production

Backend:
\`\`\`bash
cd backend && npm start
\`\`\`

Frontend:
\`\`\`bash
cd frontend && npm run build && npm start
\`\`\`

## 📝 Environment Variables

### Backend (.env)
\`\`\`env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=expenso_db
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=production
\`\`\`

### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- Charts may not display properly on very small screens
- Date picker format may vary across browsers

## 🚀 Future Enhancements

- [ ] Export data to CSV/PDF
- [ ] Budget planning and alerts
- [ ] Recurring expense tracking
- [ ] Multi-currency support
- [ ] Mobile app version
- [ ] Email notifications
- [ ] Advanced filtering and search
- [ ] Data backup and restore

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.
