-- Create conversations table for messaging system
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  product_id UUID,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  attachment TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pricing_tiers table
CREATE TABLE IF NOT EXISTS public.pricing_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  min_quantity INTEGER NOT NULL,
  max_quantity INTEGER,
  unit_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_quantity_range CHECK (
    min_quantity > 0 AND 
    (max_quantity IS NULL OR max_quantity >= min_quantity)
  )
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update their conversations"
ON public.conversations FOR UPDATE
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM public.conversations
    WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages in their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT id FROM public.conversations
    WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
  ) AND sender_id = auth.uid()
);

CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
USING (sender_id = auth.uid());

-- RLS Policies for pricing_tiers
CREATE POLICY "Anyone can view pricing tiers"
ON public.pricing_tiers FOR SELECT
USING (true);

CREATE POLICY "Wholesalers can manage their product pricing"
ON public.pricing_tiers FOR ALL
USING (
  product_id IN (
    SELECT p.id FROM public.products p
    JOIN public.shops s ON p.shop_id = s.id
    WHERE s.owner_id = auth.uid()
  )
);

-- RLS Policies for analytics_events
CREATE POLICY "Admins can view all analytics"
ON public.analytics_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can view their own analytics"
ON public.analytics_events FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can insert analytics events"
ON public.analytics_events FOR INSERT
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_conversations_buyer ON public.conversations(buyer_id);
CREATE INDEX idx_conversations_seller ON public.conversations(seller_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX idx_pricing_tiers_product ON public.pricing_tiers(product_id);
CREATE INDEX idx_analytics_events_user ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON public.analytics_events(created_at DESC);

-- Update delete_old_screenshots function to delete after 12 hours instead of 3 days
CREATE OR REPLACE FUNCTION public.delete_old_screenshots()
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  UPDATE public.orders 
  SET payment_screenshot = NULL,
      screenshot_uploaded_at = NULL
  WHERE screenshot_uploaded_at < NOW() - INTERVAL '12 hours'
    AND payment_screenshot IS NOT NULL;
END;
$$;

-- Update handle_order_completion to delete screenshots after 12 hours
CREATE OR REPLACE FUNCTION public.handle_order_completion()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- When order is marked as completed, set delivery time and schedule screenshot deletion
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.delivered_at = NOW();
    NEW.auto_delete_screenshot_at = NOW() + INTERVAL '12 hours';
    
    -- Create notification for buyer
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.buyer_id,
      'Order Delivered',
      'Your order has been marked as delivered. Thank you for your business!',
      'order_status'
    );
  END IF;
  
  RETURN NEW;
END;
$$;