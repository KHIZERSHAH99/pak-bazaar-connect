-- Fixed test account creation without ON CONFLICT issues
-- Using proper insertion methods for auth.users table

DO $$
DECLARE
    v_admin_id uuid;
    v_wholesaler_id uuid;
    v_seller_id uuid;
    v_phone_user_id uuid;
BEGIN
    -- Check if test accounts already exist
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@test.com' LIMIT 1;
    SELECT id INTO v_wholesaler_id FROM auth.users WHERE email = 'wholesaler1@test.com' LIMIT 1;
    SELECT id INTO v_seller_id FROM auth.users WHERE email = 'seller1@test.com' LIMIT 1;
    SELECT id INTO v_phone_user_id FROM auth.users WHERE email = '03001234567@pakbazaarconnect.store' LIMIT 1;
    
    -- Create admin test account if not exists
    IF v_admin_id IS NULL THEN
        v_admin_id := gen_random_uuid();
        INSERT INTO auth.users (
            id, email, encrypted_password, email_confirmed_at, 
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        )
        VALUES (
            v_admin_id,
            'admin@test.com',
            crypt('admin123', gen_salt('bf')),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"role": "admin"}',
            now(),
            now()
        );
        
        -- Create admin profile
        INSERT INTO profiles (
            id, email, role, contact_name, business_name, 
            is_email_user, auth_type, display_identifier
        )
        VALUES (
            v_admin_id,
            'admin@test.com',
            'admin',
            'Admin User',
            'Admin Company',
            true,
            'email',
            'admin@test.com'
        );
    END IF;
    
    -- Create wholesaler test account if not exists
    IF v_wholesaler_id IS NULL THEN
        v_wholesaler_id := gen_random_uuid();
        INSERT INTO auth.users (
            id, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        )
        VALUES (
            v_wholesaler_id,
            'wholesaler1@test.com',
            crypt('wholesaler123', gen_salt('bf')),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"role": "wholesaler"}',
            now(),
            now()
        );
        
        -- Create wholesaler profile
        INSERT INTO profiles (
            id, email, role, contact_name, business_name, business_type,
            is_email_user, auth_type, display_identifier
        )
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
        );
    END IF;
    
    -- Create seller test account if not exists
    IF v_seller_id IS NULL THEN
        v_seller_id := gen_random_uuid();
        INSERT INTO auth.users (
            id, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        )
        VALUES (
            v_seller_id,
            'seller1@test.com',
            crypt('seller123', gen_salt('bf')),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"role": "seller"}',
            now(),
            now()
        );
        
        -- Create seller profile
        INSERT INTO profiles (
            id, email, role, contact_name, business_name, business_type,
            is_email_user, auth_type, display_identifier
        )
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
        );
    END IF;
    
    -- Create phone-based test account if not exists
    IF v_phone_user_id IS NULL THEN
        v_phone_user_id := gen_random_uuid();
        INSERT INTO auth.users (
            id, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
        )
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
        );
        
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
        );
    END IF;
    
    RAISE NOTICE 'Test accounts created successfully';
END $$;