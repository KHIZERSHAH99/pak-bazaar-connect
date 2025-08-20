-- Enhanced RLS policies for improved security (corrected)

-- Strengthen profiles table policies
DROP POLICY IF EXISTS "Users can view their own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view profiles with audit logging" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles with restrictions" ON public.profiles;

-- Create more secure profile policies
CREATE POLICY "Users can view own profile securely" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id AND 
    auth.uid() IS NOT NULL AND
    NOT is_suspended
  );

CREATE POLICY "Users can update own profile securely" ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id AND 
    auth.uid() IS NOT NULL AND
    NOT is_suspended
  )
  WITH CHECK (
    auth.uid() = id AND 
    auth.uid() IS NOT NULL AND
    NOT is_suspended AND
    -- Prevent role self-modification
    (OLD.role = NEW.role OR get_user_role() = 'admin')
  );

CREATE POLICY "Admins can view profiles with restrictions" ON public.profiles
  FOR SELECT
  USING (
    get_user_role() = 'admin' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Admins can update profiles with security checks" ON public.profiles
  FOR UPDATE
  USING (
    get_user_role() = 'admin' AND
    auth.uid() IS NOT NULL
  )
  WITH CHECK (
    get_user_role() = 'admin' AND
    auth.uid() IS NOT NULL
  );

-- Strengthen payment methods security
DROP POLICY IF EXISTS "Wholesalers can manage their payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Sellers can view payment methods for orders" ON public.payment_methods;
DROP POLICY IF EXISTS "Admin can view all payment methods" ON public.payment_methods;

CREATE POLICY "Wholesalers can manage own payment methods securely" ON public.payment_methods
  FOR ALL
  USING (
    wholesaler_id = auth.uid() AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'wholesaler' 
      AND NOT is_suspended
    )
  )
  WITH CHECK (
    wholesaler_id = auth.uid() AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'wholesaler' 
      AND NOT is_suspended
    )
  );

CREATE POLICY "Sellers can view active payment methods only" ON public.payment_methods
  FOR SELECT
  USING (
    is_active = true AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'seller' 
      AND NOT is_suspended
    )
  );

-- Strengthen inquiries security to prevent data exposure
DROP POLICY IF EXISTS "Users can view inquiries they sent" ON public.inquiries;
DROP POLICY IF EXISTS "Users can view inquiries they received" ON public.inquiries;
DROP POLICY IF EXISTS "Users can create inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Sellers can update inquiry status" ON public.inquiries;

CREATE POLICY "Users can view own sent inquiries securely" ON public.inquiries
  FOR SELECT
  USING (
    buyer_id = auth.uid() AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND NOT is_suspended
    )
  );

CREATE POLICY "Users can view received inquiries securely" ON public.inquiries
  FOR SELECT
  USING (
    seller_id = auth.uid() AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND NOT is_suspended
    )
  );

CREATE POLICY "Users can create inquiries with validation" ON public.inquiries
  FOR INSERT
  WITH CHECK (
    buyer_id = auth.uid() AND
    auth.uid() IS NOT NULL AND
    buyer_id != seller_id AND -- Prevent self-inquiries
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND NOT is_suspended
    )
  );

-- Strengthen chat history security
DROP POLICY IF EXISTS "Users can view their own chat history" ON public.chat_history;
DROP POLICY IF EXISTS "Users can create their own chat messages" ON public.chat_history;

CREATE POLICY "Users can view own chat history securely" ON public.chat_history
  FOR SELECT
  USING (
    user_id = auth.uid() AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND NOT is_suspended
    )
  );

CREATE POLICY "Users can create chat messages securely" ON public.chat_history
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND NOT is_suspended
    )
  );

-- Add security monitoring function
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(
  p_table_name text,
  p_operation text,
  p_accessed_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Log access to sensitive data for monitoring
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    table_name,
    new_values
  ) VALUES (
    auth.uid(),
    'sensitive_data_access',
    p_table_name,
    jsonb_build_object(
      'operation', p_operation,
      'accessed_user_id', p_accessed_user_id,
      'access_time', now(),
      'user_role', get_user_role()
    )
  );
END;
$$;