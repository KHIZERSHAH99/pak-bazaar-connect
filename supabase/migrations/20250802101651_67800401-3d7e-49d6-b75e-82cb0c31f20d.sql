-- Create demo accounts for testing and Google crawlers
-- Demo seller account
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'demo-seller@pakbazaarconnect.com',
  crypt('demo123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"role": "seller"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Demo wholesaler account  
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'demo-wholesaler@pakbazaarconnect.com',
  crypt('demo123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"role": "wholesaler"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Create profiles for demo accounts
INSERT INTO public.profiles (id, email, role, business_name, contact_name, phone_number, address, city, verification_status)
VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'demo-seller@pakbazaarconnect.com',
  'seller',
  'Demo Retail Store',
  'Ahmed Khan',
  '+92-300-1234567',
  'Shop #123, Main Bazaar, Saddar',
  'Karachi',
  'approved'
),
(
  '22222222-2222-2222-2222-222222222222',
  'demo-wholesaler@pakbazaarconnect.com',
  'wholesaler',
  'Demo Wholesale Hub',
  'Fatima Sheikh',
  '+92-321-7654321',
  'Warehouse #456, Industrial Area',
  'Lahore',
  'approved'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  business_name = EXCLUDED.business_name,
  contact_name = EXCLUDED.contact_name,
  phone_number = EXCLUDED.phone_number,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  verification_status = EXCLUDED.verification_status;

-- Create demo shop for wholesaler
INSERT INTO public.shops (id, owner_id, name, contact, address, postal_code, logo)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  'Demo Wholesale Hub',
  '+92-321-7654321',
  'Warehouse #456, Industrial Area, Lahore',
  '54000',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  owner_id = EXCLUDED.owner_id,
  name = EXCLUDED.name,
  contact = EXCLUDED.contact,
  address = EXCLUDED.address,
  postal_code = EXCLUDED.postal_code;

-- Create sample categories if they don't exist
INSERT INTO public.categories (id, name, description)
VALUES 
(
  '44444444-4444-4444-4444-444444444444',
  'Electronics',
  'Electronic devices and accessories'
),
(
  '55555555-5555-5555-5555-555555555555',
  'Textiles',
  'Clothing and fabric materials'
),
(
  '66666666-6666-6666-6666-666666666666',
  'Home & Garden',
  'Home improvement and garden supplies'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Create sample products for the demo shop
INSERT INTO public.products (id, shop_id, category_id, name, price, moq, is_active, stock_quantity, sample_available, lead_time_days)
VALUES 
(
  '77777777-7777-7777-7777-777777777777',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  'Wireless Bluetooth Headphones',
  2500.00,
  50,
  true,
  500,
  true,
  7
),
(
  '88888888-8888-8888-8888-888888888888',
  '33333333-3333-3333-3333-333333333333',
  '55555555-5555-5555-5555-555555555555',
  'Cotton T-Shirts (Bulk Pack)',
  350.00,
  100,
  true,
  1000,
  true,
  14
),
(
  '99999999-9999-9999-9999-999999999999',
  '33333333-3333-3333-3333-333333333333',
  '66666666-6666-6666-6666-666666666666',
  'LED Table Lamps',
  800.00,
  25,
  true,
  300,
  false,
  10
) ON CONFLICT (id) DO UPDATE SET
  shop_id = EXCLUDED.shop_id,
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  moq = EXCLUDED.moq,
  is_active = EXCLUDED.is_active,
  stock_quantity = EXCLUDED.stock_quantity,
  sample_available = EXCLUDED.sample_available,
  lead_time_days = EXCLUDED.lead_time_days;

-- Create sample orders for demo purposes
INSERT INTO public.orders (id, buyer_id, shop_id, total_amount, status, buyer_name, buyer_phone, buyer_address, order_notes)
VALUES 
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333',
  125000.00,
  'confirmed',
  'Ahmed Khan',
  '+92-300-1234567',
  'Shop #123, Main Bazaar, Saddar, Karachi',
  'Sample order for demonstration'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333',
  35000.00,
  'pending',
  'Ahmed Khan',
  '+92-300-1234567',
  'Shop #123, Main Bazaar, Saddar, Karachi',
  'Urgent order - needed ASAP'
) ON CONFLICT (id) DO UPDATE SET
  buyer_id = EXCLUDED.buyer_id,
  shop_id = EXCLUDED.shop_id,
  total_amount = EXCLUDED.total_amount,
  status = EXCLUDED.status,
  buyer_name = EXCLUDED.buyer_name,
  buyer_phone = EXCLUDED.buyer_phone,
  buyer_address = EXCLUDED.buyer_address,
  order_notes = EXCLUDED.order_notes;