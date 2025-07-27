-- Fix the enhanced_audit_trigger function to properly handle different tables
CREATE OR REPLACE FUNCTION public.enhanced_audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
BEGIN
  -- Log important changes
  IF TG_OP = 'UPDATE' THEN
    -- Log role changes (only for profiles table)
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
    
    -- Log order status changes (only for orders table)
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
$function$;