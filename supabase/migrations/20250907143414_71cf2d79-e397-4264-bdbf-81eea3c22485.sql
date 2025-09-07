-- Fix the previous migration by dropping and recreating properly
-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS public.cities CASCADE;
DROP TABLE IF EXISTS public.provinces CASCADE;
DROP TABLE IF EXISTS public.shipping_details CASCADE;
DROP TABLE IF EXISTS public.seller_addresses CASCADE;

-- Create provinces table first
CREATE TABLE public.provinces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert Pakistani provinces
INSERT INTO public.provinces (name, code) VALUES
  ('Punjab', 'PB'),
  ('Sindh', 'SD'),
  ('Khyber Pakhtunkhwa', 'KP'),
  ('Balochistan', 'BL'),
  ('Islamabad Capital Territory', 'ICT'),
  ('Gilgit-Baltistan', 'GB'),
  ('Azad Jammu and Kashmir', 'AJK')
ON CONFLICT (name) DO NOTHING;

-- Create cities table with proper reference
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province_id UUID REFERENCES public.provinces(id),
  name TEXT NOT NULL,
  is_major BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert major Pakistani cities
INSERT INTO public.cities (province_id, name, is_major)
SELECT p.id, c.city_name, c.is_major
FROM (VALUES
  ('Punjab', 'Lahore', true),
  ('Punjab', 'Faisalabad', true),
  ('Punjab', 'Rawalpindi', true),
  ('Punjab', 'Multan', true),
  ('Punjab', 'Gujranwala', true),
  ('Punjab', 'Sialkot', false),
  ('Punjab', 'Bahawalpur', false),
  ('Sindh', 'Karachi', true),
  ('Sindh', 'Hyderabad', true),
  ('Sindh', 'Sukkur', false),
  ('Khyber Pakhtunkhwa', 'Peshawar', true),
  ('Khyber Pakhtunkhwa', 'Mardan', false),
  ('Khyber Pakhtunkhwa', 'Abbottabad', false),
  ('Balochistan', 'Quetta', true),
  ('Islamabad Capital Territory', 'Islamabad', true)
) AS c(province_name, city_name, is_major)
JOIN public.provinces p ON p.name = c.province_name;

-- Create seller addresses table
CREATE TABLE public.seller_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  address_type TEXT NOT NULL DEFAULT 'delivery',
  is_default BOOLEAN DEFAULT false,
  label TEXT,
  street_address TEXT NOT NULL,
  area TEXT,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  contact_name TEXT,
  contact_phone TEXT,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create shipping details table
CREATE TABLE public.shipping_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  courier_name TEXT NOT NULL,
  tracking_number TEXT,
  tracking_url TEXT,
  shipping_label_url TEXT,
  estimated_delivery DATE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  shipping_cost NUMERIC DEFAULT 0,
  weight_kg NUMERIC,
  dimensions TEXT,
  package_count INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Add enhanced fields to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS buyer_street_address TEXT,
ADD COLUMN IF NOT EXISTS buyer_area TEXT,
ADD COLUMN IF NOT EXISTS buyer_city TEXT,
ADD COLUMN IF NOT EXISTS buyer_province TEXT DEFAULT 'Punjab',
ADD COLUMN IF NOT EXISTS buyer_postal_code TEXT,
ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
ADD COLUMN IF NOT EXISTS shipping_method TEXT,
ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS return_address TEXT,
ADD COLUMN IF NOT EXISTS tracking_url TEXT,
ADD COLUMN IF NOT EXISTS shipped_by TEXT,
ADD COLUMN IF NOT EXISTS packed_by TEXT,
ADD COLUMN IF NOT EXISTS delivery_partner TEXT;

-- Enable RLS
ALTER TABLE public.seller_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own addresses"
ON public.seller_addresses FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Order participants can view shipping details"
ON public.shipping_details FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    LEFT JOIN public.shops s ON o.shop_id = s.id
    WHERE o.id = order_id 
    AND (o.buyer_id = auth.uid() OR s.owner_id = auth.uid())
  )
);

CREATE POLICY "Shop owners can manage shipping details"
ON public.shipping_details FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.shops s ON o.shop_id = s.id
    WHERE o.id = order_id AND s.owner_id = auth.uid()
  )
);

CREATE POLICY "Everyone can view provinces"
ON public.provinces FOR SELECT
USING (true);

CREATE POLICY "Everyone can view cities"
ON public.cities FOR SELECT
USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_seller_addresses_user_id ON public.seller_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_addresses_default ON public.seller_addresses(user_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_shipping_details_order_id ON public.shipping_details(order_id);

-- Create function for single default address
CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.seller_addresses 
    SET is_default = false 
    WHERE user_id = NEW.user_id 
    AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create trigger
CREATE TRIGGER ensure_single_default_address_trigger
AFTER INSERT OR UPDATE ON public.seller_addresses
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_default_address();