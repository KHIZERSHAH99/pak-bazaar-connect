

# 100 Improvements and Features for Pak Bazaar Connect

Organized by category. Each item marked as **ADD**, **IMPROVE**, or **REMOVE**.

---

## Homepage & Public Pages (1-10)

1. **IMPROVE** — Hardcoded "4.8" star rating on FeaturedProducts — should pull real reviews or hide rating entirely
2. **IMPROVE** — Footer copyright says "© 2024" — should be dynamic (current year)
3. **ADD** — Category browsing page — let visitors filter products by category (categories table exists but no UI)
4. **ADD** — "Recently Viewed Products" section on homepage for returning visitors (use localStorage)
5. **IMPROVE** — Social media buttons in footer go nowhere — either link to real profiles or remove them
6. **ADD** — Testimonials/success stories section on homepage from real wholesalers
7. **ADD** — Search bar on homepage hero section for instant product/shop search
8. **IMPROVE** — "Find Wholesalers" footer link goes to `/dashboard/browse-shops` (requires login) — should go to `/shops`
9. **ADD** — City/province filter on the public shops page for location-based browsing
10. **REMOVE** — Blog and BlogPost pages if there's no content management — they add dead weight

## Authentication & Onboarding (11-20)

11. **ADD** — "Forgot Password" flow with email reset link
12. **IMPROVE** — Signup form should auto-focus first field and show password strength meter
13. **ADD** — Google/social login option for faster onboarding
14. **IMPROVE** — After signup, redirect to a guided setup wizard instead of raw dashboard
15. **ADD** — Email verification status indicator on profile page
16. **REMOVE** — EmailConfirmationPending page if email confirmation is disabled (per project spec)
17. **ADD** — "Remember me" checkbox on login form
18. **IMPROVE** — Login error messages are generic — show specific errors (wrong password vs. account not found)
19. **ADD** — Account deletion/deactivation option in profile settings
20. **IMPROVE** — Tutorial/onboarding modal should be skippable with a "Don't show again" that persists

## Dashboard & Navigation (21-35)

21. **ADD** — Dashboard home should show a summary card with today's orders, revenue, new messages
22. **IMPROVE** — Wholesaler dashboard just shows ShopsManagement — add quick stats (total products, orders, revenue)
23. **ADD** — Breadcrumb navigation on all dashboard sub-pages
24. **IMPROVE** — Mobile sidebar closes on navigation but re-opens sluggishly — add faster animation
25. **ADD** — Keyboard shortcuts for power users (Ctrl+K for search, Ctrl+M for messages)
26. **ADD** — "Quick Actions" floating button on mobile — new product, new order, messages
27. **IMPROVE** — Navigation should highlight parent item when on child route (e.g., `/dashboard/tutorials/123`)
28. **ADD** — Collapsible sidebar sections (group "Sales" items vs "Management" items)
29. **ADD** — Dashboard notification bell with dropdown showing recent notifications
30. **REMOVE** — Separate `/seller/`, `/wholesaler/`, `/admin/` route groups — consolidate under `/dashboard/` only to reduce route duplication
31. **ADD** — Dark mode toggle in the dashboard sidebar (currently only in navbar)
32. **IMPROVE** — "Shops" nav item missing for wholesalers in DashboardNavigation
33. **ADD** — Order count badges on the Orders nav item (like messages unread badge)
34. **ADD** — Dashboard search — search across products, orders, shops from one input
35. **REMOVE** — DashboardWholesalerOrdersEnhanced page if it duplicates DashboardWholesalerOrders

## Products (36-50)

36. **ADD** — Bulk product upload via CSV file (per roadmap)
37. **ADD** — Product duplication — "Clone this product" button for wholesalers
38. **IMPROVE** — Product image upload should show preview before saving
39. **ADD** — Product stock/inventory tracking with low stock alerts
40. **ADD** — Product categories filtering on the products listing page
41. **ADD** — "Out of Stock" badge and auto-hide from buyer view when stock is 0
42. **IMPROVE** — Product search should include fuzzy matching and search-as-you-type
43. **ADD** — Product import/export (download all products as CSV)
44. **ADD** — Product SEO fields (meta title, description) for better Google indexing
45. **ADD** — Product bulk actions (activate/deactivate/delete multiple)
46. **IMPROVE** — Product price should format with commas (PKR 1,500 not PKR 1500)
47. **ADD** — Product video support — allow YouTube/video URL alongside images
48. **ADD** — Product tags/keywords for better search discoverability
49. **IMPROVE** — MOQ (Minimum Order Quantity) enforcement — block orders below MOQ
50. **ADD** — Product variation images — different image per color/size variation

## Orders & Payments (51-65)

51. **ADD** — Order summary PDF download (per roadmap — receipt and invoice styles)
52. **ADD** — Order status email/SMS notifications to buyer
53. **IMPROVE** — Order form should validate phone number format (Pakistani +92 format)
54. **ADD** — Repeat/reorder button — one-click reorder from order history
55. **ADD** — Order cancellation by buyer (within time window, e.g., 1 hour)
56. **ADD** — Partial order fulfillment — ship available items, backorder rest
57. **IMPROVE** — Payment screenshot auto-delete is set but no cleanup job runs regularly
58. **ADD** — Payment confirmation notification to wholesaler when screenshot uploaded
59. **ADD** — COD (Cash on Delivery) tracking — mark as collected/pending
60. **ADD** — Order dispute/complaint system with admin mediation
61. **ADD** — Automatic order confirmation after 48 hours if wholesaler doesn't respond
62. **IMPROVE** — Cart context uses only memory — loses cart on page refresh (add localStorage persistence)
63. **ADD** — Saved addresses dropdown in order form (address book exists but may not be connected)
64. **ADD** — Order timeline view showing all status changes with timestamps
65. **IMPROVE** — `createOrder` imported in Checkout but `createOrderWithPayment` is the correct function

## Messaging & Communication (66-72)

66. **ADD** — File/image attachment support in messages (attachment field exists in DB but no upload UI)
67. **ADD** — Typing indicator ("User is typing...")
68. **ADD** — Message search within conversations
69. **ADD** — Emoji picker in chat input
70. **ADD** — Message notification sound/browser notification
71. **IMPROVE** — Conversation should link to the related product/order for context
72. **ADD** — Canned/quick reply templates for wholesalers ("Order shipped", "Payment received")

## Admin Panel (73-80)

73. **ADD** — Admin dashboard with platform-wide stats (total users, orders, revenue, growth charts)
74. **ADD** — User management — search, suspend, delete users
75. **ADD** — Product moderation — approve/reject new product listings
76. **ADD** — Admin can impersonate user for debugging (view as seller/wholesaler)
77. **ADD** — Platform fee configuration — set commission percentages
78. **ADD** — Bulk email/notification to all users (announcements)
79. **IMPROVE** — Admin preview pages should show real data, not just role simulation
80. **ADD** — Export platform data (users, orders, revenue) as CSV for reporting

## Performance & Technical (81-90)

81. **REMOVE** — 30 security files in `src/lib/security/` — most are unused or duplicates (audit.ts vs audit-enhanced.ts vs audit-logger.ts vs audit-scheduler.ts). Consolidate to 5-6 files
82. **REMOVE** — Duplicate order components — `SellerOrders`, `SellerOrdersEnhanced`, `OptimizedSellerOrders`, `WholesalerOrders`, `WholesalerOrdersEnhanced`. Pick one of each
83. **REMOVE** — `EnhancedProducts.tsx`, `WholesalerProducts.tsx` pages if they duplicate `Products.tsx`
84. **IMPROVE** — `payment/paymentMethods.ts` always returns mock data — connect to real `payment_methods` table
85. **REMOVE** — `InquiryForm.tsx` page exists but has no route — either add it or delete it
86. **IMPROVE** — Bundle size — too many Radix UI components imported; tree-shake unused ones
87. **ADD** — Service worker for offline support and faster repeat visits
88. **IMPROVE** — Image optimization — enforce WebP format and max dimensions on upload
89. **REMOVE** — `SellerProfile.tsx` page if not routed anywhere
90. **IMPROVE** — Types file is 3,231 lines — auto-generate it with Supabase CLI instead of manual maintenance

## SEO & Marketing (91-95)

91. **ADD** — Dynamic meta tags per page (product detail, shop page) for social sharing
92. **ADD** — Structured data (JSON-LD) for products — helps Google show rich results
93. **IMPROVE** — `robots.txt` and `sitemap.xml` should be dynamically generated with actual product/shop URLs
94. **ADD** — "Share product" buttons that work (WhatsApp, Facebook, copy link)
95. **ADD** — Referral system — "Invite a seller, get benefits"

## UX & Design (96-100)

96. **IMPROVE** — Empty states throughout the app are plain text — add illustrations and action buttons
97. **ADD** — Skeleton loading states on all data-fetching pages (some have it, many don't)
98. **IMPROVE** — Form validation should show errors inline next to fields, not just toast notifications
99. **ADD** — Urdu language support completeness — many strings are still hardcoded English
100. **ADD** — Accessibility audit — add ARIA labels, keyboard navigation, screen reader support

---

## Priority Recommendation

**High impact, low effort (do first):**
- #1 (fake ratings), #5 (dead social links), #8 (wrong footer link), #46 (price formatting), #62 (cart persistence), #65 (wrong import), #84 (mock payment data)

**High impact, medium effort:**
- #3 (categories), #7 (homepage search), #21 (dashboard summary), #36 (CSV upload), #51 (order PDF), #81-83 (code cleanup)

**Deferred:**
- #13 (social login), #87 (service worker), #95 (referral system)

