# Plan: Harden SECURITY DEFINER RPCs

## Context

37 `SECURITY DEFINER` functions in the `public` schema are currently `EXECUTE`-able by `anon`. These run with owner privileges, bypassing RLS — any bug or missing check inside one is a full RLS bypass. Goal: add explicit allowlists + strict input validation to every one, then verify edge cases.

## Approach

Bucket each RPC by required caller, then apply a standard hardening template per bucket. One migration per bucket (5 migrations) to keep blast radius small and reviewable.

### Bucket A — Must stay anon-callable (pre-auth flows)
Used during signup/login before a session exists.
- `authenticate_user_by_phone` (both overloads)
- `check_phone_exists`, `check_user_exists`, `email_is_taken`, `get_user_by_phone`, `get_available_phones`
- `generate_csrf_token`, `validate_csrf_token`
- `secure_check_rate_limit`, `check_rate_limit`

**Hardening:**
- Input validation: phone regex `^\+92[0-9]{10}$`, email regex + `length <= 255`, reject NULL/empty, cap all text inputs at 256 chars.
- Built-in rate limit by IP (uses `operation_rate_limits`) — e.g. 10 calls / 5 min per IP per function.
- Return generic responses (no enumeration of which field matched).
- `SET search_path = ''` on every function.

### Bucket B — Public read RPCs (intentionally anon)
Replace catalog/storefront queries.
- `get_active_products_list`, `get_public_shop_info`, `get_public_profile_info`, `get_profile_summary`, `get_safe_profile_summary`, `get_safe_profile_data`, `get_shop_contact`, `get_company_contact`, `get_payment_methods_secure`, `get_secure_payment_methods`, `get_order_details_secure`

**Hardening:**
- Validate UUID inputs are not NULL.
- Strip every sensitive column inside the function body (re-audit each SELECT list).
- For `get_*_payment_methods*` and `get_order_details_secure`: require `auth.uid() IS NOT NULL` and re-verify ownership/active-order link inside the function — remove `anon` from `EXECUTE` grant.
- For `get_company_contact` / `get_shop_contact`: rate-limit per IP to prevent scraping.

### Bucket C — Must be authenticated, not anon
Currently grant `anon` but logically require a session.
- `has_role`, `get_user_role`, `get_effective_user_role`
- `switch_business_role`
- `increment_coupon_usage`
- `track_product_view`, `secure_insert_analytics_event`
- `log_audit_event`, `log_security_event`, `secure_insert_audit_log`
- `mask_sensitive_data`
- `calculate_shipping_cost`, `get_product_analytics`

**Hardening:**
- `REVOKE EXECUTE ... FROM anon` (analytics/tracking RPCs keep anon only if guest tracking is required — confirm per-function in migration).
- Add `IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;` at top.
- For `switch_business_role`: allowlist target_role IN ('seller','wholesaler') only; never accept 'admin'.
- For `has_role` / `get_user_role`: lock callers to their own `auth.uid()` (no arbitrary `_user_id`) or admin.
- For `log_*` RPCs: ignore caller-supplied `p_user_id`, always use `auth.uid()`; cap JSON payload size (e.g. `octet_length(p_details::text) < 8192`).
- For `increment_coupon_usage`: verify caller owns the order applying the coupon.

### Bucket D — Admin / service-role only
- `run_all_cleanups`, `get_storage_stats`

**Hardening:**
- `REVOKE EXECUTE ... FROM anon, authenticated`
- Add `IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;` (skipped when caller is `service_role`).

### Bucket E — Already-restricted definer functions (47 others)
Functions only callable by `postgres`/`service_role` (triggers, cron, edge functions). Audit but defer broad changes — confirm none accidentally grant `anon` after the migrations above.

## Testing matrix

After each migration, re-test from three identities using the SQL editor + a small script using the anon key:

| Caller         | Expectation                                                                 |
|----------------|------------------------------------------------------------------------------|
| anon           | Bucket A: works with valid input, rate-limits, masks errors. B: read-only.   |
| authenticated  | Bucket C: works for own data. Cannot pass another user's `user_id`.          |
| different user | All RPCs reject cross-user access.                                           |
| admin          | Bucket D works.                                                               |
| malformed input| NULL/empty/oversized/non-UUID/SQL-quote inputs are rejected cleanly.          |

Edge cases to explicitly test:
- `switch_business_role('admin')` → must reject.
- `has_role(other_user_id, 'admin')` from authenticated → must reject or return false only for self.
- `log_audit_event(p_user_id => other_user_id, ...)` → must overwrite with `auth.uid()`.
- `get_payment_methods_secure(shop_id)` as anon → must reject (no active order context).
- `check_phone_exists('+92...')` called 100x → 11th call rate-limited.

## Deliverables

1. 5 migrations (one per bucket A–D, plus an audit-only migration locking down Bucket E grants).
2. A test script (`scripts/security/test-rpc-hardening.ts`) that exercises the matrix above with the anon key + a seeded test user, runnable locally and later wired into CI (item #1 of the parent task).
3. Updated `mem://security/hardened-rpc-functions` memory.

## Out of scope
- Migrating definer functions to `SECURITY INVOKER` (would break legitimate RLS-bypass use cases).
- CI integration (that is task #1, next).
- Postgres version upgrade & leaked-password protection (platform actions).

## Risk & rollback
- Each migration is additive (REVOKE + new validation). Rollback = re-grant + drop validation block.
- Highest-risk bucket: C — revoking anon from `has_role` could break unauthenticated code paths. Mitigation: search frontend for anon calls to these RPCs first; preserve any that are legitimately public by moving them to Bucket B with stricter input validation instead.
