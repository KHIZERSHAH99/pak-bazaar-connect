
-- Phase 1: Add Missing Foreign Key Constraints and Fix Security Issues

-- Add missing foreign key constraints for better query planning and data integrity
ALTER TABLE public.shops 
ADD CONSTRAINT fk_shops_owner_id 
FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.ads 
ADD CONSTRAINT fk_ads_wholesaler_id 
FOREIGN KEY (wholesaler_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.role_requests 
ADD CONSTRAINT fk_role_requests_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.chat_history 
ADD CONSTRAINT fk_chat_history_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.payment_methods 
ADD CONSTRAINT fk_payment_methods_wholesaler_id 
FOREIGN KEY (wholesaler_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.commission_records 
ADD CONSTRAINT fk_commission_records_wholesaler_id 
FOREIGN KEY (wholesaler_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.order_actions 
ADD CONSTRAINT fk_order_actions_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.order_actions 
ADD CONSTRAINT fk_order_actions_order_id 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE public.order_messages 
ADD CONSTRAINT fk_order_messages_sender_id 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.order_messages 
ADD CONSTRAINT fk_order_messages_order_id 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE public.commission_transactions 
ADD CONSTRAINT fk_commission_transactions_wholesaler_id 
FOREIGN KEY (wholesaler_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.commission_transactions 
ADD CONSTRAINT fk_commission_transactions_order_id 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE public.monthly_commissions 
ADD CONSTRAINT fk_monthly_commissions_wholesaler_id 
FOREIGN KEY (wholesaler_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.coupons 
ADD CONSTRAINT fk_coupons_wholesaler_id 
FOREIGN KEY (wholesaler_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.coupon_usage 
ADD CONSTRAINT fk_coupon_usage_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.coupon_usage 
ADD CONSTRAINT fk_coupon_usage_coupon_id 
FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE CASCADE;

ALTER TABLE public.coupon_usage 
ADD CONSTRAINT fk_coupon_usage_order_id 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;

ALTER TABLE public.company_profiles 
ADD CONSTRAINT fk_company_profiles_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.company_profiles 
ADD CONSTRAINT fk_company_profiles_city_id 
FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE SET NULL;

ALTER TABLE public.inquiries 
ADD CONSTRAINT fk_inquiries_buyer_id 
FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.inquiries 
ADD CONSTRAINT fk_inquiries_seller_id 
FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.inquiries 
ADD CONSTRAINT fk_inquiries_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;

ALTER TABLE public.notifications 
ADD CONSTRAINT fk_notifications_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.role_switch_history 
ADD CONSTRAINT fk_role_switch_history_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.role_switch_history 
ADD CONSTRAINT fk_role_switch_history_approved_by 
FOREIGN KEY (approved_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.order_tracking 
ADD CONSTRAINT fk_order_tracking_order_id 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE public.order_tracking 
ADD CONSTRAINT fk_order_tracking_created_by 
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.product_views 
ADD CONSTRAINT fk_product_views_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.product_views 
ADD CONSTRAINT fk_product_views_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.commission_settings 
ADD CONSTRAINT fk_commission_settings_created_by 
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Fix function security issues by updating all functions to use secure search paths
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.prevent_unauthorized_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow khizerfight@gmail.com to have admin role
  IF NEW.role = 'admin' AND NEW.email != 'khizerfight@gmail.com' THEN
    RAISE EXCEPTION 'Only khizerfight@gmail.com can have admin role';
  END IF;
  RETURN NEW;
END;
$$;

-- Add performance indexes for frequently queried columns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_shop_verification_active 
ON public.products(shop_id, verification_status, is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_buyer_status_created 
ON public.orders(buyer_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_shop_status_created 
ON public.orders(shop_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ads_status_created 
ON public.ads(status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_role_status 
ON public.profiles(role, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_verification 
ON public.products(category_id, verification_status, is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shops_city_owner 
ON public.shops(city_id, owner_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commission_transactions_status_wholesaler 
ON public.commission_transactions(status, wholesaler_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read 
ON public.notifications(user_id, read_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_event_created 
ON public.audit_logs(user_id, event_type, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_views_product_viewed 
ON public.product_views(product_id, viewed_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_coupons_wholesaler_active_valid 
ON public.coupons(wholesaler_id, is_active, valid_from, valid_until);

-- Add check constraints for data validation
ALTER TABLE public.profiles 
ADD CONSTRAINT chk_profiles_role 
CHECK (role IN ('admin', 'wholesaler', 'seller', 'pending'));

ALTER TABLE public.profiles 
ADD CONSTRAINT chk_profiles_status 
CHECK (status IN ('active', 'suspended', 'banned'));

ALTER TABLE public.orders 
ADD CONSTRAINT chk_orders_status 
CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed', 'cancelled'));

ALTER TABLE public.orders 
ADD CONSTRAINT chk_orders_payment_method 
CHECK (payment_method IN ('bank_transfer', 'jazzcash', 'easypaisa'));

ALTER TABLE public.ads 
ADD CONSTRAINT chk_ads_status 
CHECK (status IN ('pending', 'approved', 'active', 'rejected', 'paused'));

ALTER TABLE public.products 
ADD CONSTRAINT chk_products_verification_status 
CHECK (verification_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.commission_transactions 
ADD CONSTRAINT chk_commission_transactions_status 
CHECK (status IN ('pending', 'paid', 'cancelled'));

ALTER TABLE public.role_requests 
ADD CONSTRAINT chk_role_requests_status 
CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.role_requests 
ADD CONSTRAINT chk_role_requests_requested_role 
CHECK (requested_role IN ('wholesaler', 'seller'));

ALTER TABLE public.inquiries 
ADD CONSTRAINT chk_inquiries_status 
CHECK (status IN ('pending', 'responded', 'closed'));

-- Add table comments for better documentation
COMMENT ON TABLE public.profiles IS 'User profiles with business information and role management';
COMMENT ON TABLE public.shops IS 'Wholesaler shops with location and contact details';
COMMENT ON TABLE public.products IS 'Products listed by wholesalers with verification status';
COMMENT ON TABLE public.orders IS 'Orders placed by sellers with payment tracking';
COMMENT ON TABLE public.ads IS 'Advertisement listings with approval workflow';
COMMENT ON TABLE public.commission_transactions IS 'Commission tracking for completed orders';
COMMENT ON TABLE public.audit_logs IS 'Security audit trail for all system activities';

-- Update trigger functions to use secure search paths
CREATE OR REPLACE FUNCTION public.create_commission_on_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.enhanced_audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log important changes
  IF TG_OP = 'UPDATE' THEN
    -- Log role changes
    IF TG_TABLE_NAME = 'profiles' AND OLD.role IS DISTINCT FROM NEW.role THEN
      PERFORM public.log_audit_event(
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
      PERFORM public.log_audit_event(
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
$$;

-- Create materialized view for performance analytics
CREATE MATERIALIZED VIEW public.shop_performance_stats AS
SELECT 
  s.id as shop_id,
  s.name as shop_name,
  s.owner_id,
  COUNT(DISTINCT o.id) as total_orders,
  COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN o.id END) as completed_orders,
  COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_sales,
  COUNT(DISTINCT p.id) as total_products,
  COUNT(DISTINCT CASE WHEN p.is_active = true AND p.verification_status = 'approved' THEN p.id END) as active_products,
  COALESCE(AVG(CASE WHEN o.status = 'completed' THEN o.total_amount END), 0) as avg_order_value,
  DATE_TRUNC('month', CURRENT_DATE) as stats_month
FROM public.shops s
LEFT JOIN public.orders o ON s.id = o.shop_id
LEFT JOIN public.products p ON s.id = p.shop_id
GROUP BY s.id, s.name, s.owner_id;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_shop_performance_stats_shop_month ON public.shop_performance_stats(shop_id, stats_month);

-- Enable RLS on materialized view
ALTER MATERIALIZED VIEW public.shop_performance_stats ENABLE ROW LEVEL SECURITY;

-- Add policy for materialized view
CREATE POLICY "Wholesalers can view their shop stats" 
ON public.shop_performance_stats FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Admin can view all shop stats" 
ON public.shop_performance_stats FOR SELECT
USING (public.get_user_role() = 'admin');

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION public.refresh_shop_performance_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.shop_performance_stats;
END;
$$;

-- Schedule automatic refresh (would need to be set up in pg_cron or similar)
COMMENT ON FUNCTION public.refresh_shop_performance_stats() IS 'Refresh shop performance statistics - should be called daily via cron';
