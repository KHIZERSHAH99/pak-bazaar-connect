## Next up: Phase 4 — One-Tap Orders for Wholesalers

Goal: make order handling so simple a shopkeeper can confirm, invoice, and notify a buyer with a single tap — no reading long forms, no hunting for buttons.

### What we'll build

1. **One big green "Confirm & Notify" button** on every pending order card in `EnhancedOrderCard` / `WholesalerOrders`.
  - Single tap does three things in sequence: updates status to `confirmed`, sends WhatsApp invoice link to buyer, logs the action.
  - Replaces the current multi-button row (Confirm / Reject / Message / View) — those move under a small "More" menu.
2. **Tap-to-call buyer** — phone icon next to buyer name opens `tel:` link directly. No copy-paste.
3. **WhatsApp invoice** — auto-generates a pre-filled `wa.me/<buyer_phone>?text=...` message with:
  - Shop name (Urdu + English)
  - Order ID (short)
  - Items + qty + total in PKR
  - Payment method + account details
  - Delivery ETA
4. **SMS/WhatsApp alert on new order** — when a new order lands, wholesaler gets:
  - Browser push (already partially there via notifications)
  - Optional WhatsApp deep-link ("Naya order aaya — dekhein") using the wholesaler's own phone
  - We will **not** wire a paid SMS gateway yet — flagged as Phase 4.5 pending your provider pick (Twilio vs. local like Jazz/Zong bulk SMS).
5. **Urdu status chips with icons + color** on the order card:
  - Pending → yellow clock ⏳ "Intezaar"
  - Confirmed → green check ✅ "Confirm ho gaya"
  - Shipped → blue truck 🚚 "Bheja gaya"
  - Delivered → green box 📦 "Pahonch gaya"
  - Rejected → red x ❌ "Mana kar diya"

### Files to touch

- `src/components/orders/EnhancedOrderCard.tsx` — new primary button, WhatsApp helper, tel: link, Urdu chips.
- `src/components/orders/EnhancedOrderManagement.tsx` — refresh after one-tap confirm.
- `src/lib/orders/whatsapp-invoice.ts` (new) — pure function that builds the wa.me URL from an order.
- `src/lib/orders/unified-queries.ts` — no schema change, just reuse `optimisticUpdateOrderStatus`.
- Urdu strings added to `LanguageContext` where missing.

### Out of scope for this phase (queued for later)

- Phase 4.5: paid SMS gateway (needs your provider decision).
- Phase 5: full literacy pass (Urdu-default for PK, Urdu numerals option, browser TTS tooltips).
- Phase 6: earnings "Aap ko milna hai" widget, verified badge in header, weekly SMS summary.
- Phase 7: per-screen 30-sec tutorial video buttons.

### Technical notes

- No database migration needed — `orders` already has `confirmed_at`, `status`, `wholesaler_notes`.
- `wa.me` links work without any WhatsApp Business API — opens the wholesaler's WhatsApp with a pre-filled message to the buyer's number. Zero cost.
- `tel:` links are native browser behaviour — no library.
- Status chip colors will use semantic tokens (`bg-primary/10 text-primary`, `bg-destructive/10 text-destructive`, etc.) — no hardcoded Tailwind colors.

Approve to build Phase 4, or say "do Phase 5 first" / "skip to Phase 6" and I'll re-plan.