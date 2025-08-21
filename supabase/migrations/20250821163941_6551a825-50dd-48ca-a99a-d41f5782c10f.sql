-- Fix products table security and consolidate authentication system

-- First, ensure products table has proper RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop the problematic policy if it exists
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

-- Create secure product access policies
CREATE POLICY "Authenticated users can view active products" 
ON public.products 
FOR SELECT 
USING (
  (is_active = true) AND 
  (auth.uid() IS NOT NULL)
);

CREATE POLICY "Shop owners can manage their products" 
ON public.products 
FOR ALL 
USING (
  shop_id IN (
    SELECT id FROM shops WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  shop_id IN (
    SELECT id FROM shops WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all products" 
ON public.products 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create audit logging function for sensitive data access
CREATE OR REPLACE FUNCTION log_sensitive_data_access() 
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to sensitive product data on updates only
  IF TG_OP = 'UPDATE' AND auth.uid() IS NOT NULL THEN
    INSERT INTO audit_logs (
      user_id, 
      event_type, 
      table_name, 
      record_id,
      new_values
    ) VALUES (
      auth.uid(),
      'sensitive_data_update',
      'products',
      NEW.id,
      jsonb_build_object('action', 'product_update', 'product_name', NEW.name)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit logging trigger only for updates
DROP TRIGGER IF EXISTS audit_products_update ON public.products;
CREATE TRIGGER audit_products_update
  AFTER UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION log_sensitive_data_access();