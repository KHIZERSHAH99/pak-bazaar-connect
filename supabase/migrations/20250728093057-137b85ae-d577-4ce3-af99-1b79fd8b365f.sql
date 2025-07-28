-- Check if enhanced_audit_trigger is attached to orders table and remove it if it is
SELECT 'DROP TRIGGER IF EXISTS enhanced_audit_trigger ON orders;';

-- Drop the trigger from orders table to prevent the role field error
DROP TRIGGER IF EXISTS enhanced_audit_trigger ON orders;

-- We'll keep other triggers that are specifically designed for orders table
-- The enhanced_audit_trigger should only be on profiles table