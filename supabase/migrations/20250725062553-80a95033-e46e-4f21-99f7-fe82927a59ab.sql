-- CRITICAL SECURITY FIXES - Phase 1
-- Fix database function security definer issues and strengthen admin protection

-- 1. Fix security definer functions by adding proper search_path
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Strengthen admin role protection with better validation
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only allow khizerfight@gmail.com to have admin role
  IF NEW.role = 'admin' AND NEW.email != 'khizerfight@gmail.com' THEN
    -- Log the unauthorized attempt
    INSERT INTO public.audit_logs (user_id, event_type, table_name, record_id, old_values, new_values)
    VALUES (
      auth.uid(),
      'unauthorized_admin_attempt',
      'profiles',
      NEW.id,
      jsonb_build_object('old_role', OLD.role, 'email', NEW.email),
      jsonb_build_object('attempted_role', 'admin', 'email', NEW.email)
    );
    
    RAISE EXCEPTION 'Only khizerfight@gmail.com can have admin role. This attempt has been logged.';
  END IF;
  
  -- Log successful admin role assignments
  IF NEW.role = 'admin' AND (OLD.role IS NULL OR OLD.role != 'admin') THEN
    INSERT INTO public.audit_logs (user_id, event_type, table_name, record_id, new_values)
    VALUES (
      auth.uid(),
      'admin_role_granted',
      'profiles',
      NEW.id,
      jsonb_build_object('role', 'admin', 'email', NEW.email)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. Fix other security definer functions
CREATE OR REPLACE FUNCTION public.switch_business_role(target_role text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID;
  current_role TEXT;
  result JSONB;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get current role
  SELECT role INTO current_role FROM public.profiles WHERE id = current_user_id;
  
  -- Validate target role
  IF target_role NOT IN ('seller', 'wholesaler') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid target role');
  END IF;
  
  -- Check if user can switch roles
  IF current_role NOT IN ('seller', 'wholesaler') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Role switching not available for your account type');
  END IF;
  
  -- Check if trying to switch to same role
  IF current_role = target_role THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already in target role');
  END IF;
  
  -- Perform the role switch
  UPDATE public.profiles 
  SET 
    role = target_role,
    last_role_switch = now(),
    role_switch_count = COALESCE(role_switch_count, 0) + 1
  WHERE id = current_user_id;
  
  -- Record the switch in history and audit log
  INSERT INTO public.role_switch_history (user_id, from_role, to_role, requires_approval, notes)
  VALUES (current_user_id, current_role, target_role, false, 'Direct business role switch');
  
  INSERT INTO public.audit_logs (user_id, event_type, table_name, record_id, old_values, new_values)
  VALUES (
    current_user_id,
    'role_switch',
    'profiles',
    current_user_id,
    jsonb_build_object('old_role', current_role),
    jsonb_build_object('new_role', target_role)
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Role switched successfully');
END;
$$;

-- 4. Fix RLS Policies - Remove overly permissive anonymous access
DROP POLICY IF EXISTS "Anyone can view shops" ON public.shops;

-- Replace with authenticated-only policy
CREATE POLICY "Authenticated users can view active shops"
ON public.shops
FOR SELECT
TO authenticated
USING (true);

-- 5. Strengthen product visibility - only show approved products to general users
DROP POLICY IF EXISTS "Users can view approved active products" ON public.products;

CREATE POLICY "Users can view approved active products"
ON public.products
FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND verification_status = 'approved'
  AND EXISTS (
    SELECT 1 FROM public.shops s 
    WHERE s.id = products.shop_id 
    AND s.owner_id != auth.uid()
  )
);

-- 6. Add order amount validation trigger
CREATE OR REPLACE FUNCTION public.validate_order_security()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Validate order amount is reasonable
  IF NEW.total_amount <= 0 OR NEW.total_amount > 10000000 THEN
    RAISE EXCEPTION 'Invalid order amount: %', NEW.total_amount;
  END IF;
  
  -- Prevent self-ordering
  IF EXISTS (
    SELECT 1 FROM public.shops s 
    WHERE s.id = NEW.shop_id 
    AND s.owner_id = NEW.buyer_id
  ) THEN
    RAISE EXCEPTION 'Cannot order from your own shop';
  END IF;
  
  -- Log order creation for security monitoring
  INSERT INTO public.audit_logs (user_id, event_type, table_name, record_id, new_values)
  VALUES (
    NEW.buyer_id,
    'order_created',
    'orders',
    NEW.id,
    jsonb_build_object(
      'shop_id', NEW.shop_id,
      'total_amount', NEW.total_amount,
      'payment_method', NEW.payment_method
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for order validation
DROP TRIGGER IF EXISTS validate_order_security_trigger ON public.orders;
CREATE TRIGGER validate_order_security_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_security();

-- 7. Add commission data access restrictions
CREATE POLICY "Restrict commission records access"
ON public.commission_records
FOR SELECT
TO authenticated
USING (
  wholesaler_id = auth.uid() 
  OR get_user_role() = 'admin'
);

-- 8. Add security monitoring for suspicious activities
CREATE OR REPLACE FUNCTION public.monitor_suspicious_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  recent_attempts INTEGER;
BEGIN
  -- Monitor failed login attempts (this would be called from auth triggers)
  IF TG_TABLE_NAME = 'profiles' AND TG_OP = 'UPDATE' THEN
    -- Check for rapid role switching
    IF OLD.role != NEW.role THEN
      SELECT COUNT(*) INTO recent_attempts
      FROM public.audit_logs
      WHERE user_id = NEW.id
        AND event_type = 'role_switch'
        AND created_at > NOW() - INTERVAL '1 hour';
      
      IF recent_attempts > 3 THEN
        INSERT INTO public.audit_logs (user_id, event_type, table_name, record_id, new_values)
        VALUES (
          NEW.id,
          'suspicious_role_switching',
          'profiles',
          NEW.id,
          jsonb_build_object('attempts_last_hour', recent_attempts)
        );
      END IF;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for suspicious activity monitoring
DROP TRIGGER IF EXISTS monitor_suspicious_activity_trigger ON public.profiles;
CREATE TRIGGER monitor_suspicious_activity_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.monitor_suspicious_activity();