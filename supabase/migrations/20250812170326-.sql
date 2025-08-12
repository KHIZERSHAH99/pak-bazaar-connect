-- Fix Product Views Security Issues
-- Step 1: Drop existing permissive policies on product_views
DROP POLICY IF EXISTS "Anyone can insert product views" ON public.product_views;
DROP POLICY IF EXISTS "Users can view all product views" ON public.product_views;

-- Step 2: Create restrictive RLS policies for product_views
CREATE POLICY "Only authenticated users can track views"
ON public.product_views
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Shop owners can view their product analytics"
ON public.product_views
FOR SELECT
TO authenticated
USING (
  product_id IN (
    SELECT p.id FROM public.products p
    JOIN public.shops s ON p.shop_id = s.id
    WHERE s.owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all product analytics"
ON public.product_views
FOR SELECT
TO authenticated
USING (get_user_role() = 'admin');

-- Step 3: Create secure analytics function that protects individual user data
CREATE OR REPLACE FUNCTION public.get_secure_product_analytics(
  p_shop_ids uuid[],
  p_start_date date DEFAULT (CURRENT_DATE - '30 days'::interval)
)
RETURNS TABLE(
  total_views bigint,
  unique_viewers bigint,
  daily_stats jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Verify user has access to these shops
  IF NOT (
    get_user_role() = 'admin' OR 
    EXISTS (
      SELECT 1 FROM public.shops 
      WHERE id = ANY(p_shop_ids) AND owner_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Access denied to analytics for these shops';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(*) as total_views,
    COUNT(DISTINCT COALESCE(user_id, session_id)) as unique_viewers,
    jsonb_agg(
      jsonb_build_object(
        'date', date_trunc('day', pv.viewed_at),
        'views', COUNT(*)
      ) ORDER BY date_trunc('day', pv.viewed_at)
    ) as daily_stats
  FROM public.product_views pv
  JOIN public.products p ON pv.product_id = p.id
  WHERE p.shop_id = ANY(p_shop_ids)
    AND pv.viewed_at >= p_start_date;
END;
$$;

-- Step 4: Enhanced track_product_view function with privacy protection
CREATE OR REPLACE FUNCTION public.track_product_view(
  p_product_id uuid,
  p_session_id text DEFAULT NULL::text,
  p_user_agent text DEFAULT NULL::text,
  p_referrer text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Only insert essential data, hash sensitive information
  INSERT INTO public.product_views (
    product_id,
    user_id,
    session_id,
    user_agent,
    referrer,
    ip_address
  ) VALUES (
    p_product_id,
    auth.uid(),
    p_session_id,
    -- Hash user agent to protect privacy while maintaining analytics value
    CASE WHEN p_user_agent IS NOT NULL 
         THEN encode(digest(p_user_agent, 'sha256'), 'hex')
         ELSE NULL 
    END,
    -- Only store domain from referrer, not full URL
    CASE WHEN p_referrer IS NOT NULL 
         THEN split_part(p_referrer, '/', 3)
         ELSE NULL 
    END,
    NULL -- Remove IP address tracking for privacy
  );
END;
$$;

-- Step 5: Create data retention function to automatically clean old view records
CREATE OR REPLACE FUNCTION public.cleanup_old_product_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Delete product view records older than 90 days
  DELETE FROM public.product_views 
  WHERE viewed_at < NOW() - INTERVAL '90 days';
  
  -- Log cleanup activity
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    table_name,
    new_values
  ) VALUES (
    NULL,
    'data_retention_cleanup',
    'product_views',
    jsonb_build_object(
      'cleanup_date', NOW(),
      'retention_period', '90 days'
    )
  );
END;
$$;

-- Step 6: Add security monitoring for unusual access patterns
CREATE OR REPLACE FUNCTION public.monitor_analytics_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  recent_queries INTEGER;
BEGIN
  -- Check for excessive queries from same user (potential scraping)
  SELECT COUNT(*) INTO recent_queries
  FROM public.audit_logs
  WHERE user_id = auth.uid()
    AND event_type = 'analytics_access'
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Alert if user makes more than 50 analytics queries per hour
  IF recent_queries > 50 THEN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      table_name,
      new_values
    ) VALUES (
      auth.uid(),
      'suspicious_analytics_access',
      'product_views',
      jsonb_build_object(
        'queries_last_hour', recent_queries,
        'alert_level', 'high'
      )
    );
  END IF;
  
  -- Log normal analytics access
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    table_name,
    new_values
  ) VALUES (
    auth.uid(),
    'analytics_access',
    'product_views',
    jsonb_build_object(
      'accessed_at', NOW(),
      'function_called', TG_ARGV[0]
    )
  );
  
  RETURN NULL;
END;
$$;

-- Step 7: Create trigger to monitor analytics function calls
CREATE OR REPLACE TRIGGER monitor_product_analytics_access
  AFTER SELECT ON public.product_views
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.monitor_analytics_access('product_views_select');

-- Step 8: Update the original get_product_analytics function to use secure version
CREATE OR REPLACE FUNCTION public.get_product_analytics(
  p_shop_ids uuid[],
  p_start_date date DEFAULT (CURRENT_DATE - '30 days'::interval)
)
RETURNS TABLE(total_views bigint, unique_viewers bigint, views_by_day jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  result RECORD;
BEGIN
  -- Use the secure analytics function
  SELECT * INTO result FROM public.get_secure_product_analytics(p_shop_ids, p_start_date);
  
  RETURN QUERY
  SELECT 
    result.total_views,
    result.unique_viewers,
    result.daily_stats;
END;
$$;

-- Step 9: Create admin function to view system-wide analytics (aggregated only)
CREATE OR REPLACE FUNCTION public.get_system_analytics_summary()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Only allow admins to access system-wide analytics
  IF get_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  SELECT jsonb_build_object(
    'total_views_last_30_days', (
      SELECT COUNT(*) FROM public.product_views 
      WHERE viewed_at >= CURRENT_DATE - INTERVAL '30 days'
    ),
    'unique_viewers_last_30_days', (
      SELECT COUNT(DISTINCT COALESCE(user_id, session_id)) 
      FROM public.product_views 
      WHERE viewed_at >= CURRENT_DATE - INTERVAL '30 days'
    ),
    'top_viewed_categories', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'category', p.category,
          'views', COUNT(*)
        ) ORDER BY COUNT(*) DESC
      )
      FROM public.product_views pv
      JOIN public.products p ON pv.product_id = p.id
      WHERE pv.viewed_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY p.category
      LIMIT 5
    )
  ) INTO result;
  
  RETURN result;
END;
$$;