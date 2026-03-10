

## Audit & Fix Plan: Tutorials, Auth, UI, and Wholesaler Flow

### Critical Build Errors (Blocking)

All 15 build errors stem from using Node.js-only APIs (`process.env.NODE_ENV`, `NodeJS.Timeout`) in browser code. These must be replaced with Vite equivalents.

| File | Issue | Fix |
|------|-------|-----|
| `PerformanceMonitor.tsx` (line 24) | `NodeJS.Timeout` | Change to `ReturnType<typeof setInterval>` |
| `AuthContext.tsx` (lines 126-127) | `NodeJS.Timeout` | Change to `ReturnType<typeof setTimeout>` / `ReturnType<typeof setInterval>` |
| `enhanced-rate-limiting.ts` (line 20) | `NodeJS.Timeout` | Change to `ReturnType<typeof setInterval>` |
| `rateLimit.ts` (line 12) | `NodeJS.Timeout` | Change to `ReturnType<typeof setInterval>` |
| `AppErrorBoundary.tsx` (line 51) | `process.env.NODE_ENV` | Change to `import.meta.env.PROD` |
| `ErrorBoundary.tsx` (line 33) | `process.env.NODE_ENV` | Change to `import.meta.env.PROD` |
| `enhanced-error-boundary.tsx` (line 53) | `process.env.NODE_ENV` | Change to `import.meta.env.PROD` |
| `usePageAnalytics.tsx` (lines 12, 26, 43) | `process.env.NODE_ENV` | Change to `import.meta.env.DEV` |
| `enhanced-auth-security.ts` (line 329) | `process.env.NODE_ENV` | Change to `import.meta.env.MODE` |
| `production-security.ts` (lines 12, 166, 198) | `process.env.NODE_ENV` | Change to `import.meta.env.PROD` / `import.meta.env.MODE` |

### Security Issue

`PerformanceMonitor.tsx` line 30 checks `localStorage.getItem('user_role') === 'admin'` -- this is client-side role checking which is insecure per project rules. Will remove this check and keep it dev-only (`import.meta.env.DEV`).

### Console Warning

`Breadcrumbs.tsx` triggers a React warning about invalid `data-lov-id` prop on `React.Fragment`. This is a Lovable dev-tool artifact and not a production issue -- no fix needed.

### Tutorial System

Reviewed `Tutorials.tsx` and `lib/tutorials.ts` -- both are clean. The public page fetches active tutorials, supports search/category filter, video playback (YouTube + direct files), and localized content. No bugs found.

### Auth System

`AuthContext.tsx` logic is sound: session refresh, integrity checks, profile sync on SIGNED_IN, cleanup on SIGNED_OUT. The only issue is the `NodeJS.Timeout` type (covered above).

### Wholesaler/Ordering Flow

Product creation (`CreateProductDialog`), order management (`EnhancedOrderManagementSystem`, `UnifiedOrderManagement`), and related queries were previously fixed with explicit FK hints. No new issues found.

### Summary of Changes

- **15 files edited** to fix build errors (replace `process.env.NODE_ENV` with `import.meta.env` equivalents, replace `NodeJS.Timeout` with `ReturnType<typeof setTimeout>`)
- **1 security fix** in PerformanceMonitor (remove localStorage role check)
- **0 database changes needed**

