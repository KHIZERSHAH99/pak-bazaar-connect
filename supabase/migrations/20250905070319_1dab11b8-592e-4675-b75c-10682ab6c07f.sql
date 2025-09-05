-- Clear data in correct order to respect foreign key constraints
DELETE FROM public.commission_settings WHERE true;
DELETE FROM public.commission_records WHERE true;
DELETE FROM public.commission_transactions WHERE true;
DELETE FROM public.monthly_commissions WHERE true;
DELETE FROM public.order_items WHERE true;
DELETE FROM public.order_status_history WHERE true;
DELETE FROM public.order_tracking WHERE true;
DELETE FROM public.order_actions WHERE true;
DELETE FROM public.orders WHERE true;
DELETE FROM public.product_specifications WHERE true;
DELETE FROM public.product_pricing_tiers WHERE true;
DELETE FROM public.product_views WHERE true;
DELETE FROM public.products WHERE true;
DELETE FROM public.ads WHERE true;
DELETE FROM public.shops WHERE true;
DELETE FROM public.role_requests WHERE true;
DELETE FROM public.chat_history WHERE true;
DELETE FROM public.favorites WHERE true;
DELETE FROM public.shop_favorites WHERE true;
DELETE FROM public.inquiries WHERE true;
DELETE FROM public.coupons WHERE true;
DELETE FROM public.coupon_usage WHERE true;
DELETE FROM public.payment_methods WHERE true;
DELETE FROM public.company_profiles WHERE true;
DELETE FROM public.profiles WHERE true;

-- Add new columns to profiles table for better auth tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS auth_type text DEFAULT 'phone',
ADD COLUMN IF NOT EXISTS display_identifier text,
ADD COLUMN IF NOT EXISTS is_email_user boolean DEFAULT false;

-- Create function to detect and validate input types
CREATE OR REPLACE FUNCTION public.validate_auth_input(input_value text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cleaned_input text;
  result jsonb;
BEGIN
  cleaned_input := trim(input_value);
  
  -- Check if it's an email
  IF cleaned_input ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    RETURN jsonb_build_object(
      'type', 'email',
      'value', lower(cleaned_input),
      'valid', true
    );
  END IF;
  
  -- Check if it's a phone number (no @ symbol allowed)
  IF NOT cleaned_input LIKE '%@%' THEN
    -- Remove all non-numeric characters for validation
    cleaned_input := regexp_replace(cleaned_input, '[^0-9]', '', 'g');
    
    -- Pakistani phone validation
    IF cleaned_input ~ '^03[0-9]{9}$' OR 
       cleaned_input ~ '^923[0-9]{9}$' OR
       cleaned_input ~ '^3[0-9]{9}$' THEN
      -- Normalize to standard format
      IF cleaned_input ~ '^923[0-9]{9}$' THEN
        cleaned_input := '0' || substring(cleaned_input from 3);
      ELSIF cleaned_input ~ '^3[0-9]{9}$' THEN
        cleaned_input := '0' || cleaned_input;
      END IF;
      
      RETURN jsonb_build_object(
        'type', 'phone',
        'value', cleaned_input,
        'valid', true
      );
    END IF;
  END IF;
  
  -- Invalid input
  RETURN jsonb_build_object(
    'type', 'invalid',
    'value', input_value,
    'valid', false
  );
END;
$$;

-- Update the authenticate_user_by_phone function to handle new structure
CREATE OR REPLACE FUNCTION public.authenticate_user_by_identifier(identifier text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  input_validation jsonb;
BEGIN
  -- Validate input
  input_validation := public.validate_auth_input(identifier);
  
  IF (input_validation->>'valid')::boolean = false THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid email or phone number format'
    );
  END IF;
  
  -- Find user based on input type
  IF input_validation->>'type' = 'email' THEN
    -- Find by email
    SELECT p.* INTO user_record
    FROM public.profiles p
    WHERE p.email = input_validation->>'value'
    AND p.is_email_user = true
    LIMIT 1;
  ELSE
    -- Find by phone
    SELECT p.* INTO user_record
    FROM public.profiles p
    WHERE p.normalized_phone = input_validation->>'value'
    OR p.phone_number = input_validation->>'value'
    LIMIT 1;
  END IF;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No account found with this email or phone number'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', user_record.id,
    'email', user_record.email,
    'role', user_record.role,
    'auth_type', user_record.auth_type,
    'identifier', COALESCE(user_record.display_identifier, user_record.email)
  );
END;
$$;