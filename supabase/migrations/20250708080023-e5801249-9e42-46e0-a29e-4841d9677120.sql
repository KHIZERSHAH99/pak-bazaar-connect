
-- Create coupons table
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wholesaler_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  usage_limit INTEGER CHECK (usage_limit > 0),
  used_count INTEGER NOT NULL DEFAULT 0,
  min_order_amount NUMERIC CHECK (min_order_amount >= 0),
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  target_products UUID[] DEFAULT NULL,
  target_buyers UUID[] DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (valid_until > valid_from),
  CONSTRAINT valid_usage_count CHECK (used_count <= COALESCE(usage_limit, used_count + 1))
);

-- Create coupon usage tracking table
CREATE TABLE public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  discount_amount NUMERIC NOT NULL CHECK (discount_amount >= 0),
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coupon_id, user_id)
);

-- Enable RLS on coupons table
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Enable RLS on coupon_usage table
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- Wholesalers can manage their own coupons
CREATE POLICY "Wholesalers can manage their own coupons"
ON public.coupons
FOR ALL
TO authenticated
USING (wholesaler_id = auth.uid())
WITH CHECK (wholesaler_id = auth.uid());

-- Sellers can view active coupons
CREATE POLICY "Sellers can view active coupons"
ON public.coupons
FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND valid_from <= now() 
  AND valid_until >= now()
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'seller'
  )
);

-- Admins can view all coupons
CREATE POLICY "Admins can view all coupons"
ON public.coupons
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Admins can update coupon status
CREATE POLICY "Admins can update coupon status"
ON public.coupons
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Users can view their own coupon usage
CREATE POLICY "Users can view their own coupon usage"
ON public.coupon_usage
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own coupon usage
CREATE POLICY "Users can insert their own coupon usage"
ON public.coupon_usage
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Admins can view all coupon usage
CREATE POLICY "Admins can view all coupon usage"
ON public.coupon_usage
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create indexes for better performance
CREATE INDEX idx_coupons_wholesaler_id ON public.coupons(wholesaler_id);
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_active_valid ON public.coupons(is_active, valid_from, valid_until);
CREATE INDEX idx_coupon_usage_coupon_id ON public.coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user_id ON public.coupon_usage(user_id);
