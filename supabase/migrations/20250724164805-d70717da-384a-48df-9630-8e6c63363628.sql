-- Fix RLS policies for order_actions table - first drop existing policies and create new ones

-- Drop ALL existing policies for order_actions table
DO $$ 
BEGIN
    -- Drop all existing policies
    DROP POLICY IF EXISTS "Users can view order actions for their orders" ON public.order_actions;
    DROP POLICY IF EXISTS "Admin can view all order actions" ON public.order_actions;
    DROP POLICY IF EXISTS "Users can insert their own order actions" ON public.order_actions;
    DROP POLICY IF EXISTS "System can insert order actions" ON public.order_actions;
    DROP POLICY IF EXISTS "Admins can manage all order actions" ON public.order_actions;
END $$;

-- Create new policies that allow proper access
CREATE POLICY "Users can view order actions for their orders" ON public.order_actions
FOR SELECT USING (
  order_id IN (
    SELECT orders.id 
    FROM public.orders 
    WHERE orders.buyer_id = auth.uid() 
    OR orders.shop_id IN (
      SELECT shops.id 
      FROM public.shops 
      WHERE shops.owner_id = auth.uid()
    )
  )
  OR get_user_role() = 'admin'
);

CREATE POLICY "System can insert order actions" ON public.order_actions
FOR INSERT WITH CHECK (
  -- Allow inserts for orders where the user is involved (buyer or shop owner)
  order_id IN (
    SELECT orders.id 
    FROM public.orders 
    WHERE orders.buyer_id = auth.uid() 
    OR orders.shop_id IN (
      SELECT shops.id 
      FROM public.shops 
      WHERE shops.owner_id = auth.uid()
    )
  )
  OR get_user_role() = 'admin'
);

CREATE POLICY "Admins can manage all order actions" ON public.order_actions
FOR ALL USING (get_user_role() = 'admin');