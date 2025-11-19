-- Migration: Remove auth_user_id columns from tables where it's no longer needed
-- 
-- Background:
-- Previously, auth_user_id (UUID from Supabase Auth) was used for data querying across multiple tables.
-- This was inefficient as UUIDs take up more space than integers.
-- 
-- Changes:
-- - Switch to using user_id (integer) for all data queries
-- - Keep auth_user_id ONLY in the users table to link to Supabase Auth
-- - Remove auth_user_id from: project_clients, projects, user_favourites, comments, model_logs, portfolio_pages
--
-- WARNING: Back up your database before running this migration!

-- Step 1: Drop auth_user_id from project_clients
-- This table links users to projects, user_id is sufficient
ALTER TABLE public.project_clients 
DROP COLUMN IF EXISTS auth_user_id;

-- Step 2: Drop auth_user_id from projects
-- Projects are linked to creators via creator_id (which references user_id)
ALTER TABLE public.projects 
DROP COLUMN IF EXISTS auth_user_id;

-- Step 3: Drop auth_user_id from user_favourites
-- User favourites are linked via user_id
ALTER TABLE public.user_favourites 
DROP COLUMN IF EXISTS auth_user_id;

-- Step 4: Drop auth_user_id from comments
-- Comments are linked to users via user_id
ALTER TABLE public.comments 
DROP COLUMN IF EXISTS auth_user_id;

-- Step 5: Drop auth_user_id from model_logs
-- Model logs are linked to users via user_id
ALTER TABLE public.model_logs 
DROP COLUMN IF EXISTS auth_user_id;

-- Step 6: Drop auth_user_id from portfolio_pages
-- Portfolio pages are linked to creators via creator_id (which references user_id)
ALTER TABLE public.portfolio_pages 
DROP COLUMN IF EXISTS auth_user_id;

-- Verification queries (run these after migration to verify):
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'project_clients' AND column_name = 'auth_user_id';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'auth_user_id';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'user_favourites' AND column_name = 'auth_user_id';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'auth_user_id';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'model_logs' AND column_name = 'auth_user_id';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'portfolio_pages' AND column_name = 'auth_user_id';

-- These should return no rows if the migration was successful
