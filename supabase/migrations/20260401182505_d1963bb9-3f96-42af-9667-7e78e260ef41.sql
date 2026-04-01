
-- Create stock_movements audit table
CREATE TABLE public.stock_movements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity_change integer NOT NULL,
  previous_quantity integer NOT NULL DEFAULT 0,
  new_quantity integer NOT NULL DEFAULT 0,
  reason text NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX idx_stock_movements_created_at ON public.stock_movements(created_at DESC);

-- Enable RLS
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Wholesalers can view movements for their own products
CREATE POLICY "Wholesalers view own product movements"
  ON public.stock_movements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.shops s ON p.shop_id = s.id
      WHERE p.id = stock_movements.product_id
        AND s.owner_id = auth.uid()
    )
  );

-- Wholesalers can insert manual restock movements for their own products
CREATE POLICY "Wholesalers insert own product movements"
  ON public.stock_movements
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.shops s ON p.shop_id = s.id
      WHERE p.id = stock_movements.product_id
        AND s.owner_id = auth.uid()
    )
  );

-- Admins can view all movements
CREATE POLICY "Admins view all movements"
  ON public.stock_movements
  FOR SELECT
  USING (get_user_role() = 'admin');

-- System insert policy for trigger function
CREATE POLICY "System insert movements"
  ON public.stock_movements
  FOR INSERT
  WITH CHECK (created_by IS NULL);

-- Update trigger function to also log stock movements
CREATE OR REPLACE FUNCTION public.auto_handle_stock_on_order_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  item RECORD;
  prev_qty integer;
  new_qty integer;
BEGIN
  -- Deduct stock when order is confirmed
  IF NEW.status = 'confirmed' AND OLD.status IS DISTINCT FROM 'confirmed' THEN
    FOR item IN SELECT oi.product_id, oi.quantity FROM public.order_items oi WHERE oi.order_id = NEW.id AND oi.product_id IS NOT NULL
    LOOP
      SELECT COALESCE(p.stock_quantity, 0) INTO prev_qty FROM public.products p WHERE p.id = item.product_id;
      new_qty := GREATEST(0, prev_qty - item.quantity);
      
      UPDATE public.products SET stock_quantity = new_qty WHERE id = item.product_id;
      
      INSERT INTO public.stock_movements (product_id, quantity_change, previous_quantity, new_quantity, reason, order_id)
      VALUES (item.product_id, -item.quantity, prev_qty, new_qty, 'order_confirmed', NEW.id);
    END LOOP;
  END IF;

  -- Restore stock when order is rejected, cancelled, or returned
  IF NEW.status IN ('rejected', 'cancelled', 'returned')
     AND OLD.status NOT IN ('rejected', 'cancelled', 'returned', 'pending')
  THEN
    FOR item IN SELECT oi.product_id, oi.quantity FROM public.order_items oi WHERE oi.order_id = NEW.id AND oi.product_id IS NOT NULL
    LOOP
      SELECT COALESCE(p.stock_quantity, 0) INTO prev_qty FROM public.products p WHERE p.id = item.product_id;
      new_qty := prev_qty + item.quantity;
      
      UPDATE public.products SET stock_quantity = new_qty WHERE id = item.product_id;
      
      INSERT INTO public.stock_movements (product_id, quantity_change, previous_quantity, new_quantity, reason, order_id)
      VALUES (item.product_id, item.quantity, prev_qty, new_qty, 'order_' || NEW.status, NEW.id);
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;
