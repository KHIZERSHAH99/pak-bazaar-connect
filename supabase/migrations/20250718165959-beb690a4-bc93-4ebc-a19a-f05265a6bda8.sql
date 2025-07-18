
-- Add new columns to products table for enhanced details
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS brand text,
ADD COLUMN IF NOT EXISTS model_number text,
ADD COLUMN IF NOT EXISTS origin_country text,
ADD COLUMN IF NOT EXISTS package_weight numeric,
ADD COLUMN IF NOT EXISTS package_dimensions text,
ADD COLUMN IF NOT EXISTS lead_time_days integer,
ADD COLUMN IF NOT EXISTS stock_quantity integer,
ADD COLUMN IF NOT EXISTS warranty_info text,
ADD COLUMN IF NOT EXISTS certifications text[],
ADD COLUMN IF NOT EXISTS customization_available boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS colors_available text[],
ADD COLUMN IF NOT EXISTS packaging_type text,
ADD COLUMN IF NOT EXISTS units_per_package integer DEFAULT 1;

-- Add some basic categories if they don't exist
INSERT INTO public.categories (name, description) VALUES 
('Electronics', 'Electronic devices and components'),
('Textiles', 'Fabrics, clothing, and textile products'),
('Machinery', 'Industrial and commercial machinery'),
('Chemicals', 'Chemical products and materials'),
('Food & Beverages', 'Food products and beverages'),
('Home & Garden', 'Home and garden products'),
('Sports & Entertainment', 'Sports equipment and entertainment products'),
('Health & Beauty', 'Health and beauty products'),
('Automotive', 'Automotive parts and accessories'),
('Construction', 'Construction materials and tools')
ON CONFLICT (name) DO NOTHING;
