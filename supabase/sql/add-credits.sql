-- Add credits to user
-- Run this in Supabase SQL Editor

-- Update credits for the user (replace with your user ID)
UPDATE public.profiles
SET credits_remaining = 500
WHERE id = 'a100eb72-ef27-4d8f-8a84-3779c7cce6c2';

-- Record the transaction
INSERT INTO public.credit_transactions (user_id, amount, balance_after, source)
VALUES ('a100eb72-ef27-4d8f-8a84-3779c7cce6c2', 490, 500, 'bonus');
