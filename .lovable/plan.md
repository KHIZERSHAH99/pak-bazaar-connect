

## Warehouse Auto-Sync System (Steps 1, 2, 3, 5)

Skipping step 4 (Stock Movement Log Table) as requested.

### Step 1: Auto Stock Deduction (Database Trigger)

Create a PostgreSQL trigger on the `orders` table that fires when `status` changes to `confirmed`. It loops through `order_items` for that order and subtracts each item's `quantity` from the product's `stock_quantity`. If stock would go below zero, it sets to zero.

**Migration SQL:**
- Function `auto_deduct_stock_on_confirm()` — BEFORE UPDATE trigger on `orders`
- Checks `NEW.status = 'confirmed' AND OLD.status != 'confirmed'`
- Updates `products SET stock_quantity = GREATEST(0, stock_quantity - oi.quantity)` for each order item

### Step 2: Auto Stock Restore on Rejection/Return

Same trigger function extended to handle:
- `NEW.status IN ('rejected', 'cancelled', 'returned')` AND `OLD.status NOT IN ('rejected', 'cancelled', 'returned')`
- Restores stock by adding back `order_items.quantity` to each product's `stock_quantity`

Both triggers live in one function for simplicity.

### Step 3: Inventory Dashboard for Wholesalers

New page at `/dashboard/inventory` with:
- **Stats cards**: Total products, total stock units, out-of-stock count, low-stock count (threshold: 10)
- **Sortable product table**: Product name, shop, current stock, status badge (healthy/low/out-of-stock), quick "Restock" button
- **Search/filter**: Filter by shop, stock status

### Step 5: Quick Restock from Dashboard

A dialog component triggered from the inventory table's "Restock" button:
- Shows current stock quantity
- Input field for "Add stock" (number to add) or "Set stock to" (absolute value)
- Updates `products.stock_quantity` directly via Supabase

### Files to Create
- `src/pages/dashboard/DashboardInventory.tsx` — page wrapper
- `src/components/dashboard/InventoryDashboard.tsx` — main inventory view with stats + table
- `src/components/dashboard/RestockDialog.tsx` — quick restock modal

### Files to Modify
- `src/routes/AppRoutes.tsx` — add `/dashboard/inventory` route for wholesalers
- `src/components/dashboard/DashboardNavigation.tsx` — add "Inventory" nav item under Manage section (wholesaler) and Wholesaler View section (admin)

### Database Migration
One migration with:
1. `auto_handle_stock_on_order_status()` function (SECURITY DEFINER)
2. Trigger `trg_auto_stock_sync` on `orders` BEFORE UPDATE

