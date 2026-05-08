-- Fix video URL for completed tasks
-- Run this in Supabase SQL Editor

-- Update the completed task with the correct video URL
UPDATE public.generation_tasks
SET status = 'processing', output_url = NULL
WHERE id = '9b10d242-b388-4233-8509-51cafc670c83';
