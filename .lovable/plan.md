# Wholesaler UX Audit & Simplification Plan

Goal: map every wholesaler touchpoint on PakMandi, identify what helps them vs. what creates friction, and redesign the flows so a 20-60 year old, low-literacy Urdu-first shopkeeper can operate the platform confidently — enough that they never open a competitor.

---

## 1. Wholesaler Journey Today (stepping stones)

Places on the site that currently *pull wholesalers in* — keep and amplify these:

- **Signup (phone-based, no email confirm)** — low friction entry, Pakistani number format.
- **Dashboard home** — single screen with stats + quick actions.
- **Create Shop** dialog — one form, logo upload, address.
- **Products management** — add product, edit, active toggle.
- **Warehouse Auto-Sync** — stock auto-deducts on order confirm, restores on cancel. Big trust win.
- **Wholesaler Orders (unified view)** — pending / confirmed / shipped filters.
- **Verified badge** — visible trust signal for buyers.
- **In-app messaging** — replaces WhatsApp scatter.
- **Bulk pricing tiers** — matches how real mandi pricing works.
- `**/why-pakmandi**` — new pitch page reinforces the "why."

## 2. Friction Points (what makes wholesalers bounce)

Concrete blockers observed in the current code + flows:

### A. Onboarding friction

- Signup form asks for email + password even though auth is phone-first — extra field a non-technical user doesn't understand.
- No "guided first-run" — after signup the user lands on an empty dashboard with no next step highlighted.
- Shop creation requires 10–500 char address, correct Pakistani phone regex, logo upload — all in one dialog with red validation errors in English.

### B. Product listing friction

- "Add Product" opens a form with many fields (name, price, image, stock, MOQ, bulk tiers, category, description). No shortcut for "just list one item fast."
- Image upload requires choosing/cropping — hard on a low-end Android in bright sunlight.
- Bulk pricing tier UI is a nested table — conceptually heavy.
- No voice input, no camera-first flow, no barcode/quick-add.

### C. Order handling friction

- Order card shows many statuses and buttons (`confirm / reject / ship / mark delivered / add tracking`). Too much choice.
- Payment screenshot needs manual review with no clear "approve" affordance.
- No one-tap "call buyer" button on order cards.
- Notifications live inside the app only — a wholesaler who doesn't open PakMandi for a day misses orders.

### D. Language & literacy friction

- Most dashboard labels are English-only ("Products", "Inventory", "Analytics", "Shipping").
- Urdu toggle exists but many admin/wholesaler screens fall back to English strings.
- Error messages are English regex text (e.g. "Invalid Pakistani phone number format").
- Numbers/currency shown as `PKR 1,250` — no local Urdu numerals option.

### E. Trust & payment friction

- No visible earnings summary "you have Rs X to receive" on the dashboard home.
- No printable/WhatsApp-shareable invoice for buyers who prefer paper.
- Verification status is buried inside profile instead of front-and-center.

### F. Navigation friction

- Sidebar has 8+ items (Products, Inventory, Orders, Shipping, Coupons, Analytics, Tutorials, Shop). Cognitive overload.
- Icons are shadcn defaults, not localized/mental-model matched.
- No persistent "help / call us" button.

## 3. Simplifications — the "illiterate-proof" rewrite

Concrete changes proposed. Small enough to ship in phases.

### Phase 1 — Onboarding & first-run (highest ROI)

1. **Split signup into 2 steps**: (1) phone + name only, (2) "aap kya bechte hain?" category chips. No email/password shown; auto-generate `@pakmandi.store` internal email.
2. **First-run wizard** on dashboard after signup: 3 big cards — "Dukaan banayein" → "Pehla product lagayein" → "Order lene ke liye tayyar."
3. **Progress ring** at the top showing % of setup complete until first product goes live.

### Phase 2 — Dashboard reduction

1. Collapse sidebar to **4 primary tiles** with large icons + Urdu labels: **Orders / Products / Paisay (earnings) / Madad (help)**.
2. Everything else (analytics, coupons, shipping settings) becomes a "More" drawer.
3. Dashboard home shows only 3 numbers in huge type: **Naye orders**, **Aaj ki bikri**, **Stock khatam ho raha hai**.

### Phase 3 — Product listing "fast path"

1. **Quick Add** button on Products: opens a 3-field form only — **Photo (camera-first) → Naam → Qeemat**. All other fields optional / auto-filled.
2. Camera opens directly on tap (no gallery picker step); auto-compress; single tap "Save".
3. Voice-to-text mic icon on name and description fields (Web Speech API, Urdu locale).
4. Bulk pricing hidden behind an "Advanced" toggle; default single price only.

### Phase 4 — Orders one-tap actions

1. Order card reduced to: **buyer name + amount + one big green button** ("Confirm karein"). Reject moved to overflow menu.
2. **Call buyer** icon (tel: link) on every order.
3. **WhatsApp invoice** button — generates order summary and opens WhatsApp with pre-filled message + PDF.
4. Auto-send order notification to wholesaler via WhatsApp/SMS (edge function), not just in-app.

### Phase 5 — Language & literacy

1. Force Urdu as default for phone-signup users from PK; English toggle stays.
2. Every error message must have an Urdu string + an icon; no raw regex text.
3. Add **Urdu numerals option** in settings (۰۱۲۳…) for price display.
4. Replace text-only status chips with **icon + color + Urdu word** (e.g. 🟢 نیا, 🟡 بھیج دیا, ✅ مکمل).
5. Add short **voice tooltip** on every primary button — tap the ear icon, hear an Urdu explanation (pre-recorded MP3s, cached).

### Phase 6 — Trust & retention

1. **Earnings widget** on dashboard: "Aap ko milna hai: Rs X" — the single strongest reason they open the app daily.
2. **Verified badge** promoted to header next to shop name.
3. **Star rating + review count** always visible on wholesaler's own dashboard, so they see reputation grow.
4. Weekly Urdu SMS: "Is hafte X orders, Rs Y bikri."

### Phase 7 — Help that actually works

1. Persistent floating **"Madad"** button → 2 options: (a) call PakMandi support (tel: 03149388513), (b) open WhatsApp chat.
2. Every screen has a 30-second Urdu video tutorial button (already have `/tutorials`, just surface contextually).

---

## 4. Why they'll choose PakMandi over anything else

Once the above ships, the wholesaler's mental model becomes:

- "Ek jaga sab kuch dikh jata hai — orders, paise, stock."
- "Urdu mein hai, awaz se bhi ho jata hai."
- "Naye retailer khud dhoondh lete hain mujhe."
- "Screenshot bhejo, WhatsApp par invoice chala jata hai."
- "Verified badge ki wajah se ajnabi bhi bharosa karte hain."

Competitors (Daraz B2B, OLX, WhatsApp groups) can't match all five at once. That's the moat.

---

## 5. Deliverable of this plan

This is a **planning-only deliverable**. No code changes yet. Once approved, I will propose the phases as separate implementation plans, starting with **Phase 1 + Phase 2** (highest ROI, lowest risk, no schema changes).

## 6. Open questions before we build

1. Do you want **Urdu as default** for all new PK signups, or keep English default with a prominent toggle? urdu but readable not too caligrahy urdu simple urdu
2. For WhatsApp/SMS notifications (Phase 4/5), do you already have a provider (Twilio, Vonage, local BulkSMS) or should I recommend one? recommend
3. Should the **"Quick Add" 3-field product** replace the current form, or sit alongside as an alternative entry point? i dont know what you mean by replacing but yeah i liked your others being optional and this being mendatory also they should know these are optional
4. Voice tooltips (Phase 5) — record real Urdu voice clips or use browser TTS (lower quality but zero cost)? browser tts
  &nbsp;