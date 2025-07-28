-- Remove the audit_orders_trigger that's causing the role field error
DROP TRIGGER IF EXISTS audit_orders_trigger ON orders;

-- The enhanced_audit_trigger function should only be used on profiles table, not orders table
-- All other triggers on orders table are fine and designed specifically for orders