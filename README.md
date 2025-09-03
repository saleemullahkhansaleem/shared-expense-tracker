# Shared Expense & Contribution Tracker

A modern web application built with Next.js, TypeScript, and Prisma for managing monthly contributions, expenses, and settlements among friends.

## 🚀 Features

### Core Functionality
- **User Management**: Secure authentication with NextAuth.js
- **Monthly Contributions**: Track individual contributions from each member
- **Expense Management**: Record expenses with categories and payment sources
- **Financial Tracking**: Real-time dashboard with charts and analytics
- **Settlements**: Automatic calculation of who owes whom
- **Role-based Access**: Admin and User roles with different permissions

### Key Features
- 📊 **Dashboard**: Overview of finances, charts, and quick stats
- 💰 **Contributions**: Add and track monthly contributions
- 🧾 **Expenses**: Categorize and manage shared expenses
- 📈 **Reports**: Downloadable monthly summaries
- ⚙️ **Settings**: Manage categories, roles, and monthly targets
- 📱 **Responsive Design**: Mobile-first design for easy expense entry

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with ShadCN/UI components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **Icons**: Heroicons for consistent iconography

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd shared-expense-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Copy the example environment file and configure your database:
```bash
cp env.example .env.local
```

Update `.env.local` with your configuration:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/expense_tracker"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 4. Set up the database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

### Users
- `id`: Unique identifier
- `name`: Full name
- `email`: Email address (unique)
- `password`: Hashed password
- `role`: ADMIN or USER
- `createdAt`: Account creation timestamp

### Contributions
- `id`: Unique identifier
- `userId`: Reference to user
- `amount`: Contribution amount
- `month`: Month in YYYY-MM format
- `createdAt`: Contribution timestamp

### Expenses
- `id`: Unique identifier
- `userId`: Reference to user
- `title`: Expense description
- `category`: Expense category
- `amount`: Expense amount
- `date`: Expense date
- `paymentSource`: COLLECTED or POCKET
- `createdAt`: Expense timestamp

## 📱 Pages & Routes

- `/` - Landing page
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/dashboard` - Main dashboard
- `/dashboard/expenses` - Expense management
- `/dashboard/contributions` - Contribution tracking
- `/dashboard/reports` - Financial reports
- `/dashboard/members` - Member management
- `/dashboard/settings` - App settings

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

## 🎨 UI Components

The application uses ShadCN/UI components built on top of Radix UI primitives:

- **Button**: Various button styles and sizes
- **Input**: Form input fields
- **Card**: Content containers
- **Select**: Dropdown selections
- **Modal**: Overlay dialogs

## 📊 Data Visualization

Charts and analytics are powered by Recharts:

- **Pie Charts**: Expense breakdown by category
- **Bar Charts**: Monthly trends
- **Responsive Design**: Charts adapt to screen size

## 🔐 Authentication & Security

- **NextAuth.js**: Secure authentication system
- **Password Hashing**: bcrypt for password security
- **JWT Tokens**: Stateless authentication
- **Role-based Access**: Different permissions for admins and users

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues
2. Create a new issue with detailed information
3. Include your environment details and error messages

## 🔮 Future Enhancements

- [ ] Export reports to PDF/Excel
- [ ] Push notifications for low balance
- [ ] Mobile app (React Native)
- [ ] Multi-currency support
- [ ] Advanced analytics and insights
- [ ] Integration with banking APIs
- [ ] Automated expense categorization
- [ ] Group management features

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [ShadCN/UI Documentation](https://ui.shadcn.com)
- [NextAuth.js Documentation](https://next-auth.js.org)
