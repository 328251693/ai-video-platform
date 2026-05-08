-- Add metadata column to generation_tasks table
-- Run this in Supabase SQL Editor

ALTER TABLE public.generation_tasks
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
