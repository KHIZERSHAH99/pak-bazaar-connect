-- Create test accounts for authentication system testing
-- These will help verify the authentication is working

-- First, let's check and create the RPC functions if they don't exist
CREATE OR REPLACE FUNCTION public.authenticate_user_by_identifier(identifier text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_email text;
    v_role text;
    v_auth_type text;
BEGIN
    -- Try to find user by email
    IF identifier LIKE '%@%' THEN
        SELECT id, email, role, auth_type
        INTO v_user_id, v_email, v_role, v_auth_type
        FROM profiles
        WHERE email = lower(identifier)
        LIMIT 1;
    ELSE
        -- Try to find user by phone (normalized)
        SELECT id, email, role, auth_type
        INTO v_user_id, v_email, v_role, v_auth_type
        FROM profiles
        WHERE normalized_phone = identifier
           OR phone_number = identifier
        LIMIT 1;
    END IF;
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'email', v_email,
        'role', v_role,
        'auth_type', v_auth_type,
        'identifier', identifier
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.authenticate_user_by_phone(user_phone text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_email text;
    v_role text;
BEGIN
    -- Find user by normalized phone
    SELECT id, email, role
    INTO v_user_id, v_email, v_role
    FROM profiles
    WHERE normalized_phone = user_phone
       OR phone_number = user_phone
    LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found with this phone number'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'email', v_email,
        'role', v_role
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.log_auth_attempt(
    p_identifier text,
    p_success boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO auth_attempts (identifier, success, attempted_at)
    VALUES (p_identifier, p_success, now());
EXCEPTION
    WHEN OTHERS THEN
        -- Log silently fails to not break auth flow
        NULL;
END;
$$;

-- Now, let's create test accounts with proper authentication setup
DO $$
DECLARE
    v_admin_id uuid := gen_random_uuid();
    v_wholesaler_id uuid := gen_random_uuid();
    v_seller_id uuid := gen_random_uuid();
BEGIN
    -- Create admin test account
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
        v_admin_id,
        'admin@test.com',
        crypt('admin123', gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"role": "admin"}',
        now(),
        now()
    ) ON CONFLICT (email) DO NOTHING;
    
    -- Create admin profile
    INSERT INTO profiles (id, email, role, contact_name, business_name, is_email_user, auth_type, display_identifier)
    VALUES (
        v_admin_id,
        'admin@test.com',
        'admin',
        'Admin User',
        'Admin Company',
        true,
        'email',
        'admin@test.com'
    ) ON CONFLICT (id) DO UPDATE
    SET role = 'admin',
        is_email_user = true,
        auth_type = 'email',
        display_identifier = 'admin@test.com';
    
    -- Create wholesaler test account
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
        v_wholesaler_id,
        'wholesaler1@test.com',
        crypt('wholesaler123', gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"role": "wholesaler"}',
        now(),
        now()
    ) ON CONFLICT (email) DO NOTHING;
    
    -- Create wholesaler profile
    INSERT INTO profiles (id, email, role, contact_name, business_name, business_type, is_email_user, auth_type, display_identifier)
    VALUES (
        v_wholesaler_id,
        'wholesaler1@test.com',
        'wholesaler',
        'Wholesaler User',
        'Test Wholesale Company',
        'wholesaler',
        true,
        'email',
        'wholesaler1@test.com'
    ) ON CONFLICT (id) DO UPDATE
    SET role = 'wholesaler',
        is_email_user = true,
        auth_type = 'email',
        display_identifier = 'wholesaler1@test.com';
    
    -- Create seller test account
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
        v_seller_id,
        'seller1@test.com',
        crypt('seller123', gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"role": "seller"}',
        now(),
        now()
    ) ON CONFLICT (email) DO NOTHING;
    
    -- Create seller profile
    INSERT INTO profiles (id, email, role, contact_name, business_name, business_type, is_email_user, auth_type, display_identifier)
    VALUES (
        v_seller_id,
        'seller1@test.com',
        'seller',
        'Seller User',
        'Test Retail Store',
        'seller',
        true,
        'email',
        'seller1@test.com'
    ) ON CONFLICT (id) DO UPDATE
    SET role = 'seller',
        is_email_user = true,
        auth_type = 'email',
        display_identifier = 'seller1@test.com';
        
    -- Also create a phone-based test account for testing phone login
    DECLARE
        v_phone_user_id uuid := gen_random_uuid();
    BEGIN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone)
        VALUES (
            v_phone_user_id,
            '03001234567@pakbazaarconnect.store',
            crypt('phone123', gen_salt('bf')),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"role": "seller", "phone_number": "03001234567"}',
            now(),
            now(),
            '03001234567'
        ) ON CONFLICT (email) DO NOTHING;
        
        -- Create phone user profile
        INSERT INTO profiles (
            id, email, role, contact_name, business_name, 
            phone_number, normalized_phone, 
            is_email_user, auth_type, display_identifier
        )
        VALUES (
            v_phone_user_id,
            '03001234567@pakbazaarconnect.store',
            'seller',
            'Phone Test User',
            'Phone Test Business',
            '03001234567',
            '03001234567',
            false,
            'phone',
            '03001234567'
        ) ON CONFLICT (id) DO UPDATE
        SET phone_number = '03001234567',
            normalized_phone = '03001234567',
            is_email_user = false,
            auth_type = 'phone',
            display_identifier = '03001234567';
    END;
END $$;