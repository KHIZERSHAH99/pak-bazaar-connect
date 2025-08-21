-- Create or replace function to ensure products table is properly secured
CREATE OR REPLACE FUNCTION check_products_rls() RETURNS BOOLEAN AS $$
BEGIN
  -- Enable RLS on products table if not already enabled
  IF NOT (SELECT row_security FROM pg_class WHERE relname = 'products') THEN
    EXECUTE 'ALTER TABLE public.products ENABLE ROW LEVEL SECURITY';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function
SELECT check_products_rls();

-- Create enhanced RLS policies for products table to prevent unauthorized access
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

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

-- Add security logging for sensitive data access
CREATE OR REPLACE FUNCTION log_sensitive_access() 
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to sensitive product data
  IF TG_OP = 'SELECT' AND auth.uid() IS NOT NULL THEN
    INSERT INTO audit_logs (
      user_id, 
      event_type, 
      table_name, 
      record_id,
      new_values
    ) VALUES (
      auth.uid(),
      'sensitive_data_access',
      'products',
      NEW.id,
      jsonb_build_object('action', 'product_view', 'product_name', NEW.name)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit logging trigger
DROP TRIGGER IF EXISTS audit_products_access ON public.products;
CREATE TRIGGER audit_products_access
  AFTER SELECT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION log_sensitive_access();