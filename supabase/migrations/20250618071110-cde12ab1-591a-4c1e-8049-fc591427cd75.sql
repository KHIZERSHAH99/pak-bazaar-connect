
-- Make khizerfight@gmail.com the sole admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'khizerfight@gmail.com';

-- Ensure all other users are not admin
UPDATE public.profiles 
SET role = 'wholesaler' 
WHERE email != 'khizerfight@gmail.com' AND role = 'admin';

-- Create a trigger to prevent anyone except khizerfight@gmail.com from becoming admin
CREATE OR REPLACE FUNCTION prevent_unauthorized_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow khizerfight@gmail.com to have admin role
  IF NEW.role = 'admin' AND NEW.email != 'khizerfight@gmail.com' THEN
    RAISE EXCEPTION 'Only khizerfight@gmail.com can have admin role';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT operations
DROP TRIGGER IF EXISTS check_admin_on_insert ON public.profiles;
CREATE TRIGGER check_admin_on_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_unauthorized_admin();

-- Create trigger for UPDATE operations
DROP TRIGGER IF EXISTS check_admin_on_update ON public.profiles;
CREATE TRIGGER check_admin_on_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_unauthorized_admin();
