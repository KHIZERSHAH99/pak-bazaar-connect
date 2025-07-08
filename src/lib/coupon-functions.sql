
-- Create function to increment coupon usage count
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE coupons 
  SET used_count = used_count + 1 
  WHERE id = coupon_id;
END;
$$;
