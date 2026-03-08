

# Tutorial System Improvements Plan

## Changes

### 1. Add watch progress indicators to tutorial cards
- Query `tutorial_views` for the current user on the grid page
- Show a green checkmark overlay on cards the user has already watched
- Display "X of Y watched" summary at the top of the grid

### 2. Add `display_order` column for admin sorting control
- New migration: add `display_order integer default 0` to `tutorials` table
- Update `fetchTutorials` to include `display_order` in the sort chain
- Add a number input in `TutorialForm` for setting display order

### 3. Add duration metadata
- New migration: add `duration_seconds integer` to `tutorials` table
- Display formatted duration (e.g. "3:45") on tutorial cards
- Add duration input field in admin `TutorialForm`

### 4. Fix admin search to match descriptions
- Update the filter in `TutorialManager` to also search `description`

### 5. Add fallback to ContextualTutorialButton
- When no page-specific tutorials exist, show a "Getting Started" tutorial if available (query `category = 'Getting Started'` as fallback)

### 6. Link onboarding steps to real tutorials
- In `EnhancedWelcomeOnboarding`, add optional "Watch Tutorial" buttons on relevant steps that navigate to `/dashboard/tutorials`

## Files to modify
- `src/lib/tutorials.ts` — update queries for watch status, display_order, duration
- `src/components/tutorials/TutorialGrid.tsx` — watch indicators, duration badges, progress summary
- `src/components/tutorials/TutorialManager.tsx` — fix search, add display_order + duration fields
- `src/components/tutorials/ContextualTutorialButton.tsx` — fallback query
- `src/components/ui/EnhancedWelcomeOnboarding.tsx` — tutorial link buttons
- New migration — `display_order` and `duration_seconds` columns

## Implementation order
1. Migration (new columns)
2. `tutorials.ts` library updates
3. TutorialGrid watch indicators + duration
4. TutorialManager fixes
5. ContextualTutorialButton fallback
6. Onboarding tutorial links

