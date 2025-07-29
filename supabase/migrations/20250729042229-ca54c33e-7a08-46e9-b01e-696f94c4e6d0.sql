-- Enhance order statuses and add tracking features
-- First, let's expand the order status enum to include more granular statuses
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'processing';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'packed';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'shipped';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'delivered';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'returned';

-- Create order status history table for tracking all status changes
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    previous_status TEXT,
    changed_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    estimated_delivery DATE,
    tracking_number TEXT,
    carrier_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add new columns to orders table for better tracking
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS carrier_name TEXT,
ADD COLUMN IF NOT EXISTS estimated_delivery DATE,
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS packed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS returned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS order_notes TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS requires_attention BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_status_update TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create order items table for detailed order tracking
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    specifications JSONB,
    custom_requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_status_history
CREATE POLICY "Order participants can view status history" 
ON public.order_status_history 
FOR SELECT 
USING (
    order_id IN (
        SELECT o.id FROM public.orders o
        LEFT JOIN public.shops s ON o.shop_id = s.id
        WHERE o.buyer_id = auth.uid() OR s.owner_id = auth.uid()
    )
);

CREATE POLICY "Order participants can insert status history" 
ON public.order_status_history 
FOR INSERT 
WITH CHECK (
    order_id IN (
        SELECT o.id FROM public.orders o
        LEFT JOIN public.shops s ON o.shop_id = s.id
        WHERE o.buyer_id = auth.uid() OR s.owner_id = auth.uid()
    )
);

-- RLS policies for order_items
CREATE POLICY "Order participants can view order items" 
ON public.order_items 
FOR SELECT 
USING (
    order_id IN (
        SELECT o.id FROM public.orders o
        LEFT JOIN public.shops s ON o.shop_id = s.id
        WHERE o.buyer_id = auth.uid() OR s.owner_id = auth.uid()
    )
);

CREATE POLICY "Order participants can manage order items" 
ON public.order_items 
FOR ALL 
USING (
    order_id IN (
        SELECT o.id FROM public.orders o
        LEFT JOIN public.shops s ON o.shop_id = s.id
        WHERE o.buyer_id = auth.uid() OR s.owner_id = auth.uid()
    )
);

-- Function to automatically track status changes
CREATE OR REPLACE FUNCTION public.track_order_status_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Only track status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.order_status_history (
            order_id,
            status,
            previous_status,
            changed_by,
            notes,
            tracking_number,
            carrier_name,
            estimated_delivery
        ) VALUES (
            NEW.id,
            NEW.status,
            OLD.status,
            auth.uid(),
            CASE 
                WHEN NEW.status = 'processing' THEN 'Order is being processed'
                WHEN NEW.status = 'packed' THEN 'Order has been packed and ready for shipment'
                WHEN NEW.status = 'shipped' THEN 'Order has been shipped'
                WHEN NEW.status = 'delivered' THEN 'Order has been delivered'
                WHEN NEW.status = 'returned' THEN 'Order has been returned'
                ELSE COALESCE(NEW.wholesaler_notes, '')
            END,
            NEW.tracking_number,
            NEW.carrier_name,
            NEW.estimated_delivery
        );
        
        -- Update timestamps based on status
        IF NEW.status = 'processing' AND OLD.status != 'processing' THEN
            NEW.processing_started_at = now();
        ELSIF NEW.status = 'packed' AND OLD.status != 'packed' THEN
            NEW.packed_at = now();
        ELSIF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
            NEW.shipped_at = now();
        ELSIF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
            NEW.delivered_at = now();
        ELSIF NEW.status = 'returned' AND OLD.status != 'returned' THEN
            NEW.returned_at = now();
        END IF;
        
        NEW.last_status_update = now();
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for status tracking
DROP TRIGGER IF EXISTS track_order_status_changes_trigger ON public.orders;
CREATE TRIGGER track_order_status_changes_trigger
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.track_order_status_changes();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_last_status_update ON public.orders(last_status_update);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON public.orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);