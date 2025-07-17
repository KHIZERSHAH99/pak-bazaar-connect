
-- Fix the enhanced_audit_trigger that's causing the "record old has no field status" error
-- The trigger is trying to access a 'status' field on profiles table which doesn't exist

DROP TRIGGER IF EXISTS audit_profiles_trigger ON public.profiles;
DROP TRIGGER IF EXISTS audit_orders_trigger ON public.orders;

-- Recreate the enhanced_audit_trigger function with proper field checks
CREATE OR REPLACE FUNCTION public.enhanced_audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Log important changes
  IF TG_OP = 'UPDATE' THEN
    -- Log role changes for profiles table
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
    
    -- Log order status changes for orders table
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
$$;

-- Recreate triggers only for the tables that have the required fields
CREATE TRIGGER audit_profiles_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION enhanced_audit_trigger();

CREATE TRIGGER audit_orders_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION enhanced_audit_trigger();

-- Add admin user with the new email
INSERT INTO public.profiles (id, email, role)
SELECT gen_random_uuid(), 'admin@test.com', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'admin@test.com');

-- Update products to approved status for testing (you can remove this later)
UPDATE public.products 
SET verification_status = 'approved' 
WHERE verification_status = 'pending';
