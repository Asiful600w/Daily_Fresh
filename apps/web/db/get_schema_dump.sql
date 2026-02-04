-- ==============================================================================
-- Supabase Schema Inspection Script
-- ==============================================================================
-- This script queries the system catalogs to retrieve information about your
-- schema, including Tables, RLS Policies, and Triggers.
-- Run this in the Supabase SQL Editor.

-- ------------------------------------------------------------------------------
-- 1. TABLES
-- ------------------------------------------------------------------------------
SELECT 
    t.table_name,
    pg_size_pretty(pg_total_relation_size('"' || t.table_schema || '"."' || t.table_name || '"')) as size
FROM information_schema.tables t
WHERE t.table_schema = 'public'
ORDER BY t.table_name;

-- ------------------------------------------------------------------------------
-- 2. RLS POLICIES (Definition Dump)
-- ------------------------------------------------------------------------------
-- Returns the SQL needed to recreate the policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as action,
    qual as using_expression,
    with_check as check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ------------------------------------------------------------------------------
-- 3. TRIGGERS
-- ------------------------------------------------------------------------------
SELECT 
    event_object_table as table_name,
    trigger_name,
    action_timing,
    event_manipulation as event,
    action_statement as definition
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ------------------------------------------------------------------------------
-- 4. FUNCTIONS (Schema functions often used in triggers)
-- ------------------------------------------------------------------------------
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public';
