-- Remove all commission-related database objects

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_create_commission_record ON orders;
DROP TRIGGER IF EXISTS create_commission_on_order_completion ON orders;

-- Drop functions
DROP FUNCTION IF EXISTS create_commission_record() CASCADE;
DROP FUNCTION IF EXISTS create_commission_on_completion() CASCADE;
DROP FUNCTION IF EXISTS calculate_monthly_commissions(DATE) CASCADE;
DROP FUNCTION IF EXISTS suspend_overdue_accounts() CASCADE;
DROP FUNCTION IF EXISTS get_wholesaler_monthly_sales(UUID, DATE) CASCADE;

-- Drop views
DROP VIEW IF EXISTS commission_summary_secure CASCADE;

-- Drop tables (in order of dependencies)
DROP TABLE IF EXISTS commission_usage CASCADE;
DROP TABLE IF EXISTS commission_transactions CASCADE;
DROP TABLE IF EXISTS monthly_commissions CASCADE;
DROP TABLE IF EXISTS commission_records CASCADE;
DROP TABLE IF EXISTS commission_settings CASCADE;
DROP TABLE IF EXISTS commissions CASCADE;

-- Remove commission-related columns from orders table
ALTER TABLE orders DROP COLUMN IF EXISTS commission_id CASCADE;

-- Remove commission-related columns from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS last_commission_payment CASCADE;

-- Update suspension_type check constraint to remove 'commission'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_suspension_type_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_suspension_type_check 
  CHECK (suspension_type IN ('violation', 'manual'));

-- Update notification type check to remove 'commission'
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('order_status', 'suspension', 'general'));