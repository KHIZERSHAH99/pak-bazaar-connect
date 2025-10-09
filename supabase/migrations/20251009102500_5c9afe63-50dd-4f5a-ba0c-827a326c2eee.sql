-- Create shipping configuration table for wholesalers
CREATE TABLE IF NOT EXISTS public.shipping_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  
  -- Shipping method type
  shipping_method TEXT NOT NULL DEFAULT 'flat_rate' CHECK (shipping_method IN ('flat_rate', 'weight_based', 'city_based', 'free_above_amount', 'custom')),
  
  -- Flat rate shipping
  flat_rate_cost NUMERIC,
  
  -- Free shipping threshold
  free_shipping_above NUMERIC,
  
  -- Weight-based rates (per kg)
  base_weight_rate NUMERIC,
  additional_weight_rate NUMERIC,
  max_free_weight NUMERIC,
  
  -- City-based rates (JSON: {"Karachi": 150, "Lahore": 200})
  city_rates JSONB,
  
  -- Custom rates for different cities/regions
  custom_rates JSONB,
  
  -- General settings
  is_active BOOLEAN DEFAULT true,
  estimated_delivery_days INTEGER DEFAULT 3,
  
  -- Express shipping option
  express_shipping_available BOOLEAN DEFAULT false,
  express_shipping_cost NUMERIC,
  express_delivery_days INTEGER DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.shipping_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shipping_configs
CREATE POLICY "Anyone can view active shipping configs"
  ON public.shipping_configs
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Shop owners manage their shipping configs"
  ON public.shipping_configs
  FOR ALL
  USING (
    shop_id IN (
      SELECT id FROM public.shops WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    shop_id IN (
      SELECT id FROM public.shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all shipping configs"
  ON public.shipping_configs
  FOR ALL
  USING (get_user_role() = 'admin');

-- Create index for better performance
CREATE INDEX idx_shipping_configs_shop_id ON public.shipping_configs(shop_id);
CREATE INDEX idx_shipping_configs_active ON public.shipping_configs(is_active);

-- Create function to calculate shipping cost
CREATE OR REPLACE FUNCTION public.calculate_shipping_cost(
  p_shop_id UUID,
  p_order_amount NUMERIC,
  p_buyer_city TEXT DEFAULT NULL,
  p_total_weight NUMERIC DEFAULT 0,
  p_is_express BOOLEAN DEFAULT false
) RETURNS JSONB AS $$
DECLARE
  config RECORD;
  shipping_cost NUMERIC := 0;
  delivery_days INTEGER := 3;
  method TEXT;
BEGIN
  -- Get active shipping config for shop
  SELECT * INTO config
  FROM public.shipping_configs
  WHERE shop_id = p_shop_id
    AND is_active = true
  LIMIT 1;
  
  -- If no config found, return default
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'cost', 150,
      'method', 'default',
      'delivery_days', 3,
      'message', 'Standard shipping'
    );
  END IF;
  
  -- Handle express shipping
  IF p_is_express AND config.express_shipping_available THEN
    RETURN jsonb_build_object(
      'cost', COALESCE(config.express_shipping_cost, 300),
      'method', 'express',
      'delivery_days', COALESCE(config.express_delivery_days, 1),
      'message', 'Express delivery'
    );
  END IF;
  
  -- Check free shipping threshold
  IF config.free_shipping_above IS NOT NULL AND p_order_amount >= config.free_shipping_above THEN
    RETURN jsonb_build_object(
      'cost', 0,
      'method', 'free',
      'delivery_days', config.estimated_delivery_days,
      'message', 'FREE SHIPPING! (Order above Rs. ' || config.free_shipping_above || ')'
    );
  END IF;
  
  -- Calculate based on method
  CASE config.shipping_method
    WHEN 'flat_rate' THEN
      shipping_cost := COALESCE(config.flat_rate_cost, 150);
      method := 'flat_rate';
      
    WHEN 'weight_based' THEN
      IF p_total_weight > 0 THEN
        shipping_cost := COALESCE(config.base_weight_rate, 50) + 
                        (p_total_weight * COALESCE(config.additional_weight_rate, 20));
      ELSE
        shipping_cost := COALESCE(config.flat_rate_cost, 150);
      END IF;
      method := 'weight_based';
      
    WHEN 'city_based' THEN
      IF p_buyer_city IS NOT NULL AND config.city_rates IS NOT NULL THEN
        shipping_cost := COALESCE(
          (config.city_rates->p_buyer_city)::NUMERIC,
          COALESCE(config.flat_rate_cost, 150)
        );
      ELSE
        shipping_cost := COALESCE(config.flat_rate_cost, 150);
      END IF;
      method := 'city_based';
      
    WHEN 'custom' THEN
      -- Use custom rates from JSONB
      shipping_cost := COALESCE(config.flat_rate_cost, 150);
      method := 'custom';
      
    ELSE
      shipping_cost := COALESCE(config.flat_rate_cost, 150);
      method := 'flat_rate';
  END CASE;
  
  RETURN jsonb_build_object(
    'cost', shipping_cost,
    'method', method,
    'delivery_days', config.estimated_delivery_days,
    'message', 'Shipping via ' || method
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_shipping_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shipping_configs_updated_at
  BEFORE UPDATE ON public.shipping_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_shipping_config_timestamp();