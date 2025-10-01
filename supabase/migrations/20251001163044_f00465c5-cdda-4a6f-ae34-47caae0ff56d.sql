-- Create tables for ad impressions and clicks tracking
CREATE TABLE IF NOT EXISTS public.ad_impressions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id TEXT NOT NULL,
  placement TEXT,
  size TEXT,
  source TEXT,
  user_id UUID,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ad_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id TEXT NOT NULL,
  placement TEXT,
  user_id UUID,
  session_id TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_clicks ENABLE ROW LEVEL SECURITY;

-- Allow public to insert impressions and clicks (for anonymous tracking)
CREATE POLICY "Public can insert ad impressions" 
ON public.ad_impressions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can insert ad clicks" 
ON public.ad_clicks 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view ad analytics
CREATE POLICY "Admins can view ad impressions" 
ON public.ad_impressions 
FOR SELECT 
USING (get_user_role() = 'admin');

CREATE POLICY "Admins can view ad clicks" 
ON public.ad_clicks 
FOR SELECT 
USING (get_user_role() = 'admin');

-- Create indexes for better performance
CREATE INDEX idx_ad_impressions_ad_id ON public.ad_impressions(ad_id);
CREATE INDEX idx_ad_impressions_created_at ON public.ad_impressions(created_at);
CREATE INDEX idx_ad_clicks_ad_id ON public.ad_clicks(ad_id);
CREATE INDEX idx_ad_clicks_clicked_at ON public.ad_clicks(clicked_at);