-- Add enhanced product features for Alibaba-style product pages

-- Add product specifications table
CREATE TABLE public.product_specifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  spec_name TEXT NOT NULL,
  spec_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add product images table for multiple images
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add product pricing tiers table
CREATE TABLE public.product_pricing_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  min_quantity INTEGER NOT NULL,
  max_quantity INTEGER,
  unit_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add sample pricing and availability to products
ALTER TABLE public.products 
ADD COLUMN sample_available BOOLEAN DEFAULT false,
ADD COLUMN sample_price NUMERIC;

-- Enable Row Level Security
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_pricing_tiers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_specifications
CREATE POLICY "Anyone can view product specifications" 
ON public.product_specifications FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.products p 
  WHERE p.id = product_specifications.product_id 
  AND p.is_active = true
));

CREATE POLICY "Product owners can manage specifications" 
ON public.product_specifications FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.products p 
  JOIN public.shops s ON p.shop_id = s.id 
  WHERE p.id = product_specifications.product_id 
  AND s.owner_id = auth.uid()
));

-- RLS Policies for product_images
CREATE POLICY "Anyone can view product images" 
ON public.product_images FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.products p 
  WHERE p.id = product_images.product_id 
  AND p.is_active = true
));

CREATE POLICY "Product owners can manage images" 
ON public.product_images FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.products p 
  JOIN public.shops s ON p.shop_id = s.id 
  WHERE p.id = product_images.product_id 
  AND s.owner_id = auth.uid()
));

-- RLS Policies for product_pricing_tiers
CREATE POLICY "Anyone can view pricing tiers" 
ON public.product_pricing_tiers FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.products p 
  WHERE p.id = product_pricing_tiers.product_id 
  AND p.is_active = true
));

CREATE POLICY "Product owners can manage pricing tiers" 
ON public.product_pricing_tiers FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.products p 
  JOIN public.shops s ON p.shop_id = s.id 
  WHERE p.id = product_pricing_tiers.product_id 
  AND s.owner_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_product_specifications_product_id ON public.product_specifications(product_id);
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_pricing_tiers_product_id ON public.product_pricing_tiers(product_id);
CREATE INDEX idx_product_images_primary ON public.product_images(product_id, is_primary) WHERE is_primary = true;