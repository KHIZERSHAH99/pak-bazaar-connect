
-- Function to handle automatic stock sync on order status changes
CREATE OR REPLACE FUNCTION public.auto_handle_stock_on_order_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Deduct stock when order is confirmed
  IF NEW.status = 'confirmed' AND OLD.status IS DISTINCT FROM 'confirmed' THEN
    UPDATE public.products p
    SET stock_quantity = GREATEST(0, COALESCE(p.stock_quantity, 0) - oi.quantity)
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.product_id = p.id;
  END IF;

  -- Restore stock when order is rejected, cancelled, or returned
  -- Only restore if the order was previously in a state where stock was deducted (confirmed or later)
  IF NEW.status IN ('rejected', 'cancelled', 'returned')
     AND OLD.status NOT IN ('rejected', 'cancelled', 'returned', 'pending')
  THEN
    UPDATE public.products p
    SET stock_quantity = COALESCE(p.stock_quantity, 0) + oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.product_id = p.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS trg_auto_stock_sync ON public.orders;
CREATE TRIGGER trg_auto_stock_sync
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_handle_stock_on_order_status();
