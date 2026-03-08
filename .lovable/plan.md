

# Combined Improvement Plan: Security Fixes + Order Management + Performance

## Part 1: Security Fixes (Critical — Do First)

### 1A. CRITICAL: Prevent role self-escalation on profiles table
**Problem**: Any user can `UPDATE profiles SET role = 'admin' WHERE id = auth.uid()` because the "Users can update own profile" policy has no column restriction.
**Fix**: Add a BEFORE UPDATE trigger that prevents non-admin users from changing their own `role` column.

### 1B. CRITICAL: Restrict payment_methods visibility
**Problem**: Policy "Authenticated users can view active payment methods" exposes bank accounts, JazzCash/Easypaisa numbers to ALL logged-in users.
**Fix**: Replace with a scoped policy — only buyers who have an order with that wholesaler can see their payment methods (via orders → shops join).

### 1C. WARN: Remove public read on tutorial_views
**Problem**: Anonymous users can enumerate user_id + watched_at data.
**Fix**: Drop the overly broad "Users can read views" policy. The existing "Users can view their own history" and "Admins can view all" policies are sufficient.

### 1D. WARN: Hide commission_rate from non-owners
**Problem**: All authenticated users see `commission_rate` on shops.
**Fix**: Create a database view `public_shops_view` excluding `commission_rate`, or add a function that returns only public fields. Alternatively, the simplest fix is to update the frontend queries to not select `commission_rate` and rely on RLS — but the real fix is a restricted policy or view.

**Implementation**: Single SQL migration for all 4 fixes.

---

## Part 2: Order Management Improvements

### 2A. Add status filter tabs to UnifiedOrderManagement
Currently no filtering — all orders shown in a flat grid. Add tab-based filtering: All | Pending | Confirmed | Shipped | Delivered | Rejected.

### 2B. Add search by order ID, buyer name, shop name
Add a search input above the order grid that filters client-side.

### 2C. Add real-time order notifications
Subscribe to Supabase realtime on the orders table so wholesalers see new orders instantly without refreshing.

### 2D. Add order status change confirmation dialog
Currently clicking "Accept" or "Reject" has no confirmation. Add a dialog with optional notes field before status changes.

**Files**: `src/components/orders/UnifiedOrderManagement.tsx`, `src/lib/orders/unified-queries.ts`

---

## Part 3: Performance Optimization

### 3A. Add pagination to order queries
Currently fetching 50-100 orders at once. Add cursor-based pagination (load 20 at a time with "Load More").

### 3B. Lazy load heavy dashboard components
Ensure analytics charts, tutorial grids, and messaging components use `React.lazy()` with Suspense boundaries.

### 3C. Add image lazy loading with blur placeholder
Use `loading="lazy"` consistently and add low-quality placeholder blur for product images.

**Files**: `src/components/orders/UnifiedOrderManagement.tsx`, `src/lib/orders/unified-queries.ts`, `src/App.tsx` (lazy imports)

---

## Implementation Order
1. Security migration (all 4 fixes in one migration)
2. Order management UI improvements
3. Performance optimizations

## Files to Create/Modify
- New migration SQL (security fixes)
- `src/components/orders/UnifiedOrderManagement.tsx` — filters, search, confirmation dialog, pagination, realtime
- `src/lib/orders/unified-queries.ts` — paginated queries, realtime subscription

