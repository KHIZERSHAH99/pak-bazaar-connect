-- Update the authenticate_user_by_phone function to handle multiple email formats
CREATE OR REPLACE FUNCTION public.authenticate_user_by_phone(phone_number text, user_password text)
RETURNS TABLE(success boolean, user_id uuid, email text, message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    normalized_phone text;
    possible_emails text[];
    test_email text;
    found_user_id uuid;
    found_email text;
BEGIN
    -- Normalize the phone number
    normalized_phone := regexp_replace(phone_number, '[^0-9]', '', 'g');
    
    -- Handle different formats
    IF normalized_phone ~ '^923\d{9}$' THEN
        normalized_phone := '0' || substring(normalized_phone from 3);
    ELSIF normalized_phone ~ '^3\d{9}$' THEN
        normalized_phone := '0' || normalized_phone;
    ELSIF normalized_phone ~ '^\d{10}$' AND NOT normalized_phone ~ '^0' THEN
        normalized_phone := '0' || normalized_phone;
    END IF;
    
    -- Define all possible email formats for phone auth (including old and new)
    possible_emails := ARRAY[
        normalized_phone || '@pakbazaarconnect.store',  -- New format (primary)
        normalized_phone || '@phone.auth',               -- Old format (backward compatibility)
        normalized_phone || '@temp-phone-auth.com',      
        normalized_phone || '@phone-auth.com',
        normalized_phone || '@phone.auth.local'
    ];
    
    -- First try to find user by phone in profiles
    SELECT id, email 
    INTO found_user_id, found_email
    FROM public.profiles 
    WHERE normalized_phone = normalized_phone 
       OR phone_number = phone_number 
       OR phone_number = normalized_phone
    LIMIT 1;
    
    IF FOUND THEN
        -- Check if the found email is in our possible emails or is a real email
        IF found_email = ANY(possible_emails) OR found_email !~ '@(phone\.auth|pakbazaarconnect\.store|temp-phone-auth\.com|phone-auth\.com)' THEN
            RETURN QUERY SELECT true, found_user_id, found_email, 'User found'::text;
        END IF;
    END IF;
    
    -- If not found by phone, try each possible email format
    FOREACH test_email IN ARRAY possible_emails LOOP
        SELECT id, email 
        INTO found_user_id, found_email
        FROM public.profiles 
        WHERE email = test_email
        LIMIT 1;
        
        IF FOUND THEN
            RETURN QUERY SELECT true, found_user_id, found_email, 'User found'::text;
            RETURN;
        END IF;
    END LOOP;
    
    -- If still not found, check auth.users table
    FOREACH test_email IN ARRAY possible_emails LOOP
        SELECT id, email 
        INTO found_user_id, found_email
        FROM auth.users 
        WHERE email = test_email
        LIMIT 1;
        
        IF FOUND THEN
            -- Create profile if doesn't exist
            INSERT INTO public.profiles (id, email, normalized_phone, phone_number, role)
            VALUES (found_user_id, found_email, normalized_phone, normalized_phone, 'seller')
            ON CONFLICT (id) DO NOTHING;
            
            RETURN QUERY SELECT true, found_user_id, found_email, 'User found in auth'::text;
            RETURN;
        END IF;
    END LOOP;
    
    -- No user found
    RETURN QUERY SELECT false, NULL::uuid, NULL::text, 'No account found with this phone number'::text;
END;
$function$;