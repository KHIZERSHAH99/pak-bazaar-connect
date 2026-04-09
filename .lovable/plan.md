

## Priority 3: Urdu-First Experience & Translation Cleanup

### Problem
The app has partial Urdu support but ~60% of the interface remains English-only. For illiterate or semi-literate Pakistani wholesalers, hitting random English text mid-flow breaks trust and creates confusion. RTL alignment is inconsistent.

### Approach
Systematic sweep through all user-facing components. No feature changes, no logic changes — pure translation and alignment fixes. Low risk, high impact.

### Batch 1: Core Navigation & Chrome (Low Risk)

**Files**: `Navbar.tsx`, `MobileMenu.tsx`, `DashboardNavigation.tsx`, `LanguageToggle.tsx`

- Replace hardcoded "Wholesalers" → `t('shops')` (already has Urdu: دکانیں)
- Replace hardcoded "Help" → add translation key `help` → مدد
- Add `dir` attribute to navbar container when Urdu active
- Dashboard sidebar: translate "More Tools" → مزید, "Stock" → اسٹاک, all group labels
- Role badge: show Urdu role names (ہول سیلر, فروخت کنندہ) when language is Urdu

### Batch 2: Auth & Onboarding (Medium Risk)

**Files**: `RoleSelectionStep.tsx`, `EmailSignupForm.tsx`, `AccountInfoStep.tsx`, `PakistaniLoginForm.tsx`

- Role selection cards: translate titles, descriptions, feature lists
- Login form labels and error messages
- Signup form field labels and validation messages
- Lockout message translation
- Add `dir="rtl"` to form containers when Urdu

### Batch 3: Dashboard & Orders (Medium Risk)

**Files**: `EnhancedSellerDashboard.tsx`, `EnhancedWholesalerDashboard.tsx`, order-related components

- Dashboard quick action cards: translate titles and descriptions
- Order status labels and filter options
- Toast/notification messages: add bilingual support
- Stats cards (Total Orders, Revenue, etc.) — already have translations, verify they're used

### Batch 4: Chat & Support (Low Risk)

**Files**: `ChatWelcomeMessage.tsx`, `ModernChatInterface.tsx`

- Welcome message in Urdu when language is set
- Suggested questions in Urdu
- "Press Enter to send" → "بھیجنے کے لیے Enter دبائیں"
- Chat input placeholder

### Batch 5: RTL Layout Pass (Medium Risk)

- Add conditional `dir="rtl"` to page-level containers
- Flip icon positions (mr-2 → ml-2) when RTL
- Ensure `space-x-reverse` on flex containers in RTL
- Search input: flip search icon position in RTL mode
- Test on mobile viewport to verify no layout breaks

### New Translation Keys Needed
Add ~30-40 new keys to `LanguageContext.tsx` for currently hardcoded strings like:
- `help` → مدد
- `moreTools` → مزید
- `stock` → اسٹاک  
- `browseProducts` (verify exists)
- `pressEnterToSend` → بھیجنے کے لیے Enter دبائیں
- Various dashboard action descriptions

### Safety
- No database changes
- No auth flow changes  
- No feature additions or removals
- Each batch can be tested independently
- Build verification after each batch

### Execution Order
Batch 1 → 2 → 3 → 4 → 5, with build check after each. I'll pause between batches for you to verify on preview.

