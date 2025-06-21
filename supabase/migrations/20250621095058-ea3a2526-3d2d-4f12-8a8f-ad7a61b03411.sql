
-- Create product_views table for real analytics tracking
CREATE TABLE public.product_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  referrer TEXT
);

-- Add index for performance
CREATE INDEX idx_product_views_product_id ON public.product_views(product_id);
CREATE INDEX idx_product_views_user_id ON public.product_views(user_id);
CREATE INDEX idx_product_views_viewed_at ON public.product_views(viewed_at);

-- Enable RLS
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_views
CREATE POLICY "Anyone can insert product views" ON public.product_views
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can view all product views" ON public.product_views
  FOR SELECT TO authenticated
  USING (true);

-- Create order_tracking table for real-time order tracking
CREATE TABLE public.order_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add index for performance
CREATE INDEX idx_order_tracking_order_id ON public.order_tracking(order_id);
CREATE INDEX idx_order_tracking_created_at ON public.order_tracking(created_at);

-- Enable RLS
ALTER TABLE public.order_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_tracking
CREATE POLICY "Order participants can view tracking" ON public.order_tracking
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      LEFT JOIN public.shops s ON o.shop_id = s.id
      WHERE o.id = order_tracking.order_id
      AND (o.buyer_id = auth.uid() OR s.owner_id = auth.uid())
    )
  );

CREATE POLICY "Order participants can insert tracking" ON public.order_tracking
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      LEFT JOIN public.shops s ON o.shop_id = s.id
      WHERE o.id = order_tracking.order_id
      AND (o.buyer_id = auth.uid() OR s.owner_id = auth.uid())
    )
  );

-- Function to get product views analytics
CREATE OR REPLACE FUNCTION public.get_product_analytics(
  p_shop_ids UUID[],
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days'
)
RETURNS TABLE(
  total_views BIGINT,
  unique_viewers BIGINT,
  views_by_day JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_views,
    COUNT(DISTINCT user_id) as unique_viewers,
    jsonb_agg(
      jsonb_build_object(
        'date', date_trunc('day', pv.viewed_at),
        'views', COUNT(*)
      )
    ) as views_by_day
  FROM product_views pv
  JOIN products p ON pv.product_id = p.id
  WHERE p.shop_id = ANY(p_shop_ids)
    AND pv.viewed_at >= p_start_date;
END;
$$;

-- Function to track product view
CREATE OR REPLACE FUNCTION public.track_product_view(
  p_product_id UUID,
  p_session_id TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.product_views (
    product_id,
    user_id,
    session_id,
    user_agent,
    referrer
  ) VALUES (
    p_product_id,
    auth.uid(),
    p_session_id,
    p_user_agent,
    p_referrer
  );
END;
$$;

-- Function to add order tracking entry
CREATE OR REPLACE FUNCTION public.add_order_tracking(
  p_order_id UUID,
  p_status TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tracking_id UUID;
BEGIN
  INSERT INTO public.order_tracking (
    order_id,
    status,
    notes,
    created_by
  ) VALUES (
    p_order_id,
    p_status,
    p_notes,
    auth.uid()
  ) RETURNING id INTO tracking_id;
  
  RETURN tracking_id;
END;
$$;

-- Trigger to automatically add tracking when order status changes
CREATE OR REPLACE FUNCTION public.auto_track_order_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only track status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_tracking (
      order_id,
      status,
      notes,
      created_by
    ) VALUES (
      NEW.id,
      NEW.status,
      CASE 
        WHEN NEW.status = 'confirmed' THEN 'Order confirmed by wholesaler'
        WHEN NEW.status = 'rejected' THEN 'Order rejected by wholesaler'
        WHEN NEW.status = 'completed' THEN 'Order marked as completed'
        ELSE 'Status updated to ' || NEW.status
      END,
      COALESCE(
        (SELECT owner_id FROM shops WHERE id = NEW.shop_id),
        NEW.buyer_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic order tracking
CREATE TRIGGER trigger_auto_track_order_changes
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_track_order_changes();
