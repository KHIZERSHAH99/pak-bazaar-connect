

# Tutorial System and Performance Improvements Plan

## Problem Summary

Based on the code audit and network logs, there are several issues:

1. **Auth polling every ~20-27 seconds** causes duplicate profile fetches (visible in network logs - same profile endpoint called repeatedly)
2. **404 error on `get_active_products_list`** RPC that doesn't exist
3. **Tutorial system missing features** like pagination, view counts, and drag-to-reorder
4. **Performance monitor cache hit rate always 0%** because the custom `queryOptimizer` cache is never used by actual page components
5. **Console.log pollution** in production code

---

## Part 1: Fix Auth Polling (Biggest Performance Win)

The `AuthContext.tsx` has a `SIGNED_IN` event that fires on every token refresh cycle (~20-27s based on logs), triggering `ensureProfileSync` + `fetchProfile` each time. This causes 2 extra API calls per cycle.

**Fix**: Only sync profile on initial `SIGNED_IN` (not on `TOKEN_REFRESHED`), and cache the profile so it doesn't re-fetch if already loaded.

**Changes in `src/contexts/AuthContext.tsx`**:
- Add a `profileFetchedRef` to track if profile was already loaded this session
- In `onAuthStateChange`, only trigger profile fetch on first `SIGNED_IN`, skip if profile already exists
- Remove duplicate `ensureProfileSync` call in `getSession().then()` when `profileTrigger` effect already handles it
- Remove excessive `console.log` statements

---

## Part 2: Tutorial System Improvements

### 2a. Add Tutorial View Count Display (Admin)
- Query `tutorial_views` table to get view counts per tutorial
- Display view count badge on each tutorial card in TutorialManager

### 2b. Add Pagination to Tutorial Grid
- Currently loads all tutorials at once
- Add simple "Load More" pagination (10 tutorials per page) using Supabase `.range()`

### 2c. Improve Tutorial Form UX
- Add YouTube video preview thumbnail when URL is pasted (already partially done, but show inline preview)
- Add a "Preview" button that opens the YouTube video in a small preview before saving
- Add target page dropdown with common page paths instead of free text input

### 2d. Add "Sort by" Option to User Tutorial Grid
- Options: Newest, Most Popular (by views), Featured First (current default)

---

## Part 3: Performance Monitor Accuracy

### 3a. Fix Cache Hit Rate
The `getCacheStats().hitRate` calculation is wrong -- it divides valid entries by total entries, which doesn't measure actual cache hits vs misses.

**Fix in `src/lib/performance/query-optimizer-enhanced.ts`**:
- Add `hits` and `misses` counters to the class
- Increment `hits` when cache is used, `misses` when a fresh query is made
- Calculate `hitRate` as `hits / (hits + misses)`

### 3b. Remove Console Logs in Production
- Remove or guard `console.log` statements in AuthContext, query-optimizer, and performance-monitor behind `import.meta.env.DEV`

---

## Part 4: Fix 404 RPC Error

The network logs show a 404 for `get_active_products_list` RPC. This function doesn't exist in the database.

**Fix**: Find and update the component calling this RPC to use a direct table query instead.

---

## Technical Details

### Files to Modify:
1. `src/contexts/AuthContext.tsx` - Fix auth polling, remove duplicate fetches
2. `src/lib/performance/query-optimizer-enhanced.ts` - Fix cache hit rate calculation
3. `src/components/tutorials/TutorialGrid.tsx` - Add pagination and sort options
4. `src/components/tutorials/TutorialManager.tsx` - Add view count display
5. `src/lib/tutorials.ts` - Add paginated fetch function, view count query
6. `src/components/ui/performance-monitor.tsx` - Minor cleanup

### Files to Search (for RPC fix):
- Find which component calls `get_active_products_list` and fix it

### Estimated Impact:
- Auth polling fix: Eliminates ~6 unnecessary API calls per minute
- Tutorial pagination: Reduces data load for users with many tutorials
- Cache hit rate fix: Gives admin accurate performance metrics

