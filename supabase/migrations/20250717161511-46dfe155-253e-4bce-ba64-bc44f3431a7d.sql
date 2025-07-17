
-- Add missing status field to profiles table for profile image upload functionality
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Update any existing profiles to have active status
UPDATE public.profiles SET status = 'active' WHERE status IS NULL;
