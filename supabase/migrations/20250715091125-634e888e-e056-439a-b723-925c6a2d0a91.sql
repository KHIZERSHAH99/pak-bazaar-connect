
-- Phase 1: Critical Security and Database Fixes

-- Fix admin account phone number consistency
UPDATE public.profiles 
SET phone_number = '03418337167'
WHERE email = 'admin@test.com' AND phone_number != '03418337167';

-- Ensure products have proper verification status defaults
UPDATE public.products 
SET verification_status = 'pending' 
WHERE verification_status IS NULL;

-- Add missing foreign key constraints for data integrity
ALTER TABLE public.products 
ADD CONSTRAINT fk_products_shop_id 
FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE CASCADE;

ALTER TABLE public.products 
ADD CONSTRAINT fk_products_category_id 
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

ALTER TABLE public.orders 
ADD CONSTRAINT fk_orders_shop_id 
FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE CASCADE;

ALTER TABLE public.shops 
ADD CONSTRAINT fk_shops_city_id 
FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE SET NULL;

-- Fix RLS policy conflicts for products
DROP POLICY IF EXISTS "Sellers can view all active products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view approved active products" ON public.products;

-- Create unified product visibility policy
CREATE POLICY "Public can view approved active products" 
ON public.products FOR SELECT
USING (is_active = true AND verification_status = 'approved');

-- Fix order status updates - allow wholesalers to update order status
CREATE POLICY "Wholesalers can update order status"
ON public.orders FOR UPDATE
USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()))
WITH CHECK (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));

-- Create proper commission tracking
CREATE TABLE IF NOT EXISTS public.commission_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wholesaler_id UUID NOT NULL REFERENCES public.profiles(id),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 5.0,
  commission_amount DECIMAL(10,2) NOT NULL,
  order_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(order_id)
);

-- RLS for commission transactions
ALTER TABLE public.commission_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wholesalers can view their commissions"
ON public.commission_transactions FOR SELECT
USING (wholesaler_id = auth.uid());

CREATE POLICY "Admin can manage all commissions"
ON public.commission_transactions FOR ALL
USING (get_user_role() = 'admin');

-- Auto-create commission records when orders are completed
CREATE OR REPLACE FUNCTION create_commission_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create commission when order moves to completed status
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.commission_transactions (
      wholesaler_id,
      order_id,
      commission_rate,
      commission_amount,
      order_amount
    )
    SELECT 
      s.owner_id,
      NEW.id,
      COALESCE(cs.commission_percentage, 5.0),
      NEW.total_amount * (COALESCE(cs.commission_percentage, 5.0) / 100),
      NEW.total_amount
    FROM public.shops s
    LEFT JOIN public.commission_settings cs ON cs.effective_from <= CURRENT_DATE
    WHERE s.id = NEW.shop_id
    ORDER BY cs.effective_from DESC
    LIMIT 1
    ON CONFLICT (order_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for commission creation
DROP TRIGGER IF EXISTS trigger_create_commission_on_completion ON public.orders;
CREATE TRIGGER trigger_create_commission_on_completion
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION create_commission_on_completion();

-- Enhanced audit logging function
CREATE OR REPLACE FUNCTION enhanced_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Log important changes
  IF TG_OP = 'UPDATE' THEN
    -- Log role changes
    IF TG_TABLE_NAME = 'profiles' AND OLD.role IS DISTINCT FROM NEW.role THEN
      PERFORM log_audit_event(
        NEW.id,
        'role_changed',
        TG_TABLE_NAME,
        NEW.id::TEXT,
        jsonb_build_object('old_role', OLD.role),
        jsonb_build_object('new_role', NEW.role)
      );
    END IF;
    
    -- Log order status changes
    IF TG_TABLE_NAME = 'orders' AND OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM log_audit_event(
        auth.uid(),
        'order_status_changed',
        TG_TABLE_NAME,
        NEW.id::TEXT,
        jsonb_build_object('old_status', OLD.status),
        jsonb_build_object('new_status', NEW.status, 'order_id', NEW.id)
      );
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers
DROP TRIGGER IF EXISTS audit_profiles_trigger ON public.profiles;
CREATE TRIGGER audit_profiles_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION enhanced_audit_trigger();

DROP TRIGGER IF EXISTS audit_orders_trigger ON public.orders;
CREATE TRIGGER audit_orders_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION enhanced_audit_trigger();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_verification_status ON public.products(verification_status);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_wholesaler ON public.commission_transactions(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_event ON public.audit_logs(user_id, event_type);
