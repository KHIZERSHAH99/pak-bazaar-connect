## Plan: Re-apply liked changes, auth UX fixes, and security hardening

### Part 1 — Re-apply the two reverted sections (kept from earlier)

Restore the two homepage sections shown in the screenshots: 

1. **"For Wholesalers / For Retailers / Trust Between Strangers"** trust card row (3 cards with checkmarks).
2. **Stats + 4 trust badges row** (3+ Products, Free Signup, 24/7 Support → Verified Wholesalers, Secure Transactions, 0% Platform Fee, Nationwide Delivery + "Trusted by electronics wholesalers in Karachi" pill).

Files: `src/pages/Index.tsx`, plus restore/touch-up `src/components/home/TrustSignalsSection.tsx` and `src/components/home/StatsDisplay.tsx` (or create lightweight equivalents if missing). Use semantic tokens, no hardcoded colors.

### Part 2 — Further high-impact UX improvements (small, low-risk)

Only if you approve. Suggested next polish (one section per round, not all at once):

- Sticky "Order on WhatsApp" floating button on product/shop pages (trust + familiarity).
- Urdu sub-labels under English nav items (already partly done; extend to dashboard).
- Bigger, single-color CTA on hero ("ابھی شروع کریں / Start Now") — remove duplicate CTAs.
- Verified-wholesaler badge on shop cards (we already have data).
- "How it works" 3-step strip (Browse → Order → Receive) — Urdu icons, no paragraphs.

Pick which ones; do NOT mass-apply.

### Part 3 — Authentication fixes

**A. Email verification redirect**

- Confirm `emailRedirectTo: ${window.location.origin}/` is set on `supabase.auth.signUp` in `useEnhancedSignupForm.tsx` and any other signup paths.
- Add `/auth/callback` route that handles `?code=` exchange and redirects to `/dashboard` with a success toast. Today the link likely lands on `/` with a hash and confuses users.
- Update Supabase Auth → URL Configuration: Site URL = `https://pakm.lovable.app`, Redirect URLs include preview + custom domain. (User action — I'll list exact URLs.) (Our own custom damain is [https://pakbazaarconnect.store](https://pakm.lovable.app)) or you can do something so when we change our domain in future the redirect change itself if possible

**B. "Email already registered" handling (without enumeration leak)**  
Current behavior: Supabase returns generic "check your email" even when the email is already used → user thinks signup worked.

Fix safely:

- For **phone-based signup** (our primary flow): we already check phone uniqueness via RPC. Add the same explicit check for **email** before calling `signUp`, using a SECURITY DEFINER RPC `email_is_taken(_email)` that returns a **rate-limited boolean** (max 5 calls / IP / minute, logs attempts). This prevents mass enumeration while letting the legitimate signup form show: *"This email is already registered. Try logging in or reset your password."*
- If rate limit hit → fall back to generic message.
- Never reveal existence on the password-reset endpoint (keep generic).

**C. Better auth error messages**  
`src/lib/auth/auth-errors.ts` already has a parser. Improvements:

- Add explicit handling for `over_email_send_rate_limit`, `email_address_invalid`, `signup_disabled`.
- Show inline field errors (red text under input) in addition to toast — currently toast-only on some forms.
- Distinguish "wrong password" vs "no account" only when safe (use generic for login to prevent enumeration; use specific only on signup after rate-limited existence check).

### Part 4 — Security findings (verified & action plan)

I reviewed each finding against current schema/policies. Verdict + fix:


| #   | Finding                                                  | Legit?                          | Fix                                                                                                                                                                                                                                                                                                                                       |
| --- | -------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `payment_methods` plaintext columns exposed to buyers    | **YES, critical**               | Create view `payment_methods_buyer_safe` exposing only masked fields + bank_name + account_title. Replace buyer SELECT policy to deny direct table reads; update `src/lib/orders/payments.ts` to query the view. Plaintext columns kept only for wholesaler-self access.                                                                  |
| 2   | `profiles` role self-escalation via OR'd UPDATE policies | **YES, critical**               | Drop both UPDATE policies; create one policy `profiles_self_update_no_role` with WITH CHECK that asserts `role = (SELECT role FROM profiles WHERE id = auth.uid())`. Also our existing trigger `prevent_role_self_escalation` is a backstop — keep it.                                                                                    |
| 3   | `company_profiles` phone/whatsapp public                 | **YES, warn**                   | Create view `company_profiles_public_safe` (omits phone, whatsapp). Public SELECT policy on table → require authenticated for full row; anon reads via view only.                                                                                                                                                                         |
| 4   | `profiles` exposes OTP + CNIC to row owner               | **YES, error**                  | Move OTP fields (`otp_code`, `otp_expires_at`, `otp_attempts`, `verification_otp`) to new `profile_otps` table with RLS denying SELECT to all (only SECURITY DEFINER functions can read). Create view `profiles_self_safe` for client reads excluding OTP + image URLs. Update `useEnhancedSignupForm`, OTP verify RPCs to use new table. |
| 5   | Shop `contact` exposed to all authenticated              | warn                            | Add `shops_public_safe` view without `contact`; restrict table to owner + admin. Buyers see contact only after placing an order (existing pattern from payment_methods).                                                                                                                                                                  |
| 6   | `operation_rate_limits` policy = false                   | warn, but **app-breaking risk** | Rate-limit code must run via SECURITY DEFINER RPC. Audit `src/lib/security/rate-limiter.ts` — if it inserts directly, switch to `rpc('record_rate_limit_hit', …)`.                                                                                                                                                                        |
| 7   | Storage policy `payment_screenshot = s.name` typo        | YES                             | Fix migration: `o.payment_screenshot = objects.name`.                                                                                                                                                                                                                                                                                     |
| 8   | Public bucket allows listing                             | warn                            | Make `ad-images`, `shop-logos`, `product-images` buckets non-listable (drop broad SELECT, replace with `bucket_id = ... AND name = storage.objects.name` per-object reads).                                                                                                                                                               |
| 9   | SECURITY DEFINER functions executable by anon/auth       | warn                            | Audit all our RPCs; `REVOKE EXECUTE ... FROM anon, authenticated` on internal-only ones (`record_rate_limit_hit`, OTP writers, audit loggers); keep only intentional public RPCs (`email_is_taken`, `phone_is_taken`).                                                                                                                    |
| 10  | Leaked password protection disabled                      | warn                            | Enable in Supabase dashboard (user toggle).                                                                                                                                                                                                                                                                                               |
| 11  | Postgres version has security patches                    | warn                            | User upgrades from Supabase dashboard.                                                                                                                                                                                                                                                                                                    |


### Part 5 — Comprehensive hack-vector review

Beyond the findings above, I'll add checks/protections for:

- **XSS**: audit all `dangerouslySetInnerHTML` (currently zero — good); confirm sanitizer used in chatbot responses.
- **CSRF**: edge functions verify Origin/Referer; add to `chatbot`, `notifications`, `database-cleanup`.
- **SSRF**: any URL fetched server-side (image proxy?) — none found, but add allow-list helper for future.
- **IDOR**: re-test that order/shop/product IDs in URLs are RLS-protected (they are; will add automated test seed).
- **Open redirect**: check post-login redirect param is same-origin only.
- **Session fixation**: confirm `supabase.auth` rotates tokens (default yes).
- **Brute force**: extend `auth_attempts` rate limiting to 5/min/IP on login + signup.
- **File upload**: confirm `file-validation.ts` enforces MIME + size + magic bytes for screenshots/logos.
- **Storage bucket enumeration**: covered in #8.
- **JWT leakage**: confirm anon key only in client (it's fine — RLS does the work). No service_role anywhere in `src/`.
- **Logging**: ensure no PII / passwords / OTPs logged to console in production builds.
- **Dependency vulns**: run `dependency_scan` after.

### Migrations summary (one combined migration per area)

1. `payment_methods_buyer_safe` view + policy swap.
2. `profiles` role-immutable UPDATE policy rewrite.
3. `profile_otps` table + view `profiles_self_safe` + data move.
4. `shops_public_safe`, `company_profiles_public_safe` views + policy swaps.
5. Storage policy typo fix + bucket listing restrictions.
6. REVOKE EXECUTE on internal SECURITY DEFINER functions.
7. New RPC `email_is_taken` (rate-limited).

### Execution order I propose

1. **Part 1** (re-apply liked sections) — 5 min, zero risk.
2. **Part 4** security migrations — biggest user-protection win, do in 2 batched migrations with my review of each policy before apply.
3. **Part 3** auth UX (callback route + email-exists RPC + better errors).
4. **Part 5** remaining hardening (storage, REVOKE, edge function origin checks).
5. **Part 2** UX polish — last, after you pick which ones.

Reply with: **"go"** to start with steps 1 → 4 in order, or list which steps to skip/reorder.