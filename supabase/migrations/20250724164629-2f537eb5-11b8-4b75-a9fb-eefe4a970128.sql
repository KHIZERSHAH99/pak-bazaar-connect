-- Fix RLS policies for order_actions table to allow necessary inserts during order creation

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own order actions" ON public.order_actions;
DROP POLICY IF EXISTS "Users can insert their own order actions" ON public.order_actions;
DROP POLICY IF EXISTS "Admins can view all order actions" ON public.order_actions;

-- Create new policies for order_actions table
CREATE POLICY "Users can view order actions for their orders" ON public.order_actions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_actions.order_id 
    AND (o.buyer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.shops s 
      WHERE s.id = o.shop_id AND s.owner_id = auth.uid()
    ))
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "System can insert order actions" ON public.order_actions
FOR INSERT WITH CHECK (
  -- Allow inserts from authenticated users for orders they're involved in
  EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_actions.order_id 
    AND (o.buyer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.shops s 
      WHERE s.id = o.shop_id AND s.owner_id = auth.uid()
    ))
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage all order actions" ON public.order_actions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);