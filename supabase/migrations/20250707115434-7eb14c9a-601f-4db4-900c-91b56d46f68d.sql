
-- Phase 1: Enhanced payment flow database schema

-- Add delivery confirmation and enhanced order status tracking
ALTER TABLE orders 
ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN delivery_confirmed_by UUID REFERENCES profiles(id),
ADD COLUMN rejection_reason TEXT,
ADD COLUMN auto_delete_screenshot_at TIMESTAMP WITH TIME ZONE;

-- Add form pre-filling support
ALTER TABLE profiles
ADD COLUMN last_order_data JSONB DEFAULT '{}';

-- Create commission management tables
CREATE TABLE commission_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_percentage DECIMAL(5,2) DEFAULT 5.0,
  effective_from DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE monthly_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wholesaler_id UUID NOT NULL REFERENCES profiles(id),
  month DATE NOT NULL,
  total_sales DECIMAL(15,2) DEFAULT 0,
  commission_amount DECIMAL(15,2) DEFAULT 0,
  commission_percentage DECIMAL(5,2) DEFAULT 5.0,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'overdue')),
  paid_at TIMESTAMP WITH TIME ZONE,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wholesaler_id, month)
);

-- Add account suspension tracking
ALTER TABLE profiles
ADD COLUMN suspended_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN suspension_type TEXT CHECK (suspension_type IN ('commission', 'violation', 'manual')),
ADD COLUMN last_commission_payment TIMESTAMP WITH TIME ZONE;

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('order_status', 'commission', 'suspension', 'general')),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_monthly_commissions_wholesaler_month ON monthly_commissions(wholesaler_id, month);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_orders_delivered_at ON orders(delivered_at);
CREATE INDEX idx_profiles_suspended ON profiles(is_suspended, suspended_until);

-- Enable RLS on new tables
ALTER TABLE commission_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for commission_settings
CREATE POLICY "Admin can manage commission settings"
  ON commission_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view current commission settings"
  ON commission_settings FOR SELECT
  USING (true);

-- RLS policies for monthly_commissions
CREATE POLICY "Wholesalers can view their commissions"
  ON monthly_commissions FOR SELECT
  USING (wholesaler_id = auth.uid());

CREATE POLICY "Admin can manage all commissions"
  ON monthly_commissions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- RLS policies for notifications
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Function to calculate monthly commissions
CREATE OR REPLACE FUNCTION calculate_monthly_commissions(target_month DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE))
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  wholesaler_record RECORD;
  commission_rate DECIMAL(5,2);
BEGIN
  -- Get current commission rate
  SELECT commission_percentage INTO commission_rate 
  FROM commission_settings 
  WHERE effective_from <= target_month 
  ORDER BY effective_from DESC 
  LIMIT 1;
  
  IF commission_rate IS NULL THEN
    commission_rate := 5.0; -- Default 5%
  END IF;

  -- Calculate for each wholesaler
  FOR wholesaler_record IN 
    SELECT 
      s.owner_id as wholesaler_id,
      COALESCE(SUM(o.total_amount), 0) as total_sales
    FROM shops s
    LEFT JOIN orders o ON s.id = o.shop_id 
      AND o.status = 'completed'
      AND DATE_TRUNC('month', o.created_at) = target_month
    WHERE EXISTS (SELECT 1 FROM profiles WHERE id = s.owner_id AND role = 'wholesaler')
    GROUP BY s.owner_id
  LOOP
    INSERT INTO monthly_commissions (
      wholesaler_id,
      month,
      total_sales,
      commission_amount,
      commission_percentage,
      due_date
    ) VALUES (
      wholesaler_record.wholesaler_id,
      target_month,
      wholesaler_record.total_sales,
      wholesaler_record.total_sales * (commission_rate / 100),
      commission_rate,
      target_month + INTERVAL '1 month' + INTERVAL '15 days'
    )
    ON CONFLICT (wholesaler_id, month) 
    DO UPDATE SET
      total_sales = EXCLUDED.total_sales,
      commission_amount = EXCLUDED.commission_amount,
      commission_percentage = EXCLUDED.commission_percentage;
  END LOOP;
END;
$$;

-- Function to check and suspend overdue accounts
CREATE OR REPLACE FUNCTION suspend_overdue_accounts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Suspend accounts with overdue commissions
  UPDATE profiles 
  SET 
    is_suspended = true,
    suspended_until = NULL, -- Indefinite suspension
    suspension_type = 'commission',
    suspension_reason = 'Overdue commission payment'
  WHERE id IN (
    SELECT wholesaler_id 
    FROM monthly_commissions 
    WHERE payment_status = 'unpaid' 
    AND due_date < CURRENT_DATE
  ) AND is_suspended = false;
  
  -- Update commission status to overdue
  UPDATE monthly_commissions 
  SET payment_status = 'overdue'
  WHERE payment_status = 'unpaid' 
  AND due_date < CURRENT_DATE;
END;
$$;

-- Function to auto-delete old screenshots
CREATE OR REPLACE FUNCTION delete_completed_order_screenshots()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete screenshots from completed orders
  DELETE FROM storage.objects
  WHERE bucket_id = 'payment-screenshots'
  AND name IN (
    SELECT payment_screenshot 
    FROM orders 
    WHERE payment_screenshot IS NOT NULL 
    AND status = 'completed'
    AND delivered_at < NOW() - INTERVAL '1 day'
  );
  
  -- Clear screenshot references
  UPDATE orders 
  SET payment_screenshot = NULL
  WHERE payment_screenshot IS NOT NULL 
  AND status = 'completed'
  AND delivered_at < NOW() - INTERVAL '1 day';
END;
$$;

-- Trigger for order completion
CREATE OR REPLACE FUNCTION handle_order_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- When order is marked as completed, set delivery time and schedule screenshot deletion
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.delivered_at = NOW();
    NEW.auto_delete_screenshot_at = NOW() + INTERVAL '24 hours';
    
    -- Create notification for buyer
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
      NEW.buyer_id,
      'Order Delivered',
      'Your order has been marked as delivered. Thank you for your business!',
      'order_status'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_handle_order_completion
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_completion();

-- Insert default commission setting
INSERT INTO commission_settings (commission_percentage, created_by)
SELECT 5.0, id FROM profiles WHERE role = 'admin' LIMIT 1
ON CONFLICT DO NOTHING;
