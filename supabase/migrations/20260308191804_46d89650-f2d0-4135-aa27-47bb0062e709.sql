
-- Fix mutable function search paths for functions that lack explicit search_path

-- update_shipping_config_timestamp
ALTER FUNCTION public.update_shipping_config_timestamp() SET search_path = '';

-- log_order_action
ALTER FUNCTION public.log_order_action() SET search_path = '';

-- log_commission_access (already has 'public', tighten to empty)
ALTER FUNCTION public.log_commission_access() SET search_path = '';

-- log_profile_changes (already has 'public', tighten to empty for consistency)  
-- Note: This function references public.log_audit_event so needs qualified refs
ALTER FUNCTION public.log_profile_changes() SET search_path = '';
