
-- Drop existing functions that may have different return types
DROP FUNCTION IF EXISTS cleanup_old_audit_logs();
DROP FUNCTION IF EXISTS cleanup_old_notifications();
DROP FUNCTION IF EXISTS cleanup_expired_sessions();
DROP FUNCTION IF EXISTS cleanup_old_analytics();
DROP FUNCTION IF EXISTS cleanup_old_chat_history();
DROP FUNCTION IF EXISTS cleanup_expired_screenshots();
DROP FUNCTION IF EXISTS cleanup_old_auth_attempts();
DROP FUNCTION IF EXISTS cleanup_stale_rate_limits();
DROP FUNCTION IF EXISTS cleanup_old_security_events();
DROP FUNCTION IF EXISTS run_all_cleanups();
DROP FUNCTION IF EXISTS get_storage_stats();

-- 1. Clean old notifications
CREATE FUNCTION cleanup_old_notifications()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE d integer;
BEGIN
  DELETE FROM notifications
  WHERE (read_at IS NOT NULL AND created_at < now() - interval '90 days')
     OR (read_at IS NULL AND created_at < now() - interval '180 days');
  GET DIAGNOSTICS d = ROW_COUNT;
  RETURN d;
END; $$;

-- 2. Clean expired sessions
CREATE FUNCTION cleanup_expired_sessions()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE d integer;
BEGIN
  DELETE FROM admin_sessions WHERE expires_at < now();
  GET DIAGNOSTICS d = ROW_COUNT;
  DELETE FROM csrf_tokens WHERE expires_at < now();
  DELETE FROM otp_rate_limits WHERE last_sent_at < now() - interval '24 hours';
  RETURN d;
END; $$;

-- 3. Clean old analytics (>60 days)
CREATE FUNCTION cleanup_old_analytics()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE d integer;
BEGIN
  DELETE FROM analytics_events WHERE created_at < now() - interval '60 days';
  GET DIAGNOSTICS d = ROW_COUNT;
  RETURN d;
END; $$;

-- 4. Clean old audit logs (>90 days)
CREATE FUNCTION cleanup_old_audit_logs()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE d integer;
BEGIN
  DELETE FROM audit_logs WHERE created_at < now() - interval '90 days';
  GET DIAGNOSTICS d = ROW_COUNT;
  RETURN d;
END; $$;

-- 5. Clean old chat history (>60 days)
CREATE FUNCTION cleanup_old_chat_history()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE d integer;
BEGIN
  DELETE FROM chat_history WHERE created_at < now() - interval '60 days';
  GET DIAGNOSTICS d = ROW_COUNT;
  RETURN d;
END; $$;

-- 6. Clean expired payment screenshots
CREATE FUNCTION cleanup_expired_screenshots()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE d integer;
BEGIN
  UPDATE orders SET payment_screenshot = NULL, auto_delete_screenshot_at = NULL
  WHERE auto_delete_screenshot_at IS NOT NULL AND auto_delete_screenshot_at < now();
  GET DIAGNOSTICS d = ROW_COUNT;
  RETURN d;
END; $$;

-- 7. Clean old auth attempts (>30 days)
CREATE FUNCTION cleanup_old_auth_attempts()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE d integer;
BEGIN
  DELETE FROM auth_attempts WHERE attempted_at < now() - interval '30 days';
  GET DIAGNOSTICS d = ROW_COUNT;
  RETURN d;
END; $$;

-- 8. Clean stale rate limits
CREATE FUNCTION cleanup_stale_rate_limits()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE d integer;
BEGIN
  DELETE FROM operation_rate_limits WHERE window_start < now() - interval '1 hour';
  GET DIAGNOSTICS d = ROW_COUNT;
  RETURN d;
END; $$;

-- 9. Clean old password security events (>60 days)
CREATE FUNCTION cleanup_old_security_events()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE d integer;
BEGIN
  DELETE FROM password_security_events WHERE created_at < now() - interval '60 days';
  GET DIAGNOSTICS d = ROW_COUNT;
  RETURN d;
END; $$;

-- Master cleanup
CREATE FUNCTION run_all_cleanups()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN jsonb_build_object(
    'notifications', cleanup_old_notifications(),
    'sessions', cleanup_expired_sessions(),
    'analytics', cleanup_old_analytics(),
    'audit_logs', cleanup_old_audit_logs(),
    'chat_history', cleanup_old_chat_history(),
    'screenshots', cleanup_expired_screenshots(),
    'auth_attempts', cleanup_old_auth_attempts(),
    'rate_limits', cleanup_stale_rate_limits(),
    'security_events', cleanup_old_security_events(),
    'cleaned_at', now()
  );
END; $$;

-- Storage stats for admin
CREATE FUNCTION get_storage_stats()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN jsonb_build_object(
    'total_products', (SELECT count(*) FROM products),
    'active_products', (SELECT count(*) FROM products WHERE is_active = true),
    'inactive_products', (SELECT count(*) FROM products WHERE is_active = false),
    'total_orders', (SELECT count(*) FROM orders),
    'total_profiles', (SELECT count(*) FROM profiles),
    'total_shops', (SELECT count(*) FROM shops),
    'total_notifications', (SELECT count(*) FROM notifications),
    'unread_notifications', (SELECT count(*) FROM notifications WHERE read_at IS NULL),
    'total_analytics_events', (SELECT count(*) FROM analytics_events),
    'total_audit_logs', (SELECT count(*) FROM audit_logs),
    'checked_at', now()
  );
END; $$;
