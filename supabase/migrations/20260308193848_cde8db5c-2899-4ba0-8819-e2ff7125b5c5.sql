
-- Add Urdu language columns for tutorials
ALTER TABLE public.tutorials
ADD COLUMN IF NOT EXISTS title_ur text,
ADD COLUMN IF NOT EXISTS description_ur text;
