## Mobile UI/UX Proportion Fix (Daraz-inspired)

Goal: tighten phone proportions so cards, type, and CTAs feel right on a 360–414px screen. Desktop/tablet untouched. No business logic changes — only Tailwind classes & layout structure.

### Audit findings (current issues on mobile)

1. **Product grid is single-column on phones** (`grid-cols-1 sm:grid-cols-2`). Daraz, Alibaba, Temu all use **2-column** on phones. Cards feel huge, only 1 product per screen.
2. **ProductCard typography oversized**: name `text-base`, price `text-xl`, button `h-10` → eats vertical space. Padding `p-4` too generous for a 2-col card.
3. **Featured products** still single column on mobile with `h-48` images + `p-5` → enormous cards.
4. **Hero CTAs** are `py-5` + `text-base` stacked full-width — visually heavy. Trust row uses `h-6` icons which on small screens push hero below the fold awkwardly.
5. **Navbar** logo "PM" tile uses `p-1.5` + `text-lg` → fine, but cart icon button is only `h-9 w-9` (under our 44px rule), while the hamburger is unlabelled and same size — inconsistent hit area.
6. **Login page** wraps the form in `max-w-2xl` and renders a 3-up features grid below — on mobile the features stack as 3 big cards adding excessive scroll. Header `text-4xl` PakMandi + `p-3` shield icon is oversized for 390px.
7. **No bottom-sheet / sticky thumb-zone CTAs** — Daraz keeps "Add to cart" reachable; ours is mid-card.

### Plan

**1. ProductCard (`src/components/products/ProductCard.tsx`)**
- Image height on mobile: `h-32 sm:h-48` (was `h-40`).
- Padding: `p-2.5 sm:p-5` (was `p-4 sm:p-5`).
- Name: `text-sm sm:text-base` line-clamp-2.
- Price: `text-base sm:text-xl` (was `text-xl` flat).
- Hide MOQ badge & description on mobile (already hidden md+ for desc; remove MOQ on `<sm`).
- Move favorite button to `top-1.5 right-1.5`, size `p-1.5`.
- Replace bottom "View Product" button on mobile with a compact `h-9` icon-led CTA (cart icon only on `<sm`, full label `sm+`).
- Remove the always-visible mobile eye-overlay (visual noise in a 2-col grid).
- Tighten badges: `text-[10px] px-1.5 py-0.5` on mobile.

**2. ProductsGrid (`src/components/products/ProductsGrid.tsx`)**
- Grid: `grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` (was `grid-cols-1 sm:grid-cols-2 …`).
- Gap: `gap-2 sm:gap-4 lg:gap-6` (was `gap-6 lg:gap-8`).
- Skeleton matches the new 2-col mobile layout, smaller heights.
- Sort bar: shrink select to `h-8 text-xs` on mobile.

**3. FeaturedProducts (`src/components/home/FeaturedProducts.tsx`)**
- Grid: `grid-cols-2 sm:grid-cols-2 lg:grid-cols-4` (was `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
- Image: `h-32 sm:h-48`, card padding `p-3 sm:p-5`.
- Name `text-sm sm:text-lg`, price `text-base sm:text-xl`.
- Hide MOQ row and "View Details" button label on mobile (icon-only chip).
- Section header: `text-xl sm:text-2xl md:text-4xl`, mb tightened.

**4. Hero (`src/components/home/UrduHeroSection.tsx`)**
- H1: `text-[26px] leading-[1.15] sm:text-4xl …`.
- Subtitle: `text-sm sm:text-base md:text-xl`.
- CTA buttons on mobile: side-by-side (`grid-cols-2 gap-2`) instead of stacked full-width, `h-11 text-sm`.
- Trust row: convert to a 3-icon horizontal chip strip on mobile (`flex justify-between text-[11px]`, icons `h-4 w-4`), grid sm+.
- Section padding: `py-8 md:py-24`.

**5. Navbar (`src/components/Navbar.tsx`)**
- Mobile bar height: `h-12` (was `h-14`) for a tighter, Daraz-like top bar.
- Logo tile: `p-1 text-base` on mobile.
- Cart and hamburger buttons: standardize to `h-10 w-10`, icons `w-5 h-5`.
- Add mobile-only inline search input slot placeholder (visual proportion only — wires to existing `/products?search=` GET).

**6. Login (`src/pages/Login.tsx`)**
- Header icon `p-2 h-6 w-6`, title `text-2xl sm:text-4xl`, subtitle `text-sm sm:text-lg`.
- Hide the 3-up trust cards on `<sm` (keep sm+) — replace with a single inline trust line ("🔒 10,000+ businesses · Secure · Verified").
- Container padding `py-4 sm:py-8`.

**7. Global**
- Bump tap-target rule in `src/index.css` from `min-height: 40px` to `min-height: 44px` (Apple HIG / Daraz standard) and add `min-width: 44px` for icon-only buttons via a utility class `.tap-44`.

### Out of scope
- No backend/RLS/edge changes.
- No copy changes beyond what's required to fit narrower mobile widths.
- Desktop (`md+`) layouts unchanged unless explicitly noted.

### Technical notes
- All changes are Tailwind responsive classes; no new dependencies.
- Semantic tokens preserved (`bg-primary`, `text-foreground`, etc.).
- RTL (Urdu) untouched — only sizes change, not directional classes.

After implementation I'll capture mobile screenshots of `/`, `/products`, `/login`, and a product detail card to confirm proportions land.
