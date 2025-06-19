
-- Phase 1: Database Schema Enhancement

-- 1. Add payment screenshot functionality to orders table
ALTER TABLE orders 
ADD COLUMN payment_screenshot TEXT,
ADD COLUMN payment_method TEXT DEFAULT 'bank_transfer',
ADD COLUMN buyer_name TEXT,
ADD COLUMN buyer_phone TEXT,
ADD COLUMN buyer_address TEXT,
ADD COLUMN screenshot_uploaded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN rejected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN wholesaler_notes TEXT;

-- 2. Add wholesaler verification fields to profiles
ALTER TABLE profiles
ADD COLUMN cnic_image TEXT,
ADD COLUMN selfie_image TEXT,
ADD COLUMN verification_status TEXT DEFAULT 'pending',
ADD COLUMN verification_notes TEXT,
ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE,
ADD COLUMN suspension_reason TEXT;

-- 3. Create payment methods table for wholesalers
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wholesaler_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bank_name TEXT,
  account_number TEXT,
  account_title TEXT,
  jazzcash_number TEXT,
  easypaisa_number TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create commission tracking table
CREATE TABLE commission_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wholesaler_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sale_amount DECIMAL(12,2) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 5.0,
  commission_amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_id)
);

-- 5. Create order actions log for security tracking
CREATE TABLE order_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'confirmed', 'rejected', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create chat messages table for order communication
CREATE TABLE order_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Add indexes for performance
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_shop_id ON orders(shop_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_commission_records_wholesaler_id ON commission_records(wholesaler_id);
CREATE INDEX idx_commission_records_status ON commission_records(status);
CREATE INDEX idx_order_actions_order_id ON order_actions(order_id);
CREATE INDEX idx_order_messages_order_id ON order_messages(order_id);
CREATE INDEX idx_payment_methods_wholesaler_id ON payment_methods(wholesaler_id);

-- 8. Enable RLS on new tables
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_messages ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for payment_methods
CREATE POLICY "Wholesalers can manage their payment methods"
  ON payment_methods FOR ALL
  USING (wholesaler_id = auth.uid());

CREATE POLICY "Admin can view all payment methods"
  ON payment_methods FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 10. Create RLS policies for commission_records
CREATE POLICY "Wholesalers can view their commission records"
  ON commission_records FOR SELECT
  USING (wholesaler_id = auth.uid());

CREATE POLICY "Admin can manage all commission records"
  ON commission_records FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 11. Create RLS policies for order_actions
CREATE POLICY "Users can view order actions for their orders"
  ON order_actions FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE buyer_id = auth.uid() 
      OR shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
    )
  );

CREATE POLICY "Admin can view all order actions"
  ON order_actions FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 12. Create RLS policies for order_messages
CREATE POLICY "Order participants can access messages"
  ON order_messages FOR ALL
  USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE buyer_id = auth.uid() 
      OR shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
    )
  );

-- 13. Create function to auto-delete old screenshots
CREATE OR REPLACE FUNCTION delete_old_screenshots()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE orders 
  SET payment_screenshot = NULL,
      screenshot_uploaded_at = NULL
  WHERE screenshot_uploaded_at < NOW() - INTERVAL '3 days'
    AND payment_screenshot IS NOT NULL;
END;
$$;

-- 14. Create function to calculate monthly sales for wholesaler
CREATE OR REPLACE FUNCTION get_wholesaler_monthly_sales(wholesaler_uuid UUID, target_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  total_orders BIGINT,
  total_sales DECIMAL(15,2),
  pending_commission DECIMAL(15,2),
  paid_commission DECIMAL(15,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_sales,
    COALESCE(SUM(CASE WHEN cr.status = 'pending' THEN cr.commission_amount ELSE 0 END), 0) as pending_commission,
    COALESCE(SUM(CASE WHEN cr.status = 'paid' THEN cr.commission_amount ELSE 0 END), 0) as paid_commission
  FROM orders o
  JOIN shops s ON o.shop_id = s.id
  LEFT JOIN commission_records cr ON o.id = cr.order_id
  WHERE s.owner_id = wholesaler_uuid
    AND DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', target_month)
    AND o.status IN ('confirmed', 'completed');
END;
$$;

-- 15. Create trigger to automatically create commission records
CREATE OR REPLACE FUNCTION create_commission_record()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    INSERT INTO commission_records (
      wholesaler_id,
      order_id,
      sale_amount,
      commission_amount
    )
    SELECT 
      s.owner_id,
      NEW.id,
      NEW.total_amount,
      NEW.total_amount * 0.05
    FROM shops s
    WHERE s.id = NEW.shop_id
    ON CONFLICT (order_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_create_commission_record
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_commission_record();

-- 16. Create trigger to log order actions
CREATE OR REPLACE FUNCTION log_order_action()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  action_type TEXT;
  actor_id UUID;
BEGIN
  -- Determine action type and actor
  IF TG_OP = 'INSERT' THEN
    action_type := 'created';
    actor_id := NEW.buyer_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
      action_type := 'confirmed';
      -- Get wholesaler ID from shop
      SELECT s.owner_id INTO actor_id FROM shops s WHERE s.id = NEW.shop_id;
    ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
      action_type := 'rejected';
      -- Get wholesaler ID from shop
      SELECT s.owner_id INTO actor_id FROM shops s WHERE s.id = NEW.shop_id;
    ELSIF NEW.status = 'completed' AND OLD.status != 'completed' THEN
      action_type := 'completed';
      actor_id := NEW.buyer_id;
    END IF;
  END IF;

  -- Log the action if we have a valid action type
  IF action_type IS NOT NULL AND actor_id IS NOT NULL THEN
    INSERT INTO order_actions (order_id, user_id, action, notes)
    VALUES (
      COALESCE(NEW.id, OLD.id),
      actor_id,
      action_type,
      COALESCE(NEW.wholesaler_notes, '')
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_log_order_actions
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_action();
