-- Update the validate_order_security trigger to add guest order rate limiting by phone number
CREATE OR REPLACE FUNCTION validate_order_security()
RETURNS TRIGGER AS $$
DECLARE
  shop_owner_id uuid;
  guest_order_count integer;
BEGIN
  -- Get the shop owner
  SELECT owner_id INTO shop_owner_id FROM shops WHERE id = NEW.shop_id;
  
  -- Prevent ordering from own shop
  IF NEW.buyer_id = shop_owner_id THEN
    RAISE EXCEPTION 'Cannot order from your own shop';
  END IF;
  
  -- Validate order amount is reasonable (0 to 10 million PKR)
  IF NEW.total_amount < 0 OR NEW.total_amount > 10000000 THEN
    RAISE EXCEPTION 'Invalid order amount';
  END IF;
  
  -- Rate limiting for guest orders by phone number
  IF NEW.is_guest_order = true AND NEW.buyer_phone IS NOT NULL THEN
    SELECT COUNT(*) INTO guest_order_count 
    FROM orders 
    WHERE is_guest_order = true 
      AND buyer_phone = NEW.buyer_phone
      AND created_at > NOW() - INTERVAL '24 hours';
    
    IF guest_order_count >= 5 THEN
      RAISE EXCEPTION 'Guest order limit exceeded. Maximum 5 orders per phone number in 24 hours.';
    END IF;
  END IF;
  
  -- Set guest session tracking
  IF NEW.is_guest_order = true THEN
    NEW.guest_session_id := COALESCE(NEW.guest_session_id, gen_random_uuid()::text);
  END IF;
  
  -- Log the order creation for audit
  INSERT INTO audit_logs (event_type, user_id, table_name, record_id, new_values)
  VALUES (
    'order_created',
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'orders',
    NEW.id,
    jsonb_build_object(
      'shop_id', NEW.shop_id,
      'total_amount', NEW.total_amount,
      'is_guest_order', NEW.is_guest_order,
      'buyer_phone_hash', md5(COALESCE(NEW.buyer_phone, ''))
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;