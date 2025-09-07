-- Update the authenticate_user_by_phone function to handle both email formats
CREATE OR REPLACE FUNCTION authenticate_user_by_phone(
    p_phone_number text,
    p_password text
)
RETURNS jsonb AS $$
DECLARE
    v_normalized_phone text;
    v_user_record jsonb;
    v_auth_id uuid;
    v_email text;
BEGIN
    -- Normalize the phone number
    v_normalized_phone := REGEXP_REPLACE(p_phone_number, '[^0-9]', '', 'g');
    
    -- Convert international format to local
    IF v_normalized_phone LIKE '92%' AND LENGTH(v_normalized_phone) >= 12 THEN
        v_normalized_phone := '0' || SUBSTRING(v_normalized_phone FROM 3);
    ELSIF v_normalized_phone LIKE '3%' AND LENGTH(v_normalized_phone) = 10 THEN
        v_normalized_phone := '0' || v_normalized_phone;
    END IF;
    
    -- Find the user by normalized phone in profiles
    SELECT 
        p.id,
        p.email,
        p.phone_number,
        p.normalized_phone,
        p.role,
        p.business_name,
        p.contact_name,
        p.verification_status,
        p.is_suspended,
        p.suspended_until
    INTO v_auth_id, v_email
    FROM profiles p
    WHERE p.normalized_phone = v_normalized_phone
       OR p.phone_number = v_normalized_phone
       OR p.phone_number = p_phone_number
    LIMIT 1;
    
    -- If no user found, return error
    IF v_auth_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Account not found. Please check your phone number or sign up.'
        );
    END IF;
    
    -- Check if account is suspended
    SELECT 
        CASE 
            WHEN is_suspended = true AND (suspended_until IS NULL OR suspended_until > now()) THEN true
            ELSE false
        END INTO v_user_record
    FROM profiles
    WHERE id = v_auth_id;
    
    IF v_user_record = true THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Account is suspended. Please contact support.'
        );
    END IF;
    
    -- Get the actual email used for auth
    SELECT email INTO v_email
    FROM auth.users
    WHERE id = v_auth_id;
    
    -- Return success with the correct email for authentication
    RETURN jsonb_build_object(
        'success', true,
        'email', v_email,
        'user_id', v_auth_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;