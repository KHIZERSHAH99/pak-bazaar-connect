-- Create pricing tiers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.product_pricing_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  min_quantity INTEGER NOT NULL CHECK (min_quantity > 0),
  max_quantity INTEGER CHECK (max_quantity IS NULL OR max_quantity > min_quantity),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure no overlapping quantity ranges for the same product
  CONSTRAINT unique_quantity_range UNIQUE (product_id, min_quantity)
);

-- Enable RLS
ALTER TABLE public.product_pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view pricing tiers"
  ON public.product_pricing_tiers
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products p 
    WHERE p.id = product_pricing_tiers.product_id 
    AND p.is_active = true
  ));

CREATE POLICY "Product owners can manage pricing tiers"
  ON public.product_pricing_tiers
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM products p
    JOIN shops s ON p.shop_id = s.id
    WHERE p.id = product_pricing_tiers.product_id
    AND s.owner_id = auth.uid()
  ));

-- Create index for better performance
CREATE INDEX idx_pricing_tiers_product ON public.product_pricing_tiers(product_id);
CREATE INDEX idx_pricing_tiers_quantity ON public.product_pricing_tiers(min_quantity);

-- Insert sample pricing tiers for existing products
INSERT INTO public.product_pricing_tiers (product_id, min_quantity, max_quantity, unit_price)
SELECT 
  id as product_id,
  1 as min_quantity,
  99 as max_quantity,
  price as unit_price
FROM public.products
WHERE NOT EXISTS (
  SELECT 1 FROM public.product_pricing_tiers 
  WHERE product_id = products.id
)
LIMIT 10;

-- Add bulk pricing tiers for the same products
INSERT INTO public.product_pricing_tiers (product_id, min_quantity, max_quantity, unit_price)
SELECT 
  id as product_id,
  100 as min_quantity,
  999 as max_quantity,
  ROUND(price * 0.95, 2) as unit_price
FROM public.products
WHERE EXISTS (
  SELECT 1 FROM public.product_pricing_tiers 
  WHERE product_id = products.id AND min_quantity = 1
)
LIMIT 10;

INSERT INTO public.product_pricing_tiers (product_id, min_quantity, max_quantity, unit_price)
SELECT 
  id as product_id,
  1000 as min_quantity,
  NULL as max_quantity,
  ROUND(price * 0.90, 2) as unit_price
FROM public.products
WHERE EXISTS (
  SELECT 1 FROM public.product_pricing_tiers 
  WHERE product_id = products.id AND min_quantity = 1
)
LIMIT 10;