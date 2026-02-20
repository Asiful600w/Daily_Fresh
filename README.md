# Daily Fresh - E-commerce Platform

![Daily Fresh Banner](https://via.placeholder.com/1200x400.png?text=Daily+Fresh+-+E-commerce+Platform)

Daily Fresh is a modern, full-stack e-commerce grocery platform built with Next.js, TypeScript, and Supabase. The project is organized as a monorepo using Turborepo, separating the customer storefront (`web`) from the management dashboard (`admin`).

## 🌟 Key Features

### Web Storefront (`apps/web`)
- **Responsive & Modern UI**: Built with Tailwind CSS v4, fully responsive across all device sizes.
- **Progressive Web App (PWA)**: Installable on mobile and desktop devices.
- **Dark/Light Mode**: Full theme support with system preference detection.
- **Product Discovery**: Browse by categories, view detailed product pages, and search.
- **Cart & Checkout**: Seamless shopping cart experience with localized state management and a streamlined checkout process.
- **User Authentication**: Secure login, signup, and password recovery powered by Supabase Auth with strict server-side validation.
- **User Profile**: Manage personal details, delivery addresses, and track order history.
- **Wishlist**: Save favorite products for later.

### Admin Dashboard (`apps/admin`)
- **Role-Based Access Control**: Different permission levels for `SUPERADMIN` and `MERCHANT`.
- **Analytics & Reporting**: Interactive charts and data visualizations using Recharts.
- **Order Management**: View, track, and update the status of customer orders.
- **Inventory Management**: Add, edit, and organize products, categories, and special categories.
- **User Management**: Manage customers and merchants.
- **System Settings**: Configure global application settings.

## 💻 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Monorepo**: [Turborepo](https://turbo.build/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Icons**: Material Icons Round

## 📂 Project Structure

```text
ecommerce-monorepo/
├── apps/
│   ├── admin/       # Next.js Admin Panel application
│   └── web/         # Next.js Customer Storefront application
├── package.json     # Root package dependencies and workspace config
├── turbo.json       # Turborepo configuration
├── supabase_*.sql   # Database schema scripts and migrations
└── SUPABASE_SETUP.md# Detailed Supabase configuration guide
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- npm (v10+)
- A Supabase account and project details

### 1. Clone the repository

```bash
git clone <repository-url>
cd ecommerce-monorepo
```

### 2. Install Dependencies

Install the dependencies for the entire monorepo from the root directory:

```bash
npm install
```

### 3. Environment Variables

Create `.env.local` files in both `apps/web` and `apps/admin` based on the environment variables required. You will need your Supabase project credentials.

**Example `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key # Usually for Admin or backend actions
```

### 4. Database Setup

The project relies on a specific schema in Supabase. You need to run the provided SQL scripts in your Supabase SQL Editor to set up the tables, roles, and constraints.
- `supabase_schema_sync.sql`: Sets up core tables (User, Session, Account).
- `restore_schema.sql` (if applicable): Sets up full DB schema.
- Read `SUPABASE_SETUP.md` for specific OAuth and redirect configurations for authentication.

### 5. Running the Application

You can start the development servers for both applications simultaneously from the root using Turborepo:

```bash
npm run dev
```

- **Web Storefront**: [http://localhost:3006](http://localhost:3006)
- **Admin Dashboard**: [http://localhost:3005](http://localhost:3005)

## 📜 Available Scripts (Root)

- `npm run dev`: Starts all applications in development mode.
- `npm run build`: Builds all applications for production.
- `npm run lint`: Runs ESLint across all packages and applications.
- `npm run clean`: Cleans build outputs across the monorepo.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
