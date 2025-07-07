
-- Phase 1: Fix profile issues and add missing data
-- First, ensure all existing users have proper profile records
INSERT INTO public.profiles (id, email, phone_number, role, contact_name, business_name)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'phone_number', '03000000000'),
  COALESCE(au.raw_user_meta_data->>'role', 'seller'),
  COALESCE(au.raw_user_meta_data->>'contact_name', 'User'),
  COALESCE(au.raw_user_meta_data->>'business_name', 'Business')
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Phase 2: Add sample categories
INSERT INTO public.categories (name, description) VALUES
('Electronics', 'Electronic devices, components, and accessories'),
('Clothing & Textiles', 'Garments, fabrics, and textile products'),
('Food & Beverages', 'Food items, beverages, and consumables'),
('Home & Garden', 'Furniture, home decor, and garden supplies'),
('Health & Beauty', 'Healthcare products, cosmetics, and personal care'),
('Sports & Fitness', 'Sports equipment, fitness gear, and outdoor items'),
('Automotive', 'Auto parts, accessories, and maintenance products'),
('Industrial & Tools', 'Industrial equipment, tools, and machinery'),
('Office Supplies', 'Stationery, office equipment, and business supplies'),
('Toys & Games', 'Children toys, games, and educational products')
ON CONFLICT (name) DO NOTHING;

-- Add major Pakistani cities
INSERT INTO public.cities (name, province) VALUES
('Karachi', 'Sindh'),
('Lahore', 'Punjab'),
('Islamabad', 'Federal Capital Territory'),
('Rawalpindi', 'Punjab'),
('Faisalabad', 'Punjab'),
('Multan', 'Punjab'),
('Peshawar', 'Khyber Pakhtunkhwa'),
('Quetta', 'Balochistan'),
('Sialkot', 'Punjab'),
('Gujranwala', 'Punjab'),
('Hyderabad', 'Sindh'),
('Sukkur', 'Sindh'),
('Bahawalpur', 'Punjab'),
('Sargodha', 'Punjab'),
('Abbottabad', 'Khyber Pakhtunkhwa')
ON CONFLICT (name, province) DO NOTHING;

-- Create sample wholesaler users if they don't exist
DO $$
DECLARE
    wholesaler_user_id UUID;
    wholesaler_user_id_2 UUID;
    wholesaler_user_id_3 UUID;
    karachi_id UUID;
    lahore_id UUID;
    islamabad_id UUID;
    electronics_id UUID;
    clothing_id UUID;
    food_id UUID;
BEGIN
    -- Get city IDs
    SELECT id INTO karachi_id FROM cities WHERE name = 'Karachi' LIMIT 1;
    SELECT id INTO lahore_id FROM cities WHERE name = 'Lahore' LIMIT 1;
    SELECT id INTO islamabad_id FROM cities WHERE name = 'Islamabad' LIMIT 1;
    
    -- Get category IDs
    SELECT id INTO electronics_id FROM categories WHERE name = 'Electronics' LIMIT 1;
    SELECT id INTO clothing_id FROM categories WHERE name = 'Clothing & Textiles' LIMIT 1;
    SELECT id INTO food_id FROM categories WHERE name = 'Food & Beverages' LIMIT 1;

    -- Create sample wholesaler profiles
    INSERT INTO public.profiles (id, email, phone_number, role, contact_name, business_name, business_type, address, city, postal_code)
    VALUES 
    (gen_random_uuid(), 'wholesaler1@demo.com', '03001234567', 'wholesaler', 'Ahmed Khan', 'Khan Electronics Wholesale', 'Wholesaler', 'Saddar Bazaar, Karachi', 'Karachi', '74000'),
    (gen_random_uuid(), 'wholesaler2@demo.com', '03002345678', 'wholesaler', 'Fatima Ali', 'Ali Textiles Ltd', 'Wholesaler', 'Anarkali Bazaar, Lahore', 'Lahore', '54000'),
    (gen_random_uuid(), 'wholesaler3@demo.com', '03003456789', 'wholesaler', 'Muhammad Hassan', 'Hassan Food Distributors', 'Wholesaler', 'Blue Area, Islamabad', 'Islamabad', '44000')
    ON CONFLICT (email) DO NOTHING;

    -- Get the wholesaler IDs
    SELECT id INTO wholesaler_user_id FROM profiles WHERE email = 'wholesaler1@demo.com';
    SELECT id INTO wholesaler_user_id_2 FROM profiles WHERE email = 'wholesaler2@demo.com';
    SELECT id INTO wholesaler_user_id_3 FROM profiles WHERE email = 'wholesaler3@demo.com';

    -- Create sample shops
    INSERT INTO public.shops (owner_id, name, contact, address, postal_code, city_id)
    VALUES 
    (wholesaler_user_id, 'Khan Electronics Hub', '03001234567', 'Saddar Electronics Market, Karachi', '74000', karachi_id),
    (wholesaler_user_id_2, 'Ali Premium Textiles', '03002345678', 'Anarkali Textile Market, Lahore', '54000', lahore_id),
    (wholesaler_user_id_3, 'Hassan Food Wholesale', '03003456789', 'F-7 Wholesale Market, Islamabad', '44000', islamabad_id)
    ON CONFLICT DO NOTHING;

    -- Add sample products
    INSERT INTO public.products (shop_id, name, description, price, category_id, moq, is_active, verification_status, image)
    SELECT 
        s.id,
        p.name,
        p.description,
        p.price,
        p.category_id,
        p.moq,
        true,
        'approved',
        p.image
    FROM shops s
    CROSS JOIN (
        VALUES 
        -- Electronics products
        ('Samsung Galaxy Smartphones', 'Latest Samsung smartphones in bulk quantities', 45000, electronics_id, 10, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'),
        ('LED TV 43 Inch', 'Smart LED TVs with warranty', 35000, electronics_id, 5, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400'),
        ('Wireless Earbuds', 'Premium quality wireless earbuds', 2500, electronics_id, 50, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400'),
        -- Textile products
        ('Cotton T-Shirts', 'Premium cotton t-shirts in various sizes', 350, clothing_id, 100, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'),
        ('Denim Jeans', 'High quality denim jeans for men and women', 800, clothing_id, 50, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'),
        ('Formal Shirts', 'Business formal shirts in multiple colors', 600, clothing_id, 75, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400'),
        -- Food products  
        ('Basmati Rice 25kg', 'Premium quality basmati rice in bulk', 4500, food_id, 20, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'),
        ('Cooking Oil 5L', 'Pure cooking oil in 5 liter containers', 800, food_id, 30, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400'),
        ('Wheat Flour 20kg', 'Fresh wheat flour in bulk packaging', 1200, food_id, 25, 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400')
    ) AS p(name, description, price, category_id, moq, image)
    WHERE s.name IN ('Khan Electronics Hub', 'Ali Premium Textiles', 'Hassan Food Wholesale')
    ON CONFLICT DO NOTHING;

END $$;

-- Create sample seller users
INSERT INTO public.profiles (id, email, phone_number, role, contact_name, business_name, business_type, address, city, postal_code)
VALUES 
(gen_random_uuid(), 'seller1@demo.com', '03004567890', 'seller', 'Sara Ahmed', 'Sara General Store', 'Retailer', 'Main Market, Karachi', 'Karachi', '74100'),
(gen_random_uuid(), 'seller2@demo.com', '03005678901', 'seller', 'Ali Raza', 'Raza Electronics Shop', 'Retailer', 'Liberty Market, Lahore', 'Lahore', '54200')
ON CONFLICT (email) DO NOTHING;

-- Create sample ads
INSERT INTO public.ads (wholesaler_id, headline, image, status)
SELECT 
    p.id,
    ad.headline,
    ad.image,
    'active'
FROM profiles p
CROSS JOIN (
    VALUES 
    ('🔥 MEGA SALE: Electronics up to 30% OFF! Limited Time Offer', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600'),
    ('✨ Premium Textiles at Wholesale Prices - Best Quality Guaranteed', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600'),
    ('🍚 Fresh Food Products Direct from Farms - Bulk Orders Welcome', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600')
) AS ad(headline, image)
WHERE p.role = 'wholesaler' AND p.email LIKE '%demo.com'
ON CONFLICT DO NOTHING;

-- Update handle_new_user function to work with phone authentication 
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    phone_number,
    contact_name,
    business_name,
    address,
    city,
    postal_code,
    role
  )
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone_number', '03000000000'),
    COALESCE(NEW.raw_user_meta_data->>'contact_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'Business'),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    COALESCE(NEW.raw_user_meta_data->>'postal_code', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'seller')
  );
  RETURN NEW;
END;
$$;
