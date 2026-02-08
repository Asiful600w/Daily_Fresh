# Supabase Auth Migration Walkthrough

This document outlines the changes made to migrate the authentication system from NextAuth.js to Supabase Auth ("GoTrue") for both the Web and Admin applications.

## 1. Core Changes

### Web Application (`apps/web`)
- **Dependencies**: Removed `next-auth`, `@auth/core`. Added `@supabase/ssr`.
- **Client Utilities**:
  - Created `lib/supabase/client.ts` (Browser client).
  - Created `lib/supabase/server.ts` (Server client with cookie handling).
  - Created `lib/supabase/middleware.ts` (Middleware helper).
- **Middleware**: Updated `middleware.ts` to use Supabase session management for route protection (`/profile`, `/checkout`).
- **Auth Context**: Updated `context/AuthContext.tsx` to use `onAuthStateChange` listener and fetch user profile (`useAuth` hook).
- **Pages**:
  - `app/login/page.tsx`: Replaced server action with `supabase.auth.signInWithPassword`.
  - `app/signup/page.tsx`: Replaced server action with `supabase.auth.signUp`.

### Admin Application (`apps/admin`)
- **Dependencies**: Removed `next-auth`, `bcryptjs`. Added `@supabase/ssr`.
- **Client Utilities**: Created `client.ts`, `server.ts`, `middleware.ts` (mirrored structure).
- **Middleware**: Updated `middleware.ts` to protect `/admin` and enforce RBAC (Role Based Access Control).
- **Auth Context**: Updated `context/AdminAuthContext.tsx` to fetch admin profile and verify `SUPERADMIN` or `MERCHANT` role.
- **Pages**:
  - `app/admin/login/page.tsx`: Replaced manual login with `supabase.auth.signInWithPassword`.
  - `app/api/admin/register/route.ts`: Updated to use `supabase.auth.admin.createUser` instead of manual DB insert.

## 2. Database Changes

### User Table Cleanup
- **Action**: Truncated `public.User` table and cleared `auth.users` to ensure a clean slate for migration.
- **Reason**: Existing password hashes (bcrypt) were incompatible with Supabase Auth (GoTrue).

### Schema & Triggers
- **Trigger Function**: Created `public.handle_new_user()` function.
  - **Logic**: Automatically inserts a record into `public.User` whenever a new user is created in `auth.users`.
  - **Fields Mapped**: `id`, `email`, `name`, `role`, `image`, `phone`, `shopName`.
- **Trigger**: Created `on_auth_user_created` trigger on `auth.users` for `AFTER INSERT`.

### Row Level Security (RLS)
- **Enabled RLS** on `public.User` table.
- **Policies Added**:
  1.  **Read Own Profile**: `auth.uid() = id`. Allows users to fetch their own data.
  2.  **Superadmin Access**: Allows users with `role: 'SUPERADMIN'` (in metadata) to read all profiles.

## 3. Verification

### Manual Testing Steps
1.  **Web Signup**:
    - Go to `/signup`.
    - Create a new account.
    - Verify redirection to Login/Home.
    - Check database: User should exist in `auth.users` AND `public.User` (via trigger).
2.  **Web Login**:
    - Go to `/login` with new credentials.
    - Verify successful login and session persistence.
3.  **Admin Registration**:
    - Go to `/admin/register`.
    - Create a merchant account.
    - Check database: User should have `role: 'MERCHANT'`.
4.  **Admin Login**:
    - Go to `/admin/login`.
    - Login with merchant credentials.
    - Verify access to Admin Dashboard.

### Notes
- **First Superadmin**: Since all users were deleted, you must create the first **Superadmin** manually via Supabase Dashboard (Authentication -> Users -> Add User) or initially sign up as a merchant and manually update the role in the database/metadata if needed.
