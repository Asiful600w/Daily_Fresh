# Supabase Setup Guide

## 1. Get Credentials
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. Go to **Settings** (cog icon) -> **API**.
4. Find the **Project URL** and **anon public key**.

## 2. Configure Environment Variables
1. In your project root (`f:\Ecommerce\Flutter-ecommerce-app-with-getx-master\grocery\next-app`), create a new file named `.env.local`.
   > **Note**: This file is secret and ignored by git. Do not share it.

2. Add the following lines to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vaohkfonpifdvwarsnac.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhb2hrZm9ucGlmZHZ3YXJzbmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTAwNjcsImV4cCI6MjA4NDQ2NjA2N30.uqCcZflkUESMQVGfMnkK5fsf3pEiksKJImnnPtaZ3iQ
```

3. Replace the values with the ones you copied from the dashboard.

## 3. Restart Server
After creating `.env.local`, you must restart your Next.js server for the changes to take effect:
1. Stop the server (Ctrl+C).
2. Run `npm run dev` again.
