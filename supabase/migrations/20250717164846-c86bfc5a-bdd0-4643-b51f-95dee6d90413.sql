
-- Create indexes for frequently queried columns to improve performance

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON public.products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_verification_status ON public.products(verification_status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_active_approved ON public.products(is_active, verification_status) WHERE is_active = true AND verification_status = 'approved';

-- Shops table indexes
CREATE INDEX IF NOT EXISTS idx_shops_owner_id ON public.shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_city_id ON public.shops(city_id);
CREATE INDEX IF NOT EXISTS idx_shops_created_at ON public.shops(created_at DESC);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON public.orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_status ON public.orders(buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_shop_status ON public.orders(shop_id, status);

-- Ads table indexes
CREATE INDEX IF NOT EXISTS idx_ads_wholesaler_id ON public.ads(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_ads_status ON public.ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON public.ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_status_created ON public.ads(status, created_at DESC) WHERE status = 'approved';

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON public.profiles(verification_status);

-- Commission related indexes
CREATE INDEX IF NOT EXISTS idx_commission_records_wholesaler_id ON public.commission_records(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_commission_records_order_id ON public.commission_records(order_id);
CREATE INDEX IF NOT EXISTS idx_commission_records_status ON public.commission_records(status);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_wholesaler_id ON public.commission_transactions(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_order_id ON public.commission_transactions(order_id);

-- Chat and messaging indexes
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_order_messages_order_id ON public.order_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_order_messages_sender_id ON public.order_messages(sender_id);

-- Role requests indexes
CREATE INDEX IF NOT EXISTS idx_role_requests_user_id ON public.role_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_role_requests_status ON public.role_requests(status);

-- Product views analytics index
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON public.product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_viewed_at ON public.product_views(viewed_at DESC);

-- Inquiries indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_buyer_id ON public.inquiries(buyer_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_seller_id ON public.inquiries(seller_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_shop_active ON public.products(shop_id, is_active, verification_status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_created ON public.orders(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_shop_created ON public.orders(shop_id, created_at DESC);
