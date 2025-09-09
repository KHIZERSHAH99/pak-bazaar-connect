-- Create product variations table with comprehensive support
CREATE TABLE IF NOT EXISTS public.product_variations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT,
  variation_type TEXT NOT NULL, -- 'color', 'size', 'model', etc.
  variation_value TEXT NOT NULL,
  variation_label TEXT, -- Display name
  hex_color TEXT, -- For color swatches
  image_url TEXT, -- Variation-specific image
  price_adjustment NUMERIC DEFAULT 0, -- Price difference from base
  stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  attributes JSONB DEFAULT '{}', -- Additional attributes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, variation_type, variation_value)
);

-- Create variation combinations table for multi-attribute variations
CREATE TABLE IF NOT EXISTS public.product_variation_combinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE,
  variations JSONB NOT NULL, -- {"color": "red", "size": "XL"}
  price NUMERIC NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create size charts table
CREATE TABLE IF NOT EXISTS public.product_size_charts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  chart_type TEXT NOT NULL DEFAULT 'standard', -- 'standard', 'custom'
  chart_data JSONB NOT NULL, -- Flexible structure for different chart types
  unit TEXT DEFAULT 'cm', -- 'cm', 'inches'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id)
);

-- Create specification tables
CREATE TABLE IF NOT EXISTS public.product_specification_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  specifications JSONB NOT NULL, -- Array of {name, value, unit} objects
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_variations_product_id ON public.product_variations(product_id);
CREATE INDEX IF NOT EXISTS idx_variation_combinations_product_id ON public.product_variation_combinations(product_id);
CREATE INDEX IF NOT EXISTS idx_size_charts_product_id ON public.product_size_charts(product_id);
CREATE INDEX IF NOT EXISTS idx_spec_tables_product_id ON public.product_specification_tables(product_id);

-- Enable RLS
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variation_combinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_size_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specification_tables ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_variations
CREATE POLICY "Anyone can view variations of active products" 
ON public.product_variations FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.products 
  WHERE id = product_variations.product_id 
  AND is_active = true
));

CREATE POLICY "Product owners can manage variations" 
ON public.product_variations FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.products p
  JOIN public.shops s ON p.shop_id = s.id
  WHERE p.id = product_variations.product_id 
  AND s.owner_id = auth.uid()
));

-- RLS Policies for product_variation_combinations
CREATE POLICY "Anyone can view combinations of active products" 
ON public.product_variation_combinations FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.products 
  WHERE id = product_variation_combinations.product_id 
  AND is_active = true
));

CREATE POLICY "Product owners can manage combinations" 
ON public.product_variation_combinations FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.products p
  JOIN public.shops s ON p.shop_id = s.id
  WHERE p.id = product_variation_combinations.product_id 
  AND s.owner_id = auth.uid()
));

-- RLS Policies for product_size_charts
CREATE POLICY "Anyone can view size charts of active products" 
ON public.product_size_charts FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.products 
  WHERE id = product_size_charts.product_id 
  AND is_active = true
));

CREATE POLICY "Product owners can manage size charts" 
ON public.product_size_charts FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.products p
  JOIN public.shops s ON p.shop_id = s.id
  WHERE p.id = product_size_charts.product_id 
  AND s.owner_id = auth.uid()
));

-- RLS Policies for product_specification_tables
CREATE POLICY "Anyone can view spec tables of active products" 
ON public.product_specification_tables FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.products 
  WHERE id = product_specification_tables.product_id 
  AND is_active = true
));

CREATE POLICY "Product owners can manage spec tables" 
ON public.product_specification_tables FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.products p
  JOIN public.shops s ON p.shop_id = s.id
  WHERE p.id = product_specification_tables.product_id 
  AND s.owner_id = auth.uid()
));

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_variation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_product_variations_updated_at
BEFORE UPDATE ON public.product_variations
FOR EACH ROW EXECUTE FUNCTION update_variation_updated_at();

CREATE TRIGGER update_variation_combinations_updated_at
BEFORE UPDATE ON public.product_variation_combinations
FOR EACH ROW EXECUTE FUNCTION update_variation_updated_at();