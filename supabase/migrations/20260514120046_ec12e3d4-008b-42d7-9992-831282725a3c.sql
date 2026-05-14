
-- Fix 1: profiles role escalation. Drop the loose UPDATE policy and the
-- separate "no role" policy; replace with a single policy whose WITH CHECK
-- enforces role immutability for non-admins.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users cannot update their own role" ON public.profiles;

CREATE POLICY "Users can update own profile (no role change)"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
);

-- Fix 2: Storage policy with broken join condition (s.name should be objects.name).
-- The other "Order participants can view payment screenshots" policy already
-- covers wholesalers correctly, so we can safely drop the broken one.
DROP POLICY IF EXISTS "Wholesalers can view order screenshots" ON storage.objects;

-- Fix 3: shops table has duplicate owner-management policies and an overly
-- permissive "Authenticated users can view all shops" SELECT. Tighten so:
--  * Owners + admins can manage their shops.
--  * Authenticated users can still SELECT (needed by existing UI), but the
--    sensitive 'contact' field will be restricted via a future view-based
--    fix — for now we just remove the duplicate.
DROP POLICY IF EXISTS "Wholesalers manage own shops" ON public.shops;
