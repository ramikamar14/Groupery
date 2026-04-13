# Grouperry — CTO Pre-Launch Audit
**Date:** 2026-04-13  
**Auditor:** Claude Opus (CTO review mode)  
**Status:** Awaiting prioritised fix sprint

---

## Executive Summary

Grouperry is functionally built — authentication, listings, group joining, messaging, notifications, admin panel, i18n, and the full onboarding wall are all working. The code quality is good for a v1. However, **6 launch blockers exist** that must be resolved before going live, plus a critical incomplete flow: there is no payment mechanism beyond "manually mark as paid."

The platform is **70% launch-ready**. With a focused 1–2 week sprint on the P0s and key P1s, it can go live safely.

---

## Pages Inventory

| Route | Component | Auth | Status |
|---|---|---|---|
| `/` | `Landing` / `Discover` (auth) | Conditional | ✅ |
| `/explore` | `Home` | No | ✅ |
| `/dashboard` | `Dashboard` | Yes | ✅ |
| `/create` | `CreateListing` | Yes | ✅ |
| `/listings/:id` | `ListingDetails` | No (public) | ✅ |
| `/my-groups` | `MyGroups` | Yes | ✅ |
| `/profile` | `Profile` | Yes | ✅ |
| `/onboarding` | `Onboarding` | Yes | ✅ |
| `/saved` | `SavedListings` | Yes | ✅ |
| `/notifications` | `Notifications` | Yes | ✅ |
| `/admin` | `Admin` | Auth only (⚠️ no isAdmin check client-side) | ⚠️ |
| `/expired` | `ExpiredListings` | Yes | ✅ |
| `/terms` | `Terms` | No | ✅ |
| `/privacy` | `PrivacyPolicy` | No | ✅ |
| `/faq` | `FAQ` | No | ✅ |
| `/about` | `About` | No | ✅ |
| `/contact` | `Contact` | No | ✅ |
| `*` | `NotFound` | No | ✅ |

**Dead links:** None found. All nav and footer links resolve to valid routes.

---

## Launch Blockers — P0 (Must Fix Before Go-Live)

### P0-1: Banned users can still use the app
**Severity:** Critical — trust/safety  
**Where:** `server/authMiddleware.ts`, `server/replit_integrations/auth/replitAuth.ts`  
**Problem:** Admin can set `isDisabled = true` on a user, but `requireAuth` never checks this flag. A banned user's existing session remains valid indefinitely. They can access every authenticated endpoint.  
**Fix:** In `requireAuth` (and/or in `deserializeUser`), check `user.isDisabled === true` and return 401/destroy session.

---

### P0-2: Admin UI accessible to all logged-in users
**Severity:** High — information disclosure  
**Where:** `client/src/App.tsx` line 119  
**Problem:** The `/admin` route only checks `isAuthenticated`. Any logged-in user can visit `/admin` and see the admin shell. API calls fail (protected by `requireAdmin`) but the panel structure is exposed.  
**Fix:** Wrap `/admin` route with an `isAdmin` check in `App.tsx`, redirect non-admins to `/`.

---

### P0-3: Duplicate `/api/admin/orders` route — admin panel broken
**Severity:** High — admin functionality  
**Where:** `server/routes.ts` lines 534 and ~1932  
**Problem:** The route is registered twice with different implementations. Express uses the second registration only. Admin sees participation data instead of order data.  
**Fix:** Remove the duplicate. Keep only the correct implementation.

---

### P0-4: XSS in contact form email
**Severity:** High — security  
**Where:** `server/routes.ts` contact handler  
**Problem:** `name` and `email` fields are injected raw into the HTML email template. An attacker sends `name: "<script>...</script>"` → executes in admin's email client.  
**Fix:** HTML-escape all user inputs before interpolation (`name.replace(/</g, "&lt;").replace(/>/g, "&gt;")`).

---

### P0-5: CSRF vulnerability (SameSite=None without CSRF tokens)
**Severity:** High — security  
**Where:** `server/replit_integrations/auth/replitAuth.ts`  
**Problem:** Session cookie uses `sameSite: "none"` for Capacitor support with no CSRF token mechanism. Any malicious site can make authenticated requests on behalf of logged-in users.  
**Fix (short term):** Add `csurf` middleware or validate `Origin`/`Referer` header on all state-mutating POST/PATCH/DELETE endpoints.  
**Fix (long term):** Implement double-submit cookie CSRF pattern.

---

### P0-6: User can self-promote onboarding completion
**Severity:** Medium-High — integrity  
**Where:** `server/routes.ts` `PATCH /api/user/profile`  
**Problem:** The profile update allowlist includes `onboardingComplete`. Any user can send `{ onboardingComplete: true }` directly and bypass the onboarding flow.  
**Fix:** Remove `onboardingComplete` from the profile update allowlist. It should only be set by the onboarding completion endpoint.

---

## High Priority — P1 (Fix Before or Shortly After Launch)

### P1-1: No payment processing
**The biggest missing flow.** Users commit to a deal, creating an "order" record, but no money changes hands on-platform. The organiser manually marks people as paid in an external channel, then marks them as paid in the app. This means:
- No payment proof
- No escrow
- No receipts
- No fraud protection
- Organiser could collect money and disappear

**Minimum viable solution:** Add payment proof upload (participant uploads bank transfer screenshot → organiser confirms). This doesn't require Stripe but closes the "where did my money go" loop.  
**Full solution:** Stripe integration with escrow release on deal completion.

---

### P1-2: Invitation accepted does not join user to listing
**Where:** `server/routes.ts` `PATCH /api/invitations/:id`  
**Problem:** Accepting an invitation updates the status to "accepted" but does NOT add the user to the listing. The user must then manually find and join the listing. This makes invitations useless as a join mechanism.  
**Fix:** When invitation is accepted, automatically trigger the join flow.

---

### P1-3: Waitlist notification but no auto-join
**Where:** `server/storage.ts` `notifyFirstWaiter`  
**Problem:** When a slot opens, the first waiter gets an in-app notification but no email. They must check the app and manually join before anyone else does. Effectively, the waitlist provides no priority guarantee.  
**Fix:** Send email notification to waitlisted user. Give them a 30-minute priority window (mark slot as "reserved for waiter").

---

### P1-4: group_filled milestone never auto-set
**Where:** `server/routes.ts` join/commit logic  
**Problem:** The milestone system has 5 stages starting with `group_filled`. This is never auto-triggered when the listing reaches capacity — organiser must manually advance it. The milestone tracker looks broken to organisers.  
**Fix:** Auto-set `group_filled` milestone when `filledSlots >= totalSlots`.

---

### P1-5: No email verification on registration
**Problem:** Users sign up with any email, no confirmation required. Enables fake accounts and typosquatting. The email becomes the primary contact point for deal updates.  
**Fix:** Send verification email on registration. Lock email-requiring features (deal creation) until verified. Phone OTP partially compensates but doesn't verify email.

---

### P1-6: Participant PII exposed to unauthenticated users
**Where:** `GET /api/listings/:id` and `GET /api/listings/:id/orders`  
**Problem:** Full participant list with names, profile images, reliability scores, and countries is publicly accessible without authentication.  
**Fix:** Return a participant count only for unauthenticated requests. Full participant list requires auth.

---

### P1-7: Demo seed data runs in production
**Where:** `server/routes.ts` `seedDatabase()` called on every startup  
**Problem:** If the listings table is ever empty in production (DB migration, reset), it auto-seeds with fake data including a `demo@grouperry.com` user and placehold.co images.  
**Fix:** Gate behind `NODE_ENV === "development"` or a feature flag.

---

### P1-8: No dispute or refund flow
**Problem:** When a deal goes wrong (organiser ghosts, wrong item delivered), there is no mechanism for users to raise a dispute or request a refund. Admin can change order status but there's no workflow.  
**Minimum viable:** Add a "Report a problem with this deal" form on the listing page that creates a high-priority admin report with a structured template.

---

## Medium Priority — P2 (Post-Launch Sprint)

| # | Issue | Location |
|---|---|---|
| P2-1 | `routes.ts` is 2,903 lines — split into domain modules | `server/routes.ts` |
| P2-2 | CSP is completely disabled | `server/index.ts` line 27 |
| P2-3 | No pagination on notifications | `/api/notifications` |
| P2-4 | Referral `rewardGranted` never set — referrals are phantom | `server/routes.ts` referral endpoints |
| P2-5 | `GET /api/stats` does full table scans (no COUNT query) | `server/routes.ts` |
| P2-6 | Expiry cron fetches ALL listings every 15 minutes | `server/routes.ts` |
| P2-7 | `users.lastLoginAt` used in raw SQL but not in Drizzle schema | `server/routes.ts` line 1737 |
| P2-8 | ilike search doesn't escape `%` and `_` meta-characters | `server/storage.ts` |
| P2-9 | Warning-kickable window (1hr), slot counts, AI limits are hardcoded | `server/routes.ts` |
| P2-10 | Mix of Drizzle ORM and raw `pool.query` throughout | `server/routes.ts`, `server/email.ts` |
| P2-11 | No rate limit on: commit, kick, warn, proof upload, invitations, referral claim | `server/routes.ts` |
| P2-12 | Admin user activity endpoint does full table scans | `server/routes.ts` lines 2217-2253 |

---

## Incomplete Flows Summary

| Flow | Status | Gap |
|---|---|---|
| Auth (email + phone OTP) | ✅ Working | E.164 normalization added |
| Onboarding | ✅ Working | Can be bypassed via profile API (P0-6) |
| Listing creation | ✅ Working | — |
| Group joining | ✅ Working | — |
| Group messaging | ✅ Working | — |
| Notifications | ✅ Working | No pagination |
| Payment collection | ❌ Missing | Manual only, no proof, no escrow |
| Milestones | ⚠️ Partial | `group_filled` never auto-set |
| Invitations | ⚠️ Partial | Accepting doesn't trigger join |
| Waitlist | ⚠️ Partial | Notify only, no priority hold |
| Dispute/refund | ❌ Missing | No user-facing flow |
| Reviews | ✅ Working | No edit/delete/moderation |
| Referrals | ⚠️ Partial | Tracked but reward never granted |
| Newsletter | ✅ Working | Welcome email now sent |
| Contact form | ✅ Working | XSS in email HTML (P0-4) |
| Admin CRM | ✅ Working | Duplicate route (P0-3), UI auth gap (P0-2) |

---

## Dead Links

**None found.** All navigation, sidebar, bottom nav, and footer links map to valid routes in `App.tsx`.

---

## Code Review Summary

**Strengths:**
- Clean DTO layer (toPublicUser, toPublicListing, toParticipantListing)
- Consistent in-memory TTL cache with prefix invalidation
- Rate limiting on most sensitive paths
- Solid i18n coverage (4 languages, RTL support)
- Phone OTP wall before listing creation

**Technical Debt (to address post-launch):**
- `routes.ts` at 2,903 lines needs domain-based decomposition
- Pervasive `(req.user as any)` — needs typed request interface
- Mix of Drizzle and raw `pool.query`
- N+1 patterns in admin endpoints
- CSP disabled
- No automated tests visible in the codebase

---

## Launch Readiness Scorecard

| Area | Score | Notes |
|---|---|---|
| Auth & Sessions | 7/10 | Banned users not blocked |
| Core CRUD | 9/10 | Solid |
| Business Logic | 5/10 | Payment flow missing, invitation broken |
| Security | 5/10 | CSRF, XSS, no CSP, disabled check missing |
| Performance | 7/10 | Cache is good, a few N+1s |
| i18n | 9/10 | 4 languages, all keys present |
| Admin Panel | 7/10 | Duplicate route, UI auth gap |
| Email Flows | 8/10 | Contact + newsletter now working |
| **Overall** | **6.5/10** | Launch after P0 sprint |

---

## Recommended Launch Sprint (1–2 weeks)

**Week 1 — P0 fixes (2–3 days each):**
1. P0-1: Add `isDisabled` check in `requireAuth`
2. P0-2: Add `isAdmin` guard on `/admin` route in `App.tsx`
3. P0-3: Remove duplicate `/api/admin/orders` route
4. P0-4: HTML-escape contact form inputs
5. P0-5: Add Origin/Referer CSRF check on mutating endpoints
6. P0-6: Remove `onboardingComplete` from profile update allowlist

**Week 2 — P1 quick wins:**
1. P1-2: Auto-join on invitation accept
2. P1-4: Auto-set `group_filled` milestone
3. P1-6: Hide participant PII from unauthenticated requests
4. P1-7: Gate seed data behind `NODE_ENV === "development"`
5. P1-1: Add payment proof upload (minimum viable payment flow)

**After launch:**
- P1-3: Waitlist priority window + email
- P1-5: Email verification on registration
- P1-8: Dispute/report form
- All P2 items
