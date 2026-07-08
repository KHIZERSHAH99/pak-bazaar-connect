## Goals
1. Build a `/why-pakmandi` landing page with the pitch content.
2. Fix 3 security findings.

## 1. `/why-pakmandi` Landing Page
- New route `/why-pakmandi` added to router.
- New page `src/pages/WhyPakMandi.tsx` using semantic tokens (dark theme, yellow-300 accent, Poppins + Noto Nastaliq Urdu).
- Sections:
  - Hero: "PakMandi — Pakistan ka Digital Wholesale Bazaar" + one-line mission + primary CTA (Sign up) / secondary (Browse shops).
  - The problem today (before PakMandi): two columns — Wholesalers / Retailers pain points.
  - The trust gap (both sides): verification, reviews, dispute resolution absent.
  - After PakMandi: mirrored two columns — Wholesalers / Retailers wins.
  - Bottom-line strip: "Business runs on who you know → what you offer."
  - Final CTA: Join as Wholesaler / Join as Retailer.
- SEO: title, meta description, single H1, JSON-LD Organization schema.
- Fully responsive, min 48px touch targets, EN/UR bilingual copy where natural.
- Link added from navbar/footer ("Why PakMandi").

## 2. Security Fixes (migration)
**a. Products visibility bypass**
- Drop overlapping permissive SELECT policies `Public can view active products` and `Authenticated users can view active products`.
- Replace with a single policy requiring `is_active = true AND verification_status = 'approved'` for anon + authenticated.
- Keep owner/admin policies for viewing own/pending products.

**b. stock_movements insert bypass**
- Drop `System insert movements` public INSERT policy.
- Stock movement rows will only be created via the existing SECURITY DEFINER trigger `auto_handle_stock_on_order_status` (and admin RPCs). No client role gets direct INSERT.
- Verify the trigger runs as definer with sufficient privileges (grant INSERT to the function's owner role if needed via SECURITY DEFINER — already the pattern).

**c. Critical dep vuln (openai 4.96.2 → form-data)**
- Upgrade `openai` package to latest (>=4.104.0) which pulls a patched `form-data`. Run `bun add openai@latest` and regenerate lockfile so scanner clears.

## Verification
- Run supabase linter after migration.
- Re-run dependency scan after upgrade.
- Manually visit `/why-pakmandi` to confirm render.

## Technical notes
- Products query paths in code already filter `verification_status = 'approved'` for public views, so tightening RLS is safe. Owner dashboards use owner-scoped policies (unchanged).
- Client code that writes `stock_movements` (if any) will be audited; if a direct insert exists it must move to the trigger/RPC path.
