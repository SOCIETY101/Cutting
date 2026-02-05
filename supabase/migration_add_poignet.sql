-- Migration: Add poignet_enabled column to projects table
-- Run this in Supabase SQL Editor if the column doesn't exist

ALTER TABLE projects ADD COLUMN IF NOT EXISTS poignet_enabled BOOLEAN DEFAULT false;

-- Refresh the schema cache (this happens automatically, but you can also do it manually)
-- The schema cache should refresh within a few seconds after running the ALTER TABLE
