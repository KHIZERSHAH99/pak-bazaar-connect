-- Fix RLS policies for profiles table to allow profile creation during signup
-- Drop existing problematic policies
DROP POLICY IF EXISTS "System insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create new policies that work correctly
-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admin policies
CREATE POLICY "Admin can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (get_user_role() = 'admin');

CREATE POLICY "Admin can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (get_user_role() = 'admin');

-- Ensure the trigger function exists and works correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    role,
    phone_number,
    normalized_phone,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'pending'),
    COALESCE(NULLIF(NEW.phone, ''), NEW.raw_user_meta_data->>'phone'),
    public.normalize_pakistani_phone(COALESCE(NULLIF(NEW.phone, ''), NEW.raw_user_meta_data->>'phone')),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
    normalized_phone = COALESCE(EXCLUDED.normalized_phone, profiles.normalized_phone),
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires after a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();