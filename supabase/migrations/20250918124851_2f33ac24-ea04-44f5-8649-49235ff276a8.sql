-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.get_active_products_list();

-- Create the function with all required fields
CREATE OR REPLACE FUNCTION public.get_active_products_list()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  price numeric,
  image text,
  shop_id uuid,
  is_active boolean,
  category_id uuid,
  moq integer,
  verification_status text,
  sample_available boolean,
  sample_price numeric,
  shop_name text,
  shop_logo text,
  created_at timestamptz
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.image,
    p.shop_id,
    p.is_active,
    p.category_id,
    p.moq,
    p.verification_status,
    p.sample_available,
    p.sample_price,
    s.name as shop_name,
    s.logo as shop_logo,
    p.created_at
  FROM products p
  LEFT JOIN shops s ON p.shop_id = s.id
  WHERE p.is_active = true
    AND p.verification_status = 'approved'
  ORDER BY p.created_at DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_active_products_list() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_products_list() TO anon;