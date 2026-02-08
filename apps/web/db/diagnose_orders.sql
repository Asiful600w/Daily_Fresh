-- Diagnostic script to check current RLS policies and permissions
-- Run this BEFORE running fix_order_permissions.sql to see what's wrong

-- 1. Check if RLS is enabled on orders and order_items
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename;

-- 2. Check existing policies on orders table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;

-- 3. Check existing policies on order_items table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'order_items'
ORDER BY policyname;

-- 4. Check table permissions
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name IN ('orders', 'order_items')
    AND grantee IN ('authenticated', 'anon', 'public')
ORDER BY table_name, grantee, privilege_type;

-- 5. Check column types for user_id
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name IN ('orders', 'order_items')
    AND column_name LIKE '%user%'
ORDER BY table_name, column_name;

-- 6. Count total orders in database
SELECT COUNT(*) as total_orders FROM orders;

-- 7. Sample a few orders to see structure
SELECT 
    id,
    user_id,
    status,
    created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;
