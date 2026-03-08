
ALTER TABLE public.tutorials
ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS duration_seconds integer;
