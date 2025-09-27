-- Fix profiles table RLS policies to prevent anonymous access
-- This ensures only authenticated users can access profile data

-- First, drop the existing permissive policies that allow public access
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;

-- Create new restrictive policies for authenticated users only

-- Users can only view their own profile (authenticated only)
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Users can only update their own profile (authenticated only)
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (authenticated only)
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Admins can view all profiles (authenticated only)
CREATE POLICY "Admin can view all profiles" 
ON public.profiles FOR SELECT 
TO authenticated
USING (get_user_role() = 'admin'::text);

-- Admins can update all profiles (authenticated only)
CREATE POLICY "Admin can update all profiles" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (get_user_role() = 'admin'::text)
WITH CHECK (get_user_role() = 'admin'::text);

-- Admins can delete profiles if needed (authenticated only)
CREATE POLICY "Admin can delete profiles" 
ON public.profiles FOR DELETE 
TO authenticated
USING (get_user_role() = 'admin'::text);

-- Add a deny-all policy for anonymous users to be extra safe
CREATE POLICY "Deny anonymous access" 
ON public.profiles FOR ALL 
TO anon
USING (false)
WITH CHECK (false);

-- Also fix analytics_events table to prevent public access
DROP POLICY IF EXISTS "Admins can view all analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "System can insert analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.analytics_events;

-- Only authenticated users can view their own analytics
CREATE POLICY "Users can view their own analytics"
ON public.analytics_events FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all analytics (authenticated only)
CREATE POLICY "Admins can view all analytics"
ON public.analytics_events FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'::text
));

-- System can insert analytics (using service role)
CREATE POLICY "System can insert analytics events"
ON public.analytics_events FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Verify RLS is enabled on these critical tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Also ensure commission_summary_secure view is protected
-- Since it's a view, it will inherit the RLS from the underlying commission_records table
-- Let's ensure commission_records has proper RLS
ALTER TABLE public.commission_records ENABLE ROW LEVEL SECURITY;

-- Verify existing commission_records policies are for authenticated users only
DROP POLICY IF EXISTS "Admin manage all commission records" ON public.commission_records;
DROP POLICY IF EXISTS "System insert commissions" ON public.commission_records;
DROP POLICY IF EXISTS "Wholesalers view own commissions" ON public.commission_records;

-- Recreate with proper authentication requirements
CREATE POLICY "Wholesalers view own commissions"
ON public.commission_records FOR SELECT
TO authenticated
USING (wholesaler_id = auth.uid());

CREATE POLICY "Admin manage all commission records"
ON public.commission_records FOR ALL
TO authenticated
USING (get_user_role() = 'admin'::text)
WITH CHECK (get_user_role() = 'admin'::text);

CREATE POLICY "System insert commissions"
ON public.commission_records FOR INSERT
TO authenticated
WITH CHECK (true);