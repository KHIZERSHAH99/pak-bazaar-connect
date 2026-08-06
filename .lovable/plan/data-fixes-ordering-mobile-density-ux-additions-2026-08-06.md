# Data Fixes, Ordering, Mobile Density, UX Additions

## What I verified first

- `audit_logs` **does exist** (95 rows) — the errors are not a missing table. The real cause: `audit_logs`, `product_pricing_tiers` and `pricing_tiers` have **no table privileges granted** to `anon`/`authenticated`. Without those grants the database rejects the request regardless of the access rules already written. That single gap explains both the errors during product delete + restock and the missing bulk-discount tiers on product pages.
- There are **two** tier tables: `product_pricing_tiers` (6 rows, the one the app reads and writes) and `pricing_tiers` (0 rows, unused legacy).
- The quantity input on the product page (`OptimizedProductDetail.tsx`) has `min={moq}` plus an onChange that snaps any lower value back to MOQ and fires a toast — that is what makes typing feel blocked mid-entry.

## Phase 1 — Database access fixes (one migration)

- Grant the missing privileges: tier read access for buyers and visitors, full manage access for product owners, admin read on the audit log — matching the access rules already in place.
- Tighten the tier read rule so tiers only appear for products that are both active and approved (today it only checks active).
- Drop the unused empty `pricing_tiers` table so there is one source of truth.

## Phase 2 — Product ordering & quantity controls

- Rework the quantity field so typing is never interrupted: keep the raw typed value in state, clamp to MOQ/stock only on blur or before ordering, no toast while typing.
- Add large, reliable minus / plus stepper buttons (48px targets) that step by MOQ and respect stock; hide the browser's tiny native number arrows.
- Show the active tier price live as quantity changes with a short "bulk discount applied" hint, and pass the tier unit price (not the base price) into the order total.

## Phase 3 — Density & mobile pass

Product cards and product detail:
- Reduce section padding (`py-8`/`p-6` → `py-4`/`p-3`) and stack spacing (`space-y-6/8` → `space-y-3/4`).
- Clamp descriptions to 2 lines on cards and 3 lines on detail with a "read more" toggle — this fixes the runaway card in your screenshot.
- Cap card image height to one compact consistent ratio (~h-48 on mobile) so cards in a row match.
- Put price, MOQ and category badges on a single horizontal row instead of stacked.
- Equalise card heights in the grid so one long description no longer stretches a column.

Dashboard and buttons:
- Scale oversized mobile buttons and action tiles to app-standard sizes while keeping the 48px minimum tap height.

Performance:
- Paginate product and order lists, lazy-load images below the fold, trim over-wide list queries.

## Phase 4 — UX additions

- Confirmation dialog before a buyer hides/removes a past order.
- Admin order activity log: status-change history showing who acted and when, from the existing audit log.
- Pagination plus status filters on `/dashboard/seller-orders`.
- Per-product stock history timeline (manual restocks and auto-sync movements with timestamps and quantities) reusing existing stock movement data.

## Technical notes

- One migration total: grants, the tier rule tightening, and the legacy table drop. Phase 4 needs no schema change — `audit_logs` and `stock_movements` already hold the needed fields.
- All new UI uses semantic tokens only; no hardcoded colors.
- Tier-aware unit price becomes the single source for totals in both the product page and `EnhancedOrderForm`.

Approve to start with Phases 1 and 2 (the actual bugs), then I'll continue into 3 and 4.