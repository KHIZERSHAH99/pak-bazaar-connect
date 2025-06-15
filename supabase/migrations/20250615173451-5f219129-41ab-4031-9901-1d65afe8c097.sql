
-- 1. Enable RLS on main tables
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- 2. Create policies for shops
CREATE POLICY "Wholesaler can access their own shops"
  ON shops FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Wholesaler can insert shop"
  ON shops FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Wholesaler can update their own shops"
  ON shops FOR UPDATE USING (owner_id = auth.uid());

-- 3. Create policies for products
CREATE POLICY "Wholesaler can access their own products"
  ON products FOR SELECT USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));
CREATE POLICY "Wholesaler can insert products into their shop"
  ON products FOR INSERT WITH CHECK (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));
CREATE POLICY "Wholesaler can update their own products"
  ON products FOR UPDATE USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));

-- 4. Create policies for ads
CREATE POLICY "Wholesaler can access their own ads"
  ON ads FOR SELECT USING (wholesaler_id = auth.uid());
CREATE POLICY "Wholesaler can insert ad"
  ON ads FOR INSERT WITH CHECK (wholesaler_id = auth.uid());
CREATE POLICY "Wholesaler can update their own ads"
  ON ads FOR UPDATE USING (wholesaler_id = auth.uid());
-- (Admins will need a policy if we want them to update status. See below.)

-- 5. Orders: Sellers can see/place orders from other's shops
CREATE POLICY "Seller can order from others' shops only"
  ON orders FOR INSERT WITH CHECK (
      buyer_id = auth.uid()
      AND shop_id IN (SELECT id FROM shops WHERE owner_id <> auth.uid())
  );
CREATE POLICY "Sellers can see their own orders"
  ON orders FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Wholesalers can see orders for their shops"
  ON orders FOR SELECT USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));

-- 6. Role Requests: Only the user can create or view their request, only admin can approve
CREATE POLICY "User can create role requests for self"
  ON role_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "User can view their own requests"
  ON role_requests FOR SELECT USING (user_id = auth.uid());
-- For admin to approve:
CREATE POLICY "Admin can view/approve all role requests"
  ON role_requests FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can update all role requests"
  ON role_requests FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 7. Ads: Admin can update (approve) all ads
CREATE POLICY "Admin can view all ads"
  ON ads FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can update all ads"
  ON ads FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 8. Chat history: Private per user
CREATE POLICY "User can access their own chat history"
  ON chat_history FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User can insert their chat messages"
  ON chat_history FOR INSERT WITH CHECK (user_id = auth.uid());

-- 9. General: Allow admin full read for all business tables
CREATE POLICY "Admin can select all shops"
  ON shops FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can select all products"
  ON products FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can select all orders"
  ON orders FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
