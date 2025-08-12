-- Fix security vulnerability: Restrict commission_settings access to admin users only
-- Remove the overly permissive policy that allows anyone to view commission settings
DROP POLICY IF EXISTS "Users can view current commission settings" ON public.commission_settings;

-- Create a more secure policy that only allows admin users to view commission settings
CREATE POLICY "Only admins can view commission settings" 
ON public.commission_settings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create a secure function for wholesalers to get their commission rate without exposing all settings
CREATE OR REPLACE FUNCTION public.get_current_commission_rate()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO ''
AS $$
DECLARE
  current_rate numeric;
BEGIN
  -- Get the most recent commission rate
  SELECT commission_percentage INTO current_rate
  FROM public.commission_settings
  WHERE effective_from <= CURRENT_DATE
  ORDER BY effective_from DESC
  LIMIT 1;
  
  -- Return default rate if no settings found
  RETURN COALESCE(current_rate, 5.0);
END;
$$;

-- Grant execute permission to authenticated users for the rate function
GRANT EXECUTE ON FUNCTION public.get_current_commission_rate() TO authenticated;