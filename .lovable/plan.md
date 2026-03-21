

## Mobile & Responsive UI Fixes

### Issues Found

| Issue | Location | Severity |
|-------|----------|----------|
| Nested `<a>` tags in ProductCard | `ProductCard.tsx` lines 98 + 216 | High - DOM warning, broken click behavior |
| Favorite button invisible on mobile | `ProductCard.tsx` line 155 | High - `opacity-0` with hover-only, never shows on touch |
| Tablet navbar text wraps to 3 lines | `Navbar.tsx` at 768px | Medium - "Pak Bazaar Connect" stacks awkwardly |
| Tutorials page renders blank | `Tutorials.tsx` | Medium - no footer visible, white flash before content |
| Play overlay hidden on mobile | `Tutorials.tsx` line 132 | Medium - hover-only play button |

### Plan

**1. Fix ProductCard nested links (ProductCard.tsx)**
- Remove the inner `<Link>` on line 216 that wraps the "View Product" button
- Replace with a plain `<Button>` since the entire card is already a `<Link>`
- This eliminates the `<a> inside <a>` DOM nesting warning

**2. Show favorite button on mobile (ProductCard.tsx)**
- Change line 155: replace `opacity-0 group-hover:opacity-100` with `opacity-100 md:opacity-0 md:group-hover:opacity-100`
- Mobile users can always see/tap the heart icon; desktop keeps hover behavior

**3. Fix tablet navbar text wrapping (Navbar.tsx)**
- Hide "Pak Bazaar Connect" text below `lg` breakpoint (1024px) instead of `sm` (640px)
- At 768px tablet width, only show "PBC" logo to avoid the 3-line text stack

**4. Fix tutorials page mobile experience (Tutorials.tsx)**
- Add a visible play icon overlay on mobile (remove hover-only behavior)
- Ensure video dialog is full-width on mobile (`max-w-[95vw]` on small screens)

**5. Minor touch-target improvements**
- Ensure category filter buttons in Tutorials have adequate spacing on small screens
- Make tutorial cards' play overlay always visible on mobile via `opacity-100 md:opacity-0 md:group-hover:opacity-100`

### Files to Edit
- `src/components/products/ProductCard.tsx`
- `src/components/Navbar.tsx`
- `src/pages/Tutorials.tsx`

