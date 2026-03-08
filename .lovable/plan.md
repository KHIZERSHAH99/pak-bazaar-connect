
# Security Hardening Plan

## Current State

The security scan shows a well-secured application with comprehensive RLS, rate limiting, input validation, and secrets management. Three actionable findings remain, plus several code-level improvements.

## Actionable Items

### 1. Enhance `_headers` file with full security headers
The `public/_headers` file only has `X-Frame-Options` and `X-Content-Type-Options`. Add all recommended security headers including `Referrer-Policy`, `Permissions-Policy`, `X-XSS-Protection`, and `Strict-Transport-Security`.

### 2. Fix mutable function search paths
Run a migration to set `search_path` on any remaining database functions that lack it. Query `pg_proc` to find and fix them.

### 3. Tighten CSP directives
Current CSP allows `'unsafe-eval'` in `script-src` and `https://*` in `connect-src` and `img-src`, which is overly permissive. Restrict to known domains only.

### 4. Add session integrity validation
Add periodic server-side session validation in `AuthContext` to detect tampered tokens or expired sessions proactively (every 5 minutes), rather than only on page load.

### 5. Harden signOut to clear all client state
Ensure `signOut` clears any cached data in memory (query caches, rate limiter maps, etc.) to prevent stale data leakage between sessions.

### 6. Platform-level recommendations (manual, no code)
- **Enable Leaked Password Protection** in Supabase Auth settings
- **Upgrade Postgres version** in Supabase dashboard to apply security patches

## Implementation Order
1. `_headers` security headers (quick win)
2. CSP tightening
3. Session integrity validation
4. SignOut state cleanup
5. Database migration for function search paths
6. Document manual steps for user

## Files to Modify
- `public/_headers` — full security headers
- `src/lib/security/content-security-policy.ts` — tighten CSP directives
- `src/contexts/AuthContext.tsx` — session integrity check, signOut cleanup
- New migration — fix mutable function search paths
