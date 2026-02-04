-- Fix User ID Auto-Increment (UUID/Text Version)
-- Run this in Supabase SQL Editor

-- Since the ID is not an integer (Text or UUID), we must use a function to generate it.

-- 1. Ensure the pgcrypto extension is enabled (usually is, but good to check)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Set the default value for the id column to generate a UUID
-- This works for both UUID columns and TEXT columns that store UUIDs.
ALTER TABLE "User" 
ALTER COLUMN id SET DEFAULT gen_random_uuid();
