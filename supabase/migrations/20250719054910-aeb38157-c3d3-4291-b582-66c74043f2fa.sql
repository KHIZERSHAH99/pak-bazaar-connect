
-- Add missing columns to the ads table to support enhanced ad management
ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS current_spend NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS budget_cap NUMERIC,
ADD COLUMN IF NOT EXISTS campaign_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS campaign_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_auto_stopped BOOLEAN DEFAULT FALSE;

-- Update existing ads to have some default values for better display
UPDATE public.ads 
SET 
  current_spend = 0,
  total_orders = 0,
  campaign_start_date = created_at,
  is_auto_stopped = FALSE
WHERE current_spend IS NULL;
