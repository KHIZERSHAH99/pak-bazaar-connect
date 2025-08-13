-- Security Fix 1: Secure Product Views Data Access
-- Remove public access to product_views and restrict to shop owners only

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can insert product views" ON public.product_views;
DROP POLICY IF EXISTS "Users can view all product views" ON public.product_views;

-- Create secure policies for product_views
CREATE POLICY "Users can track product views" 
ON public.product_views 
FOR INSERT 
WITH CHECK (true); -- Allow tracking but restrict access

CREATE POLICY "Shop owners can view their product analytics" 
ON public.product_views 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.products p 
    JOIN public.shops s ON p.shop_id = s.id 
    WHERE p.id = product_views.product_id 
    AND s.owner_id = auth.uid()
  ) OR get_user_role() = 'admin'
);

-- Security Fix 2: Enhanced Audit Log Protection
-- Ensure only admins and users can access their own audit logs

-- Drop existing permissive policies if any
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;

-- Create secure audit log policies
CREATE POLICY "Users can view their own audit logs only" 
ON public.audit_logs 
FOR SELECT 
USING (
  (auth.uid() = user_id AND user_id IS NOT NULL) OR 
  get_user_role() = 'admin'
);

-- Security Fix 3: Create secure analytics function for product views
CREATE OR REPLACE FUNCTION public.get_product_analytics_secure(
  p_shop_id uuid,
  p_days_back integer DEFAULT 30
)
RETURNS TABLE(
  total_views bigint,
  unique_viewers bigint,
  daily_views jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  shop_owner_id uuid;
BEGIN
  -- Verify the caller owns the shop
  SELECT owner_id INTO shop_owner_id 
  FROM public.shops 
  WHERE id = p_shop_id;
  
  IF shop_owner_id != auth.uid() AND get_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Access denied: You can only view analytics for your own shops';
  END IF;
  
  -- Return aggregated analytics without exposing individual user data
  RETURN QUERY
  SELECT 
    COUNT(*) as total_views,
    COUNT(DISTINCT COALESCE(pv.user_id, pv.session_id)) as unique_viewers,
    jsonb_agg(
      jsonb_build_object(
        'date', date_trunc('day', pv.viewed_at)::date,
        'views', COUNT(*)
      ) ORDER BY date_trunc('day', pv.viewed_at)
    ) as daily_views
  FROM public.product_views pv
  JOIN public.products p ON pv.product_id = p.id
  WHERE p.shop_id = p_shop_id
    AND pv.viewed_at >= CURRENT_DATE - INTERVAL '1 day' * p_days_back
  GROUP BY date_trunc('day', pv.viewed_at);
END;
$$;

-- Security Fix 4: Data retention policy for product views
CREATE OR REPLACE FUNCTION public.cleanup_old_product_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Delete product views older than 90 days
  DELETE FROM public.product_views 
  WHERE viewed_at < NOW() - INTERVAL '90 days';
  
  -- Log the cleanup action
  INSERT INTO public.audit_logs (user_id, event_type, table_name, new_values)
  VALUES (
    NULL,
    'automated_cleanup',
    'product_views',
    jsonb_build_object(
      'action', 'deleted_old_views',
      'retention_days', 90,
      'cleanup_time', NOW()
    )
  );
END;
$$;

-- Security Fix 5: Enhanced security monitoring function
CREATE OR REPLACE FUNCTION public.detect_unusual_access_patterns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  suspicious_user RECORD;
BEGIN
  -- Detect users with excessive data queries in the last hour
  FOR suspicious_user IN
    SELECT 
      user_id,
      COUNT(*) as query_count
    FROM public.audit_logs
    WHERE event_type LIKE '%_access'
      AND created_at > NOW() - INTERVAL '1 hour'
      AND user_id IS NOT NULL
    GROUP BY user_id
    HAVING COUNT(*) > 100
  LOOP
    -- Log suspicious activity
    INSERT INTO public.audit_logs (user_id, event_type, table_name, new_values)
    VALUES (
      suspicious_user.user_id,
      'suspicious_access_pattern',
      'security_monitoring',
      jsonb_build_object(
        'query_count', suspicious_user.query_count,
        'time_window', '1 hour',
        'detected_at', NOW()
      )
    );
  END LOOP;
END;
$$;

-- Security Fix 6: Function to monitor excessive product views (potential scraping)
CREATE OR REPLACE FUNCTION public.monitor_product_view_patterns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  suspicious_activity RECORD;
BEGIN
  -- Detect excessive product views from same IP or user in short time
  FOR suspicious_activity IN
    SELECT 
      COALESCE(user_id::text, ip_address::text) as identifier,
      COUNT(*) as view_count,
      COUNT(DISTINCT product_id) as products_viewed
    FROM public.product_views
    WHERE viewed_at > NOW() - INTERVAL '10 minutes'
    GROUP BY COALESCE(user_id::text, ip_address::text)
    HAVING COUNT(*) > 50
  LOOP
    -- Log potential scraping activity
    INSERT INTO public.audit_logs (user_id, event_type, table_name, new_values)
    VALUES (
      CASE WHEN suspicious_activity.identifier ~ '^[0-9a-f-]{36}$' 
           THEN suspicious_activity.identifier::uuid 
           ELSE NULL END,
      'potential_scraping_detected',
      'product_views',
      jsonb_build_object(
        'identifier', suspicious_activity.identifier,
        'view_count', suspicious_activity.view_count,
        'products_viewed', suspicious_activity.products_viewed,
        'time_window', '10 minutes',
        'detected_at', NOW()
      )
    );
  END LOOP;
END;
$$;