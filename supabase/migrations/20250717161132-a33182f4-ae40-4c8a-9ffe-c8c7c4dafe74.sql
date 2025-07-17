-- Fix function search path security issues
-- All functions should have SET search_path to prevent SQL injection

-- Update get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

-- Update increment_coupon_usage function
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  UPDATE public.coupons 
  SET used_count = used_count + 1 
  WHERE id = coupon_id;
END;
$function$;

-- Update delete_old_screenshots function
CREATE OR REPLACE FUNCTION public.delete_old_screenshots()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  UPDATE public.orders 
  SET payment_screenshot = NULL,
      screenshot_uploaded_at = NULL
  WHERE screenshot_uploaded_at < NOW() - INTERVAL '3 days'
    AND payment_screenshot IS NOT NULL;
END;
$function$;

-- Update get_wholesaler_monthly_sales function
CREATE OR REPLACE FUNCTION public.get_wholesaler_monthly_sales(wholesaler_uuid uuid, target_month date DEFAULT CURRENT_DATE)
 RETURNS TABLE(total_orders bigint, total_sales numeric, pending_commission numeric, paid_commission numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_sales,
    COALESCE(SUM(CASE WHEN cr.status = 'pending' THEN cr.commission_amount ELSE 0 END), 0) as pending_commission,
    COALESCE(SUM(CASE WHEN cr.status = 'paid' THEN cr.commission_amount ELSE 0 END), 0) as paid_commission
  FROM public.orders o
  JOIN public.shops s ON o.shop_id = s.id
  LEFT JOIN public.commission_records cr ON o.id = cr.order_id
  WHERE s.owner_id = wholesaler_uuid
    AND DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', target_month)
    AND o.status IN ('confirmed', 'completed');
END;
$function$;

-- Update create_commission_record function
CREATE OR REPLACE FUNCTION public.create_commission_record()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    INSERT INTO public.commission_records (
      wholesaler_id,
      order_id,
      sale_amount,
      commission_amount
    )
    SELECT 
      s.owner_id,
      NEW.id,
      NEW.total_amount,
      NEW.total_amount * 0.05
    FROM public.shops s
    WHERE s.id = NEW.shop_id
    ON CONFLICT (order_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update log_order_action function
CREATE OR REPLACE FUNCTION public.log_order_action()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  action_type TEXT;
  actor_id UUID;
BEGIN
  -- Determine action type and actor
  IF TG_OP = 'INSERT' THEN
    action_type := 'created';
    actor_id := NEW.buyer_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
      action_type := 'confirmed';
      -- Get wholesaler ID from shop
      SELECT s.owner_id INTO actor_id FROM public.shops s WHERE s.id = NEW.shop_id;
    ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
      action_type := 'rejected';
      -- Get wholesaler ID from shop
      SELECT s.owner_id INTO actor_id FROM public.shops s WHERE s.id = NEW.shop_id;
    ELSIF NEW.status = 'completed' AND OLD.status != 'completed' THEN
      action_type := 'completed';
      actor_id := NEW.buyer_id;
    END IF;
  END IF;

  -- Log the action if we have a valid action type
  IF action_type IS NOT NULL AND actor_id IS NOT NULL THEN
    INSERT INTO public.order_actions (order_id, user_id, action, notes)
    VALUES (
      COALESCE(NEW.id, OLD.id),
      actor_id,
      action_type,
      COALESCE(NEW.wholesaler_notes, '')
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update switch_business_role function
CREATE OR REPLACE FUNCTION public.switch_business_role(target_role text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  current_user_id UUID;
  current_role TEXT;
  result JSONB;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get current role
  SELECT role INTO current_role FROM public.profiles WHERE id = current_user_id;
  
  -- Validate target role
  IF target_role NOT IN ('seller', 'wholesaler') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid target role');
  END IF;
  
  -- Check if user can switch roles
  IF current_role NOT IN ('seller', 'wholesaler') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Role switching not available for your account type');
  END IF;
  
  -- Check if trying to switch to same role
  IF current_role = target_role THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already in target role');
  END IF;
  
  -- Perform the role switch
  UPDATE public.profiles 
  SET 
    role = target_role,
    last_role_switch = now(),
    role_switch_count = COALESCE(role_switch_count, 0) + 1
  WHERE id = current_user_id;
  
  -- Record the switch in history
  INSERT INTO public.role_switch_history (user_id, from_role, to_role, requires_approval, notes)
  VALUES (current_user_id, current_role, target_role, false, 'Direct business role switch');
  
  RETURN jsonb_build_object('success', true, 'message', 'Role switched successfully');
END;
$function$;

-- Update get_product_analytics function
CREATE OR REPLACE FUNCTION public.get_product_analytics(p_shop_ids uuid[], p_start_date date DEFAULT (CURRENT_DATE - '30 days'::interval))
 RETURNS TABLE(total_views bigint, unique_viewers bigint, views_by_day jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
  FROM public.product_views pv
  JOIN public.products p ON pv.product_id = p.id
  WHERE p.shop_id = ANY(p_shop_ids)
    AND pv.viewed_at >= p_start_date;
END;
$function$;

-- Update track_product_view function
CREATE OR REPLACE FUNCTION public.track_product_view(p_product_id uuid, p_session_id text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text, p_referrer text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Update add_order_tracking function
CREATE OR REPLACE FUNCTION public.add_order_tracking(p_order_id uuid, p_status text, p_notes text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Update auto_track_order_changes function
CREATE OR REPLACE FUNCTION public.auto_track_order_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
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
        (SELECT owner_id FROM public.shops WHERE id = NEW.shop_id),
        NEW.buyer_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update delete_old_payment_screenshots function
CREATE OR REPLACE FUNCTION public.delete_old_payment_screenshots()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Delete screenshots from orders older than 3 days that are completed
  DELETE FROM storage.objects
  WHERE bucket_id = 'payment-screenshots'
  AND created_at < NOW() - INTERVAL '3 days'
  AND name IN (
    SELECT payment_screenshot 
    FROM public.orders 
    WHERE payment_screenshot IS NOT NULL 
    AND (status = 'completed' OR created_at < NOW() - INTERVAL '3 days')
  );
  
  -- Clear screenshot references from orders table
  UPDATE public.orders 
  SET payment_screenshot = NULL
  WHERE payment_screenshot IS NOT NULL 
  AND (status = 'completed' OR created_at < NOW() - INTERVAL '3 days');
END;
$function$;

-- Update log_audit_event function
CREATE OR REPLACE FUNCTION public.log_audit_event(p_user_id uuid, p_event_type text, p_table_name text DEFAULT NULL::text, p_record_id text DEFAULT NULL::text, p_old_values text DEFAULT NULL::text, p_new_values text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    table_name,
    record_id,
    old_values,
    new_values,
    user_agent
  ) VALUES (
    p_user_id,
    p_event_type,
    p_table_name,
    CASE WHEN p_record_id IS NOT NULL THEN p_record_id::UUID ELSE NULL END,
    CASE WHEN p_old_values IS NOT NULL THEN p_old_values::JSONB ELSE NULL END,
    CASE WHEN p_new_values IS NOT NULL THEN p_new_values::JSONB ELSE NULL END,
    p_user_agent
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the operation
    RAISE WARNING 'Failed to log audit event: %', SQLERRM;
END;
$function$;

-- Update log_profile_changes function
CREATE OR REPLACE FUNCTION public.log_profile_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Log role changes
  IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    PERFORM public.log_audit_event(
      NEW.id,
      'role_changed',
      'profiles',
      NEW.id::TEXT,
      jsonb_build_object('role', OLD.role),
      jsonb_build_object('role', NEW.role)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update calculate_monthly_commissions function
CREATE OR REPLACE FUNCTION public.calculate_monthly_commissions(target_month date DEFAULT date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone))
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  wholesaler_record RECORD;
  commission_rate DECIMAL(5,2);
BEGIN
  -- Get current commission rate
  SELECT commission_percentage INTO commission_rate 
  FROM public.commission_settings 
  WHERE effective_from <= target_month 
  ORDER BY effective_from DESC 
  LIMIT 1;
  
  IF commission_rate IS NULL THEN
    commission_rate := 5.0; -- Default 5%
  END IF;

  -- Calculate for each wholesaler
  FOR wholesaler_record IN 
    SELECT 
      s.owner_id as wholesaler_id,
      COALESCE(SUM(o.total_amount), 0) as total_sales
    FROM public.shops s
    LEFT JOIN public.orders o ON s.id = o.shop_id 
      AND o.status = 'completed'
      AND DATE_TRUNC('month', o.created_at) = target_month
    WHERE EXISTS (SELECT 1 FROM public.profiles WHERE id = s.owner_id AND role = 'wholesaler')
    GROUP BY s.owner_id
  LOOP
    INSERT INTO public.monthly_commissions (
      wholesaler_id,
      month,
      total_sales,
      commission_amount,
      commission_percentage,
      due_date
    ) VALUES (
      wholesaler_record.wholesaler_id,
      target_month,
      wholesaler_record.total_sales,
      wholesaler_record.total_sales * (commission_rate / 100),
      commission_rate,
      target_month + INTERVAL '1 month' + INTERVAL '15 days'
    )
    ON CONFLICT (wholesaler_id, month) 
    DO UPDATE SET
      total_sales = EXCLUDED.total_sales,
      commission_amount = EXCLUDED.commission_amount,
      commission_percentage = EXCLUDED.commission_percentage;
  END LOOP;
END;
$function$;

-- Update suspend_overdue_accounts function
CREATE OR REPLACE FUNCTION public.suspend_overdue_accounts()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Suspend accounts with overdue commissions
  UPDATE public.profiles 
  SET 
    is_suspended = true,
    suspended_until = NULL, -- Indefinite suspension
    suspension_type = 'commission',
    suspension_reason = 'Overdue commission payment'
  WHERE id IN (
    SELECT wholesaler_id 
    FROM public.monthly_commissions 
    WHERE payment_status = 'unpaid' 
    AND due_date < CURRENT_DATE
  ) AND is_suspended = false;
  
  -- Update commission status to overdue
  UPDATE public.monthly_commissions 
  SET payment_status = 'overdue'
  WHERE payment_status = 'unpaid' 
  AND due_date < CURRENT_DATE;
END;
$function$;

-- Update delete_completed_order_screenshots function
CREATE OR REPLACE FUNCTION public.delete_completed_order_screenshots()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Delete screenshots from completed orders
  DELETE FROM storage.objects
  WHERE bucket_id = 'payment-screenshots'
  AND name IN (
    SELECT payment_screenshot 
    FROM public.orders 
    WHERE payment_screenshot IS NOT NULL 
    AND status = 'completed'
    AND delivered_at < NOW() - INTERVAL '1 day'
  );
  
  -- Clear screenshot references
  UPDATE public.orders 
  SET payment_screenshot = NULL
  WHERE payment_screenshot IS NOT NULL 
  AND status = 'completed'
  AND delivered_at < NOW() - INTERVAL '1 day';
END;
$function$;

-- Update handle_order_completion function
CREATE OR REPLACE FUNCTION public.handle_order_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- When order is marked as completed, set delivery time and schedule screenshot deletion
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.delivered_at = NOW();
    NEW.auto_delete_screenshot_at = NOW() + INTERVAL '24 hours';
    
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
$function$;

-- Update create_commission_on_completion function
CREATE OR REPLACE FUNCTION public.create_commission_on_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Only create commission when order moves to completed status
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.commission_transactions (
      wholesaler_id,
      order_id,
      commission_rate,
      commission_amount,
      order_amount
    )
    SELECT 
      s.owner_id,
      NEW.id,
      COALESCE(cs.commission_percentage, 5.0),
      NEW.total_amount * (COALESCE(cs.commission_percentage, 5.0) / 100),
      NEW.total_amount
    FROM public.shops s
    LEFT JOIN public.commission_settings cs ON cs.effective_from <= CURRENT_DATE
    WHERE s.id = NEW.shop_id
    ORDER BY cs.effective_from DESC
    LIMIT 1
    ON CONFLICT (order_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update enhanced_audit_trigger function
CREATE OR REPLACE FUNCTION public.enhanced_audit_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Log important changes
  IF TG_OP = 'UPDATE' THEN
    -- Log role changes
    IF TG_TABLE_NAME = 'profiles' AND OLD.role IS DISTINCT FROM NEW.role THEN
      PERFORM public.log_audit_event(
        NEW.id,
        'role_changed',
        TG_TABLE_NAME,
        NEW.id::TEXT,
        jsonb_build_object('old_role', OLD.role),
        jsonb_build_object('new_role', NEW.role)
      );
    END IF;
    
    -- Log order status changes
    IF TG_TABLE_NAME = 'orders' AND OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM public.log_audit_event(
        auth.uid(),
        'order_status_changed',
        TG_TABLE_NAME,
        NEW.id::TEXT,
        jsonb_build_object('old_status', OLD.status),
        jsonb_build_object('new_status', NEW.status, 'order_id', NEW.id)
      );
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$function$;