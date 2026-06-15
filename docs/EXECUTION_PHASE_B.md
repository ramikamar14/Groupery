# Grouperry — Phase B: Execution Blueprint
**Derived from:** `docs/STRATEGY_PHASE_A.md` (2026-06-15)  
**Author:** Chief Implementation Engineer  
**Payments posture assumed:** Path A — payments-native, escrow-backed  
**Human-owned work:** Any task touching `server/`, `shared/`, infrastructure, CI, or legal is flagged **[HUMAN-OWNED]** — the AI dev environment cannot modify those paths; a human engineer must execute these tasks.

---

## ⚑ Founder Decision Addendum (AUTHORITATIVE — overrides any conflicting text below)

Two founder decisions (2026-06-15) post-date the body of this blueprint. Where the epics conflict, **these win**. See `docs/STRATEGY_PHASE_A.md` §3 and §4.

### Override 1 — Payments = HYBRID per-listing "Protection Mode" (not a global escrow flag, not a price-based gate)
Escrow is **not** auto-applied by price threshold. The **organiser chooses per listing**, and the **buyer decides with full disclosure**:
- **Protected (escrow) deal** → funds held until delivery confirmed; transparent **buyer-protection fee** (`STRIPE_PLATFORM_FEE_BPS`) applies and is shown pre-commit; green **"Buyer Protection"** badge.
- **Direct (coordination-only) deal** → no money through the platform; **no fee**; neutral **"Direct deal — no buyer protection"** notice so the trade-off is explicit.

**Concrete overrides to the epics:**
- **E1** — the "Protected" badge is gated on **`listing.protectionMode === 'protected'`**, NOT on `pricePerSlot !== null`. Add a `listings.protectionMode` enum (`'protected' | 'direct'`) + fee-disclosure fields to `shared/schema.ts` **[HUMAN-OWNED]**. CommitDialog shows the fee line **only for Protected deals**; for Direct deals it shows a "you are settling directly with the organiser" acknowledgement.
- **E1/E9 frontend** — listing-create (`/create`) gains a **Protection Mode selector** with plain-language copy and a category-aware *recommended default* (digital/high-value → suggest Protected). The Connect-payout gate (E9) applies only to Protected deals.
- **Badge rendering** — `DiscoverListingCard` + `ListingDetails` render the correct badge from `protectionMode` everywhere a listing appears; the two modes must never be ambiguous.
- **E2** — the escrow lifecycle (charge/hold/release/refund) runs **only for `protectionMode === 'protected'`** orders. Direct deals skip all charge logic.
- **E4 interaction** — the verified-to-participate fraud floor applies to high-value deals **regardless of mode** (Direct mode must not become a fee/KYC dodge for risky stranger transactions).

### Override 2 — Liquidity wedge = geography-free DIGITAL / SaaS & subscription group buys
Wherever the body says "wedge city," "city + category," or geographic seeding, substitute the **digital wedge**:
- Seed **20–40 digital/SaaS/subscription deals** (license keys / invites / cloud credits) — drawable from the entire internet, so **no local density is required to unlock**.
- Delivery is instant & verifiable → **Protected-mode escrow release closes in minutes**, making the trust loop tight.
- Recruit organisers from **online communities where SaaS-cost-splitting already happens** (Reddit/Discord/indie-hacker/maker circles).
- **E5 metrics** are tracked by category (not city); `docs/WEDGE.md` documents the digital wedge, not a city.
- **Land-and-expand:** only after the digital loop is repeatable, add one physical metro × bulk-household wedge (that's when E7's spatial indexing / city fields earn their keep).

---

## How to Read This Document

Each **Epic** maps to one Phase-A initiative (P0-1 through P2-5). Inside each epic:
- **Issue blocks** use the compact format: `Issue / Current State / Why It Matters / Recommended Solution / Expected Impact`
- **Effort** = engineer-days (1 day = 6 productive hours)
- Complexity: **Low** (<5 days), **Medium** (5–15 days), **High** (>15 days)
- **[HUMAN-OWNED]** = must be executed by a human engineer

---

## Epic Summary Table

| Epic | Initiative | Title | Effort (eng-days) | Complexity | Priority | Phase |
|------|-----------|-------|-------------------|------------|----------|-------|
| E1 | P0-1 | Payments Posture Alignment & Legal Compliance | 8 | Medium | P0 | Stabilize |
| E2 | P0-2 | Buyer Protection — Escrow & Charge-on-Completion E2E | 18 | High | P0 | Trust |
| E3 | P0-3 | Production Hardening & Release Discipline | 12 | Medium | P0 | Stabilize |
| E4 | P0-4 | Fraud Floor — Sybil & Pump-and-Dump Defense | 10 | Medium | P0 | Trust |
| E5 | P0-5 | Liquidity Wedge — Supply Seeding & Fill-Recovery Loop | 14 | Medium | P0 | Liquidity |
| E6 | P1-1 | Lifecycle Notifications — Email + Push | 8 | Medium | P1 | Stabilize |
| E7 | P1-2 | Scale Hardening — Query Collapse & Spatial Indexing | 10 | Medium | P1 | Liquidity |
| E8 | P1-3 | Success-Story / Social-Proof Engine | 7 | Low | P1 | Liquidity |
| E9 | P1-4 | Take-Rate Monetization Live | 9 | Medium | P1 | Monetize |
| E10 | P1-5 | Trust Score Made Legible | 5 | Low | P1 | Trust |
| E11 | P2-1 | Organiser Pro Subscription | 14 | Medium | P2 | Monetize |
| E12 | P2-2 | Supplier/Vendor Lead-Gen | 10 | Medium | P2 | Scale |
| E13 | P2-5 | Test Coverage to a Credible Floor | 12 | Medium | P2 | All |

---

# EPIC E1 — Payments Posture Alignment & Legal Compliance
**Maps to:** P0-1  
**Priority:** P0 | Release Urgency: P0 (Sprint 1)

## Objective
Establish a single, internally-consistent payments posture (Path A: escrow-backed, payments-native) across all user-facing copy, legal documents, trust badges, and team documentation. No code runs correctly against a contradictory narrative.

## Business Value
Every downstream decision — KYC depth, dispute policy, investor pitch, partner contracts — forks at this decision. Resolving it unblocks Epics E2, E4, E9.

## User Stories

**US1.1 — Consistent badge messaging**  
As a buyer browsing listings, I want trust badges and tooltips to describe real buyer protection (escrow-backed), so I don't feel misled when my card is charged.  
- Acceptance: "Secure escrow-backed payment" replaces "coordination-only" on all badge UI; no badge says "no money changes hands" when escrow is enabled.

**US1.2 — Transparent fee disclosure**  
As a buyer committing to a deal, I want to see the platform fee clearly before I commit, so I know what I'm paying.  
- Acceptance: CommitDialog shows `pricePerSlot` + platform fee line-item (read from `platformFeeBps()` in `server/stripe.ts`).

**US1.3 — Legal terms aligned to Path A**  
As a legal reviewer, I want the Terms of Service and Privacy Policy to reflect money-transmission, escrow, and charge-on-completion, so there is no regulatory exposure from contradictory docs.  
- Acceptance: ToS explicitly covers: (a) hold-on-commit, (b) auto-charge on fill, (c) refund-on-expiry, (d) platform take-rate, (e) dispute resolution workflow.

**US1.4 — Internal alignment**  
As the founder/team, I want a single "source of truth" document on our payments posture, so engineering and support operate consistently.  
- Acceptance: `docs/PAYMENTS_POSTURE.md` merged to main; referenced from `CLAUDE.md` and onboarding docs.

## Technical Approach
Mostly copy, legal, and config changes. The fee amount is already read from `platformFeeBps()` in `server/stripe.ts` (default 500 bps = 5%). The `CommitDialog` in `client/src/pages/ListingDetails.tsx` (the 3-step flow at ~line 1100) needs a fee line-item injected. The `/api/listings/:id/payment-info` endpoint (protected, called by `CommitDialog`) should return a `platformFeeBps` field.

**Issue 1:** Contradictory trust badge copy  
Current State: Badges on `ListingDetails.tsx` (TrustBadgeRow component) say "Secure Group" without specifying payment protection mechanics.  
Why It Matters: Creates legal exposure and buyer confusion.  
Recommended Solution: Update badge labels and tooltip text to reference escrow/Stripe protection. Gate "Buyer Protection" badge on **`listing.protectionMode === 'protected'`** (see Founder Decision Addendum, Override 1); Direct deals render a neutral "Direct deal — no buyer protection" notice instead.  
Expected Impact: Buyer trust increase; reduced post-commit dispute rate.

**Issue 2:** CommitDialog does not show platform fee  
Current State: `CommitDialog` shows `pricePerSlot` but not the platform fee that will be charged.  
Why It Matters: Regulatory requirement in many jurisdictions (UDAP/unfair practices) and basic UX honesty.  
Recommended Solution: `/api/listings/:id/payment-info` (already exists per routes.ts) adds `platformFeeBps: number` to response; CommitDialog step 3 shows `Subtotal + Platform fee (5%) = Total`.  
Expected Impact: Eliminates chargeback "I didn't know I'd be charged X" claims.

## Database Tasks
No schema changes required. `featureFlags` table (already in `shared/schema.ts`) should have a row `escrow_enabled` (default false → flip to true per geo after legal sign-off).

Migration: Insert feature flag rows:
```sql
INSERT INTO feature_flags (key, enabled) VALUES 
  ('escrow_enabled', false),
  ('stripe_payments_enabled', false),
  ('show_platform_fee', true)
ON CONFLICT (key) DO NOTHING;
```

## API Tasks
[HUMAN-OWNED]
- `GET /api/listings/:id/payment-info` — add `platformFeeBps` field to response (currently defined in `server/routes.ts` ~line 800+)
- `GET /api/platform/fee` — public endpoint returning `{ feeBps: number, feePercent: string }` for display

## Frontend Tasks
- `client/src/pages/ListingDetails.tsx` — `CommitDialog` step 3 (confirmation summary): inject platform fee line item below price
- `client/src/pages/ListingDetails.tsx` — `TrustBadgeRow`: update copy; gate "Escrow Protected" badge on `isEscrowConfigured && listing.pricePerSlot > 0`
- `client/src/pages/ListingDetails.tsx` — "money-protection strip": update copy to match Path A language
- `client/src/pages/Terms.tsx` / `client/src/pages/Privacy.tsx` — update legal text (hand off to legal counsel; dev wires the content)

## Backend Tasks [HUMAN-OWNED]
- `server/stripe.ts`: `platformFeeBps()` is already implemented; ensure it reads from `PLATFORM_FEE_BPS` env var so it can be tuned per geo without deploy
- Legal review completion required before flipping `stripe_payments_enabled` feature flag

## QA Test Plan
- Unit: `platformFeeBps()` returns env override when set, else 500
- Integration: CommitDialog step 3 shows correct fee math at various slot prices
- E2E: buyer sees fee pre-commit; Stripe charge matches fee shown; receipt email matches
- Edge: `pricePerSlot = null` → no fee shown, no charge attempted

## Deployment Plan
1. Merge copy + badge changes (no flag needed — purely informational)
2. Deploy `show_platform_fee` feature flag = true
3. Legal sign-off → flip `stripe_payments_enabled = true` per region
4. Rollback: flip feature flags to false; no DB migration required

## Dependencies
None — this is the blocker for everything else.

## Risks
- Legal review may surface money-transmission licensing requirements per geo → mitigation: geo-phase rollout, use Stripe/Escrow as the regulated rail
- Founder veto of Path A → swap E2 scope to "commitment receipts + payment ledger" (see Phase A §3 note)

## Estimated Effort
8 engineer-days | Medium complexity

## Acceptance Criteria (Definition of Done)
- [ ] Founder sign-off on Path A in writing
- [ ] Legal review of money-transmission for launch geo completed and passed
- [ ] All badges, tooltips, and copy reference escrow/Stripe protection consistently
- [ ] CommitDialog shows fee line-item pre-commit
- [ ] ToS and Privacy Policy updated and published
- [ ] `docs/PAYMENTS_POSTURE.md` merged and referenced from `CLAUDE.md`
- [ ] `escrow_enabled` and `stripe_payments_enabled` feature flags exist in DB

---

# EPIC E2 — Buyer Protection: Escrow & Charge-on-Completion E2E
**Maps to:** P0-2  
**Priority:** P0 | Release Urgency: P0 (Sprint 2–3)

## Objective
Activate the full Path A money lifecycle in the UI: commit → hold/authorize → fill → charge → delivery confirmed → release → (or) expiry/cancel → refund. Every flow must be observable by buyer, organiser, and admin, and reconcile to the penny against Stripe and Escrow.com.

## Business Value
This closes the existential "no proof of coordination" gap. A buyer who joins knows their money is protected; an organiser who completes knows they'll get paid. Without this, Grouperry is a spreadsheet. With it, Grouperry is a marketplace with a moat.

## User Stories

**US2.1 — Commit with saved payment method**  
As a buyer, I want to enter my card once and have it saved for group-buy commits, so I don't re-enter payment info for every deal.  
- Acceptance: SetupIntent created via `POST /api/stripe/setup-intent`; card saved to Stripe Customer; `orders.stripePaymentMethodId` populated; CommitDialog confirms PM fingerprint shown.

**US2.2 — Auto-charge on fill**  
As a buyer who committed, I want my card charged automatically when the group fills, so I don't have to take a manual action.  
- Acceptance: `chargeCompletedListing()` in `server/payments.ts` runs on `listing.status → completed`; all orders with PM charged; `orders.chargeStatus = 'paid'`, `paidAt` set; buyer receives `group_completion` email.

**US2.3 — Delivery confirmation and escrow release**  
As a buyer, I want to confirm I received my item so the organiser gets paid, so I have leverage until delivery.  
- Acceptance: "Confirm Delivery" button visible to buyers on completed listings; clicking calls `POST /api/listings/:id/confirm-delivery`; when ≥ threshold (e.g. 60%) of buyers confirm → `releaseEscrow()` called; organiser receives payout notification.

**US2.4 — Auto-refund on expiry**  
As a buyer who committed to a deal that expired unfilled, I want an automatic refund, so I don't have to chase my money.  
- Acceptance: Cron job (every 15 min, already in `server/routes.ts`) on listing expire → calls `refundOrder()` for all `chargeStatus = 'authorized'` or `'paid'` orders; `orders.chargeStatus = 'refunded'`; buyer receives refund email within 10 min of expiry.

**US2.5 — Dispute workflow**  
As a buyer who has a problem with a completed deal, I want to open a dispute with evidence, so I have a formal resolution path.  
- Acceptance: Dispute button on completed listings triggers `POST /api/listings/:id/dispute`; evidence upload links to `dealProofs`; admin dispute queue shows in `/admin`; resolution closes dispute and triggers manual refund or release.

## Technical Approach

The charging infrastructure is built (`server/payments.ts`, `server/stripe.ts`, `server/escrow.ts`). The gaps are:
1. **SetupIntent UX**: Stripe's JS SDK not wired in CommitDialog
2. **Delivery confirmation endpoint**: missing
3. **Expiry-refund**: cron expires listings but does NOT currently call `refundOrder()`
4. **Dispute workflow**: `reports` table exists but no dispute-specific endpoint/UI
5. **Escrow.com production credentials**: sandbox only; need real credentials for Path A

**Issue 1:** Expiry cron does not trigger refunds  
Current State: `server/routes.ts` cron runs every 15 min and transitions listings to `expired` via `storage.transitionListing()` but does not iterate orders and call `refundOrder()`.  
Why It Matters: Buyers whose deals expire with authorized charges are not refunded automatically — a trust and legal failure.  
Recommended Solution: In the expiry cron block, after `transitionListing(id, 'expired')`, call `triggerChargeCompletedListing(id)` refund path for each `authorized`/`paid` order. [HUMAN-OWNED]  
Expected Impact: Zero manual refund tickets for expired deals; full automated lifecycle.

**Issue 2:** CommitDialog has no Stripe Elements integration  
Current State: CommitDialog step 2 shows a "payment acknowledgment" screen but no card capture. `stripePaymentMethodId` on orders is null for most users.  
Why It Matters: Without a saved PM, `chargeOnCompletion()` skips the order (`if (!order.stripePaymentMethodId) continue`).  
Recommended Solution: Embed Stripe Elements (`@stripe/react-stripe-js`) in CommitDialog step 2. Call `POST /api/stripe/setup-intent`, confirm with Stripe.js, save PM to order on commit.  
Expected Impact: 100% of orders have a saved PM → 100% auto-charge eligibility.

**Issue 3:** No delivery confirmation endpoint  
Current State: Buyers can upload `dealProofs` but there is no "I confirm delivery" action that triggers escrow release.  
Why It Matters: Escrow funds held indefinitely → organiser can't get paid.  
Recommended Solution: `POST /api/listings/:id/confirm-delivery` — sets a `deliveryConfirmedAt` on `participations` (new column); when ≥60% confirmed → call `releaseEscrow()`. [HUMAN-OWNED]  
Expected Impact: Automated payout within inspection period; zero manual release tickets.

**Issue 4:** Escrow.com in sandbox only  
Current State: `server/escrow.ts` uses `https://api.escrow-sandbox.com` hardcoded.  
Why It Matters: No real money can be held or released in production.  
Recommended Solution: Make base URL env-driven (`ESCROW_BASE_URL`); production = `https://api.escrow.com/2017-09-01`. [HUMAN-OWNED]  
Expected Impact: Production escrow transactions possible.

## Database Tasks [HUMAN-OWNED]

All changes to `shared/schema.ts` must be done by a human engineer.

**Migration M2-1:** Add `deliveryConfirmedAt` to `participations`
```sql
ALTER TABLE participations ADD COLUMN delivery_confirmed_at TIMESTAMP;
ALTER TABLE participations ADD COLUMN delivery_confirmed BOOLEAN DEFAULT FALSE NOT NULL;
CREATE INDEX idx_participations_delivery_confirmed ON participations(listing_id, delivery_confirmed);
```
Update `shared/schema.ts` `participations` table definition accordingly.

**Migration M2-2:** Add escrow transaction reference to `listings`
```sql
ALTER TABLE listings ADD COLUMN escrow_transaction_id TEXT;
ALTER TABLE listings ADD COLUMN escrow_status TEXT; -- created | funded | released | cancelled
CREATE INDEX idx_listings_escrow_tx ON listings(escrow_transaction_id) WHERE escrow_transaction_id IS NOT NULL;
```
Update `shared/schema.ts` `listings` table definition.

**Migration M2-3:** Add `disputes` table
```sql
CREATE TABLE disputes (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL REFERENCES listings(id),
  reporter_id VARCHAR NOT NULL REFERENCES users(id),
  order_id INTEGER REFERENCES orders(id),
  reason TEXT NOT NULL,
  evidence_urls JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'open' NOT NULL, -- open | under_review | resolved_refund | resolved_release
  admin_notes TEXT,
  resolved_by VARCHAR REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_disputes_listing_id ON disputes(listing_id);
CREATE INDEX idx_disputes_status ON disputes(status);
```
Add to `shared/schema.ts`.

## API Tasks [HUMAN-OWNED]

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/stripe/setup-intent` | Create SetupIntent for card capture in CommitDialog |
| POST | `/api/listings/:id/confirm-delivery` | Buyer confirms receipt; triggers escrow release threshold check |
| POST | `/api/listings/:id/dispute` | Open a dispute with reason + evidence |
| GET | `/api/listings/:id/dispute` | Get dispute status for this listing/user |
| PATCH | `/api/admin/disputes/:id` | Admin resolves dispute (refund or release) |
| GET | `/api/admin/disputes` | Admin list of open disputes |
| POST | `/api/stripe/webhook` | Stripe webhook handler (already exists; verify `payment_intent.succeeded` webhook also updates `orders.chargeStatus`) |

## Frontend Tasks

- `client/src/pages/ListingDetails.tsx` — `CommitDialog` step 2:
  - Import `@stripe/react-stripe-js` and `@stripe/stripe-js`
  - Add `<PaymentElement>` or `<CardElement>` inside an `<Elements>` provider using publishable key from env
  - On step advance: call `/api/stripe/setup-intent`, confirm setup, attach PM to commit payload
- `client/src/pages/ListingDetails.tsx` — post-completion buyer panel:
  - Add "Confirm Delivery" button visible only to `participations` members after `listing.status === 'completed'`
  - Shows confirmation count progress (e.g. "4/10 buyers confirmed")
  - Disabled after user confirms
- `client/src/pages/ListingDetails.tsx` — dispute button (already exists as `ReportCreatorButton`):
  - Upgrade to `DisputeButton` that calls new `/api/listings/:id/dispute` endpoint with evidence upload
- Admin panel (`client/src/pages/Admin.tsx` or equivalent):
  - Add "Disputes" tab showing open disputes with approve/deny resolution buttons
- New component: `client/src/components/EscrowStatusPanel.tsx` (partially exists in ListingDetails.tsx)
  - Show real-time escrow status from `listing.escrowStatus`; link to escrow transaction ID

## Backend Tasks [HUMAN-OWNED]

- `server/routes.ts`: In expiry cron, after `transitionListing(id, 'expired')`: iterate `getOrdersByListing(id)`, call `refundOrder(order.id)` for each authorized/paid order, enqueue `refund_processed` email
- `server/escrow.ts`: Make `ESCROW_BASE` env-driven (`process.env.ESCROW_BASE_URL ?? 'https://api.escrow-sandbox.com/2017-09-01'`)
- `server/payments.ts`: Add `refundCompletedListing(listingId)` — bulk refund on expiry
- `server/routes.ts`: Wire `POST /api/listings/:id/confirm-delivery` → count confirmed → if threshold met, call `releaseEscrow()`
- `server/email.ts`: Add email type `refund_processed` and `delivery_confirmed` to `buildEmailTemplate()`
- Stripe webhook handler: ensure `payment_intent.succeeded` event updates `orders.chargeStatus = 'paid'` for any orders in `authorized` state

## QA Test Plan

**Unit Tests:**
- `chargeCompletedListing()`: skips already-paid, skips no-PM, handles Stripe error gracefully (existing in `server/payments.ts`)
- `refundOrder()`: returns `{ok: false}` when no PI, calls `refundPaymentIntent` correctly
- `releaseEscrow()`: sends correct PATCH to escrow API
- Delivery confirmation threshold logic: 60% of `filledSlots` required

**Integration Tests:**
- Stripe SetupIntent flow: setup → confirm → PM saved to customer → order has PM ID
- Expiry → refund: create listing, commit with PM, expire listing via cron trigger, verify all orders show `chargeStatus = 'refunded'`
- Fill → charge: create listing, fill all slots, trigger completion, verify all eligible orders charged
- Delivery confirm → escrow release: confirm 60%+, verify `releaseEscrow` called with correct transaction ID

**E2E Tests:**
- Full buyer journey: sign up → join → commit with card → deal fills → card charged → confirm delivery → payout
- Failed payment: PM that returns decline → `chargeStatus = 'failed'` → buyer notified

**Edge Cases:**
- Race condition: two buyers join the last slot simultaneously → `participations_listing_user_unique` unique index prevents double-fill; `filled_slots_not_exceed_total` DB check constraint enforced
- Partial charge failure: 8/10 orders charged, 2 fail → listing remains completed, failed orders get `chargeStatus = 'failed'`, individual notifications sent
- Escrow API timeout: should not block listing completion; log error and queue retry
- Double-delivery confirm: idempotent — second confirm from same user is a no-op

## Deployment Plan

1. [HUMAN-OWNED] Run migrations M2-1, M2-2, M2-3 on staging DB
2. Deploy backend with `stripe_payments_enabled = false` (feature flag)
3. Deploy frontend CommitDialog with Stripe Elements (renders only if flag enabled)
4. Run E2E tests in staging with Stripe test cards
5. Legal sign-off → flip `stripe_payments_enabled = true`; flip `escrow_enabled = true`
6. Monitor first 50 live orders manually; set up Stripe webhook error alerts in Sentry
7. Rollback: flip flags to false; no data loss (orders remain in DB, no charges triggered)

## Dependencies
- E1 (posture alignment) must be complete first
- Legal review (E1) gates production Stripe/Escrow activation
- Stripe Connect onboarding (E9) required for organiser payouts

## Risks
- Stripe off-session charge failures (3DS required): mitigation — detect `requires_action` in webhook, notify buyer to re-authorize
- Escrow.com API rate limits in production: mitigation — transaction-per-listing, not per-buyer
- Partial fill then cancel: mitigation — cancel path calls `cancelEscrow()` already implemented

## Estimated Effort
18 engineer-days | High complexity

## Acceptance Criteria (Definition of Done)
- [ ] CommitDialog captures and saves payment method via Stripe Elements
- [ ] Auto-charge fires within 60 seconds of listing completion
- [ ] Expiry cron auto-refunds all authorized/paid orders
- [ ] Delivery confirm UI exists; release fires at 60% threshold
- [ ] Dispute creation and admin resolution workflow functional
- [ ] Escrow.com base URL is env-driven (sandbox vs production)
- [ ] Stripe webhook correctly updates order status on async PI events
- [ ] Ledger reconciliation script: Stripe charges + refunds match DB totals to the penny in staging
- [ ] No manual intervention required for normal lifecycle (commit → fill → charge → confirm → release)

---

# EPIC E3 — Production Hardening & Release Discipline
**Maps to:** P0-3  
**Priority:** P0 | Release Urgency: P0 (Sprint 1)

## Objective
Eliminate the class of release incidents that caused the multi-hour stale-cache outage, establish staging parity with production, instrument errors with Sentry, and document a deploy/rollback runbook.

## Business Value
Reliability is the table stake for a payments-native marketplace. A stale-UI incident during onboarding or checkout destroys trust permanently. This epic ensures the platform can be operated and recovered predictably.

## User Stories

**US3.1 — Staging environment**  
As a developer, I want a staging environment that mirrors production, so I can test changes before they affect users.  
- Acceptance: Staging URL exists; DB is a separate instance with anonymized prod data; Stripe in test mode; all env vars differ from prod.

**US3.2 — Error monitoring**  
As an on-call engineer, I want errors from both frontend and backend surfaced in Sentry with context, so I can diagnose and fix issues without waiting for user reports.  
- Acceptance: Sentry DSN configured for BE (Node) and FE (React); unhandled rejections and React Error Boundaries both report to Sentry; alert rules configured (error rate spike, new issue).

**US3.3 — Stale asset prevention**  
As a user, I want the app to always load the current version after a deploy, so I don't see a broken or outdated UI.  
- Acceptance: All JS/CSS bundles use content-hash filenames; service worker (`sw.js`) uses network-first or stale-while-revalidate with version token; a deploy flushes the SW cache within 30 seconds.

**US3.4 — Deploy & rollback runbook**  
As any team member, I want a documented one-command deploy and rollback procedure, so incidents can be recovered without tribal knowledge.  
- Acceptance: `docs/RUNBOOK.md` covers: pre-deploy checklist, deploy command, smoke tests, rollback command, DB migration rollback.

## Technical Approach

**Issue 1:** Service-worker / CDN stale-asset cache incident class  
Current State: `client/src/index.css` and `client/src/App.tsx` confirm a full frontend is built and served as a PWA. The SW can cache stale bundles; a deploy without SW cache invalidation serves the wrong version.  
Why It Matters: Caused a multi-hour outage per Phase A audit.  
Recommended Solution: (a) Vite/build tool must emit content-hashed filenames; (b) SW must include a version token (build hash) in its cache name; (c) `index.html` must be served with `Cache-Control: no-cache`; (d) deploy script calls SW update trigger. [HUMAN-OWNED for build/deploy config]  
Expected Impact: Stale-asset incident class permanently closed; new deploys visible to users within 30 seconds.

**Issue 2:** In-process cron double-fires under PM2 cluster mode  
Current State: `server/routes.ts` registers `node-cron` jobs (expire listings every 15 min, prune views daily, email queue every 5 min, expiry warnings every 6h) inside the process. Under PM2 cluster (multiple instances), every instance fires the cron simultaneously.  
Why It Matters: Double-fires cause duplicate emails, duplicate charges, and race conditions on listing state transitions.  
Recommended Solution: (a) Short term: use PM2 `instances: 1` (single-instance mode); (b) Medium term: move cron to a separate worker process or external scheduler (e.g., pg_cron, BullMQ, GitHub Actions schedule). [HUMAN-OWNED]  
Expected Impact: Zero duplicate email/charge events; safe to scale horizontally.

**Issue 3:** No error monitoring  
Current State: Errors are logged to console (`logger` in `server/logger.ts`) but not aggregated or alerted.  
Why It Matters: Silent failures in payment flows (charge errors, escrow timeouts, email failures) go undetected until users complain.  
Recommended Solution: Add `@sentry/node` to BE, `@sentry/react` to FE; configure DSN via env; wrap `registerRoutes` in Sentry Express middleware; wrap React `ErrorBoundary` with `Sentry.ErrorBoundary`. [HUMAN-OWNED for env config; code changes touch server/ and client/]  
Expected Impact: Mean time to detection drops from hours to minutes.

**Issue 4:** No staging environment  
Current State: All testing is done in production or locally.  
Why It Matters: E2 (Buyer Protection) cannot be safely tested without a staging Stripe+Escrow environment.  
Recommended Solution: Provision a staging deployment (separate Replit deployment or VPS) with `NODE_ENV=staging`, staging Stripe keys, Escrow sandbox, and a separate DB. [HUMAN-OWNED — infra work]  
Expected Impact: Safe pre-production testing; dramatically reduces regression risk.

## Database Tasks
No schema changes. Add a `deployments` table for audit purposes (optional, P2).

## API Tasks [HUMAN-OWNED]
- `GET /api/health` (already exists per routes.ts) — enhance to return: `{ status, version, gitSha, dbPing, stripePing, escrowPing, emailQueueDepth }`
- Add Sentry Express middleware around all routes

## Frontend Tasks
- Add `@sentry/react` to `client/package.json`
- Wrap `<ErrorBoundary>` in `client/src/App.tsx` with `Sentry.ErrorBoundary`
- Set `Sentry.init()` with `VITE_SENTRY_DSN` env var in `client/src/main.tsx`
- Ensure `vite.config.ts` uses `build.rollupOptions.output.entryFileNames` with `[name]-[hash].js` (content-hashed)

## Backend Tasks [HUMAN-OWNED]
- `server/index.ts` (or entry): `Sentry.init()` before `registerRoutes()`; add `Sentry.Handlers.requestHandler()` and `Sentry.Handlers.errorHandler()` middleware
- PM2 config (`ecosystem.config.js`): set `instances: 1` to prevent cron double-fire
- `server/routes.ts`: Add distributed lock check at top of each cron job (simple: check `system_events` for a lock row within the cron window before proceeding)
- Nginx/reverse proxy: set `Cache-Control: no-cache` on `/index.html`; `Cache-Control: public, max-age=31536000, immutable` on `/assets/*`

## QA Test Plan
- Deploy test: push a change; verify users get new version within 30s (check SW version token)
- Cron isolation: with 2 PM2 instances, verify expiry email is sent exactly once per listing
- Sentry: trigger a 500 error in staging; verify Sentry alert fires within 2 min
- Health endpoint: DB down → health returns 503; Stripe unconfigured → health shows `stripePing: false`

## Deployment Plan
1. [HUMAN-OWNED] Provision staging environment
2. Configure Sentry DSN (BE + FE) in both staging and prod env vars
3. Deploy Sentry integration to staging → verify error reporting
4. Deploy to prod with Sentry
5. Fix build config for content-hashed assets + SW cache invalidation
6. Update PM2 config → `instances: 1`
7. Merge `docs/RUNBOOK.md`

## Dependencies
None — this runs in parallel with E1.

## Risks
- Sentry cost at scale: mitigation — set `tracesSampleRate: 0.1` (10% trace sampling)
- PM2 `instances: 1` removes horizontal scale: mitigation — acceptable at current traffic; cron isolation is more important

## Estimated Effort
12 engineer-days | Medium complexity

## Acceptance Criteria (Definition of Done)
- [ ] Staging environment exists and mirrors prod configuration
- [ ] Sentry reporting BE + FE errors in both staging and prod
- [ ] `/api/health` returns `{ version, gitSha, dbPing, stripePing, emailQueueDepth }`
- [ ] New deploy visible to all users within 30 seconds (no stale SW)
- [ ] Cron jobs fire exactly once per window (verified in staging with 2 instances)
- [ ] `docs/RUNBOOK.md` covers deploy, rollback, DB migration rollback
- [ ] Alert rule: Sentry fires on error rate > 5/min

---

# EPIC E4 — Fraud Floor: Sybil & Pump-and-Dump Defense
**Maps to:** P0-4  
**Priority:** P0 | Release Urgency: P1 (Sprint 2–3)

## Objective
Require verified identity to participate in deals above a monetary or slot threshold, detect Sybil fill (fake accounts creating false momentum) and pump-and-dump (rapid fill then cancel), and rate-limit account creation by phone/device.

## Business Value
The core "unlock on fill" mechanic is gameable. A single bad actor can make a scam deal look legitimate (Sybil fill) or lure real buyers into almost-complete deals before cancelling (pump-and-dump). Trust is the product — fraud destroys it publicly.

## User Stories

**US4.1 — Verified participation gate**  
As a platform, I want to require phone verification before joining deals above $50 total, so bots and throwaway accounts can't fake momentum.  
- Acceptance: `POST /api/listings/:id/join` checks `user.phoneVerified` if `listing.pricePerSlot * listing.totalSlots > VERIFICATION_THRESHOLD`; returns 403 with "Verify your phone to join this deal" if not verified.

**US4.2 — Sybil fill detection**  
As an admin, I want to be alerted when a listing fills unusually fast (e.g., 5+ new accounts joining within 10 minutes), so I can review before charging.  
- Acceptance: On each join, check: (a) how many joiners in last 10 min are accounts created in the last 24h; (b) if > 50% → insert `suspicious_flags` row with `flagType = 'rapid_sybil_fill'`; notify admin; pause auto-charge via `featureFlags` per-listing override.

**US4.3 — Pump-and-dump detection**  
As an admin, I want to be alerted when a near-full listing is suddenly cancelled, so I can investigate and protect buyers.  
- Acceptance: On listing cancel: if `filledSlots / totalSlots >= 0.7` and listing is < 24h old → insert `suspicious_flags` with `flagType = 'pump_and_dump'`; freeze organiser's ability to create new listings pending admin review.

**US4.4 — Device/phone rate-limit on account creation**  
As a platform, I want to limit how many accounts can be created per phone number, so one person can't create unlimited accounts.  
- Acceptance: Phone OTP system (`phoneOtps` table in schema.ts) enforces: max 1 account per phone number (unique constraint); OTP rate limit (already `otpLimiter` in routes.ts: 3 per 5 min); admin can see all accounts sharing a phone.

## Technical Approach

**Issue 1:** Join endpoint has no verification gate for high-value deals  
Current State: `POST /api/listings/:id/join` (in `server/routes.ts`) checks `phoneVerified` only for listing creation, not for joining.  
Why It Matters: Any unverified account can join any deal and fake slot fill.  
Recommended Solution: Add verification gate in join handler: `if (listing.pricePerSlot * listing.totalSlots > VERIFICATION_THRESHOLD && !user.phoneVerified) → 403`. Threshold configurable via `siteSettings` table. [HUMAN-OWNED]  
Expected Impact: Eliminates throwaway-account participation in real-money deals.

**Issue 2:** `suspicious_flags` table exists but fraud detection heuristics are not wired to the join event  
Current State: `suspiciousFlags` table (schema.ts lines 207–217) exists with `flagType`, `details`, `resolved`. Some admin AI analysis endpoint exists but it's not automatic.  
Why It Matters: Fraud is detected only by manual review, too slow for live deals.  
Recommended Solution: Inline async fraud check after successful join: query `participations` count + `users.createdAt` for last 10 min; if Sybil pattern → insert flag, notify admin via email queue. [HUMAN-OWNED]  
Expected Impact: Real-time fraud flagging; admin response within minutes.

## Database Tasks [HUMAN-OWNED]

**Migration M4-1:** Add `listingId` to `suspicious_flags` for per-listing flags
```sql
ALTER TABLE suspicious_flags ADD COLUMN listing_id INTEGER REFERENCES listings(id);
CREATE INDEX idx_suspicious_flags_listing_id ON suspicious_flags(listing_id) WHERE listing_id IS NOT NULL;
```
Update `shared/schema.ts`.

**Migration M4-2:** Add `phone` unique constraint to `users` (check if already exists in `shared/models/auth.ts`)
```sql
-- Only if not already enforced:
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique ON users(phone) WHERE phone IS NOT NULL;
```

**Migration M4-3:** Add fraud thresholds to `site_settings`
```sql
INSERT INTO site_settings (key, value) VALUES
  ('verification_threshold_cents', '5000'),
  ('sybil_window_minutes', '10'),
  ('sybil_new_account_ratio', '0.5'),
  ('pump_dump_fill_threshold', '0.7')
ON CONFLICT (key) DO NOTHING;
```

## API Tasks [HUMAN-OWNED]

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/listings/:id/join` | Add verification gate check before join |
| GET | `/api/admin/fraud-flags` | List unresolved `suspicious_flags` with listing context |
| PATCH | `/api/admin/fraud-flags/:id/resolve` | Admin resolves flag; optionally freezes organiser |
| POST | `/api/admin/users/:id/freeze` | Freeze organiser listing creation |

## Frontend Tasks
- `client/src/pages/ListingDetails.tsx` — join button / `CommitDialog`: handle 403 `phoneVerified` error → show inline prompt "Verify your phone to join deals over $X"
- Admin panel: add "Fraud Flags" tab listing unresolved `suspicious_flags` with listing link, flagType badge, and Resolve button
- Listing detail: show "Under Review" badge if organiser is frozen (fetched from user status)

## Backend Tasks [HUMAN-OWNED]
- `server/routes.ts` join handler: add verification gate + async fraud check (Sybil detection)
- `server/routes.ts` cancel handler: add pump-and-dump check
- `server/email.ts`: add `fraud_alert` email template for admin notification

## QA Test Plan
- Unit: Sybil detection function — 4 new accounts in 10 min / 8 total → flag; 1 new account / 8 total → no flag
- Integration: join with unverified phone on $100 deal → 403; join with verified phone → 200
- Integration: rapid join simulation → `suspicious_flags` row inserted within 1s
- E2E: cancel a 75%-full listing → admin receives fraud alert email; organiser cannot create new listing
- Edge: 100% fill by legitimate users (all accounts >30 days old) → no Sybil flag

## Deployment Plan
1. Deploy fraud detection logic with `fraud_detection_enabled` feature flag = false (shadow mode — logs flags but takes no action)
2. Run for 1 week in shadow mode; tune thresholds against real traffic
3. Flip to enforcement mode
4. Rollback: flip flag to false

## Dependencies
- E1 (posture): verification threshold values depend on price per slot, which requires P0-1 complete
- E2 (buyer protection): fraud detection should pause auto-charge on flagged listings

## Risks
- False positives (legitimate flash-sale fills flagged): mitigation — shadow mode tuning period; manual admin review before organiser freeze
- Phone verification bypass via VOIP: mitigation — carrier lookup for VOIP rejection (future; not P0)

## Estimated Effort
10 engineer-days | Medium complexity

## Acceptance Criteria (Definition of Done)
- [ ] Join gate: unverified users blocked from high-value deals (≥ threshold cents)
- [ ] Sybil detection fires within 1s of triggering join
- [ ] Pump-and-dump detection fires on cancel of ≥70%-full listings
- [ ] Admin fraud flag dashboard functional
- [ ] Organiser freeze blocks new listing creation
- [ ] Thresholds configurable via `site_settings` without deploy
- [ ] Zero false positives in staging against seeded test data

---

# EPIC E5 — Liquidity Wedge: Supply Seeding & Fill-Recovery Loop
**Maps to:** P0-5  
**Priority:** P0 | Release Urgency: P1 (Sprint 3–4)

## Objective
Define and instrument the go-to-market wedge — **geography-free digital / SaaS & subscription group buys** (see Founder Decision Addendum, Override 2) — seed 20–40 digital supply deals, and replace the current silent expiry with an active "didn't fill" recovery loop (extend/notify/rollover). Metrics are tracked by category, not city; no local density is required to unlock a digital deal.

## Business Value
A marketplace with no repeatable fills is not a marketplace. This epic converts the platform from a feature set into a functioning two-sided market in a bounded geography/category. The North Star Metric (Weekly Successfully-Completed Group Value) cannot move without this.

## User Stories

**US5.1 — Fill-rate dashboard**  
As the founder, I want to see fill-rate and time-to-fill metrics per category/city, so I can measure wedge progress.  
- Acceptance: Admin panel shows: active listings count, total fill-rate %, median time-to-fill (hours), completion rate % — filterable by category, country, and date range.

**US5.2 — "Didn't fill" extend flow**  
As a group organiser whose deal didn't fill, I want to extend the deadline with one click, so I don't lose committed participants and have to start over.  
- Acceptance: On listing expiry with `filledSlots > 0` and `filledSlots < totalSlots`: organiser receives email "Your deal expired — extend it?" with a one-click link; clicking calls `POST /api/listings/:id/extend`; extends `expiresAt` by 7 days; all participants notified.

**US5.3 — "Didn't fill" rollover flow**  
As a group organiser, I want to offer participants in an expired deal the option to roll over to a new deal, so I retain demand.  
- Acceptance: `POST /api/listings/:id/rollover` creates a new listing with same params, copies all committed participants to the new listing's `participations`, sends email with new listing link to all.

**US5.4 — Seeded supply deals**  
As a potential buyer browsing the wedge city, I want to see active, legitimate deals when I arrive, so the platform doesn't feel empty.  
- Acceptance: ≥10 real seeded deals live in wedge city/category on launch day; each has a real organiser (staff or partner), real product, real price; fill-rate tracked.

**US5.5 — Waitlist-to-fill notification**  
As a waitlisted user, I want to be notified when a spot opens (e.g. someone leaves), so I can join immediately.  
- Acceptance: On participant leave: if `waitlists` has entries for that listing, first-in-line user receives email + push notification within 60 seconds; `waitlists.notified = true`.

## Technical Approach

**Issue 1:** Listing expiry is silent — no recovery loop  
Current State: Cron in `server/routes.ts` transitions `active` → `expired` but does not notify the organiser or offer recovery options. The organiser sees nothing; committed participants get no communication.  
Why It Matters: Silent expiry destroys accumulated demand. A group that almost filled but expired is 90% of the way to a conversion; abandoning it is a liquidity leak.  
Recommended Solution: On expiry with `filledSlots > 0`, enqueue: (a) `expiry_recovery_organiser` email with extend/rollover links; (b) `expiry_recovery_participant` email informing them. Add extend and rollover endpoints. [HUMAN-OWNED]  
Expected Impact: Estimated 30–50% of almost-filled expired deals recover via extend.

**Issue 2:** No fill-rate or time-to-fill instrumentation  
Current State: `listing_views` table tracks views; `participations.joinedAt` tracks join timestamps; `listings.status` tracks completion. But no aggregated fill-rate metric is computed.  
Why It Matters: Without measurement, wedge progress is invisible.  
Recommended Solution: Add `/api/admin/metrics` endpoint computing: fill-rate = `completed / (completed + expired)`; median time-to-fill = median(`completedAt - createdAt`) for completed listings. Store `completedAt` on `listings`. [HUMAN-OWNED]  
Expected Impact: Founder can see wedge traction in real time.

**Issue 3:** `lat/lng` stored as TEXT prevents geofenced wedge filtering  
Current State: `listings.latitude` and `listings.longitude` are `text` columns (schema.ts line 23–24). Geographic filtering is done via runtime CAST and string comparison.  
Why It Matters: Wedge requires filtering by city/radius; TEXT coordinates are slow and inaccurate at scale.  
Recommended Solution: This is addressed in E7 (P1-2 Scale Hardening). For the wedge short-term: add `country` + `city` text fields (already: `country` exists; add `city` if missing) and filter by those for the wedge. Spatial index migration deferred to E7. [HUMAN-OWNED]  
Expected Impact: Wedge can be geofenced by city name without spatial index for now.

## Database Tasks [HUMAN-OWNED]

**Migration M5-1:** Add `completedAt` to `listings`
```sql
ALTER TABLE listings ADD COLUMN completed_at TIMESTAMP;
CREATE INDEX idx_listings_completed_at ON listings(completed_at) WHERE completed_at IS NOT NULL;
```

**Migration M5-2:** Add `city` to `listings` (if not already in schema)
```sql
ALTER TABLE listings ADD COLUMN city TEXT;
CREATE INDEX idx_listings_city ON listings(city);
```

**Migration M5-3:** Add fill-rate metrics view
```sql
CREATE OR REPLACE VIEW fill_rate_metrics AS
SELECT 
  category,
  country,
  city,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
  COUNT(*) FILTER (WHERE status IN ('completed','expired')) AS closed_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*) FILTER (WHERE status IN ('completed','expired')), 0), 1) AS fill_rate_pct,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (completed_at - created_at))/3600) FILTER (WHERE status = 'completed') AS median_time_to_fill_hours
FROM listings
WHERE created_at > NOW() - INTERVAL '90 days'
GROUP BY category, country, city;
```

## API Tasks [HUMAN-OWNED]

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/listings/:id/extend` | Organiser extends expired listing by 7 days |
| POST | `/api/listings/:id/rollover` | Create new listing from expired, copy participants |
| GET | `/api/admin/metrics` | Fill-rate, time-to-fill, completion rate by category/city |
| GET | `/api/admin/metrics/export` | CSV export of metrics |

## Frontend Tasks
- Admin panel: new "Metrics" tab with fill-rate bar chart by category, time-to-fill histogram, and completion rate KPI cards
- `client/src/pages/ListingDetails.tsx` — expired listing view: show "Extend Deal" and "Create New" CTAs for organiser (instead of dead-end expired state)
- Extend confirmation dialog: shows new expiry date, notifies participants count

## Backend Tasks [HUMAN-OWNED]
- `server/routes.ts` expiry cron: add recovery email enqueue after transition to `expired`
- `server/email.ts`: add `expiry_recovery_organiser` and `expiry_recovery_participant` email templates
- `server/routes.ts` waitlist leave handler: on participant leave, check `waitlists` and notify first entry

## QA Test Plan
- Integration: list expires with 5/10 slots → organiser gets recovery email; participants get notification
- Integration: `POST /extend` → `expiresAt` += 7 days; all participants get notification
- Integration: `POST /rollover` → new listing created with same params; all participants added; new listing ID returned
- Integration: participant leaves → waitlist user notified within 60s
- E2E: Metrics dashboard shows correct fill-rate for seeded data

## Deployment Plan
1. Seed wedge deals (10+ listings in target city/category) — manual content operation
2. Deploy extend/rollover endpoints
3. Deploy metrics dashboard
4. Monitor fill-rate weekly; adjust deal params (pricing, slot count) based on data

## Dependencies
- E3 (ops hardening) for reliable cron execution
- E6 (notifications) for recovery emails to reach users

## Risks
- Extend loop could keep zombie deals alive forever: mitigation — max 3 extensions per listing (config in `site_settings`)
- Rollover creates duplicate demand for the same product: mitigation — rollover requires organiser confirmation; original listing archived

## Estimated Effort
14 engineer-days | Medium complexity

## Acceptance Criteria (Definition of Done)
- [ ] Expiry cron sends recovery emails to organiser + participants within 5 min of expiry
- [ ] Extend endpoint functional; extends by 7 days; all participants notified
- [ ] Rollover endpoint functional; new listing created with participants copied
- [ ] Metrics dashboard shows fill-rate, time-to-fill, completion rate
- [ ] ≥10 seeded supply deals in wedge city on launch day
- [ ] Waitlist leave → notification within 60 seconds
- [ ] Max extension limit (3) enforced via `site_settings`

---

# EPIC E6 — Lifecycle Notifications: Email + Push
**Maps to:** P1-1  
**Priority:** P1 | Release Urgency: P0 (Sprint 1)

## Objective
Wire all critical email queue triggers (join confirmed, deal filled, deal completed, expiring) and add web push + mobile push. Connect the built-but-disconnected email queue to all lifecycle events that currently fire silently.

## Business Value
Without notifications, retention is impossible. A buyer who committed but never heard from the platform again is a churned user. Email triggers are the cheapest, highest-ROI retention lever available.

## User Stories

**US6.1 — Join confirmation email**  
As a buyer who just joined a group deal, I want an immediate confirmation email, so I have a record and feel confident.  
- Acceptance: Within 60s of `POST /api/listings/:id/join`, `emailQueue` has a `group_commit_confirmed` row for the joining user; email delivered (Resend) with deal title, slot count, organiser name.

**US6.2 — Deal-filled notification**  
As a committed buyer, I want a "your group is full!" notification the moment the deal fills, so I know charging is imminent.  
- Acceptance: When `filledSlots = totalSlots`, enqueue `group_completion` email for all participants; web push notification if permission granted.

**US6.3 — Expiry warning**  
As an organiser, I want a 24-hour warning before my deal expires, so I can promote it.  
- Acceptance: `expiry_warning` email already exists in `server/email.ts`; cron already runs every 6h for this; verify it is correctly wired to the email queue (not just logged).

**US6.4 — Web push notifications**  
As a user on a desktop browser, I want to receive push notifications for my active deals, so I don't have to check the app.  
- Acceptance: User can enable push in notification prefs; `VAPID` keys configured; `POST /api/push/subscribe` stores subscription; push fires on deal-fill and expiry events.

**US6.5 — Notification preferences**  
As a user, I want to control which notifications I receive, so I'm not spammed.  
- Acceptance: Notification prefs page (exists per `App.tsx` routes `/notifications`) lets users toggle email/push per event type; preferences stored in `users` table or separate `notification_prefs` table; unsubscribe link in every email.

## Technical Approach

**Issue 1:** Email queue exists but triggers are inconsistently wired  
Current State: `emailQueue` table and `processEmailQueue()` in `server/email.ts` exist. `buildEmailTemplate()` supports: `group_completion`, `group_commit_confirmed`, `milestone_advanced`, `expiry_warning`, `verification_update`, `new_announcement`, `saved_search_alert`, `waitlist_spot_available`, `referral_reward`. However, audit of `server/routes.ts` shows not all join/fill/completion events call `db.insert(emailQueue, ...)`.  
Why It Matters: Email queue exists on paper; real users don't receive emails.  
Recommended Solution: Audit every lifecycle event in `server/routes.ts` and insert into `emailQueue` at each. [HUMAN-OWNED]  
Expected Impact: 100% of lifecycle events produce emails; D1 retention improves.

**Issue 2:** No web push implementation  
Current State: `client/src/App.tsx` imports a `PWAInstallBanner` and has service worker; no Web Push (VAPID) implementation exists.  
Why It Matters: Mobile-first users need push for time-sensitive deal fills.  
Recommended Solution: Add `web-push` to backend; generate VAPID keys; `POST /api/push/subscribe` stores `PushSubscription`; trigger push alongside email queue. [HUMAN-OWNED]  
Expected Impact: Push notification open rates ~5x email for time-sensitive events.

## Database Tasks [HUMAN-OWNED]

**Migration M6-1:** Add `notification_prefs` table
```sql
CREATE TABLE notification_prefs (
  user_id VARCHAR PRIMARY KEY REFERENCES users(id),
  email_join_confirmed BOOLEAN DEFAULT TRUE,
  email_deal_filled BOOLEAN DEFAULT TRUE,
  email_deal_completed BOOLEAN DEFAULT TRUE,
  email_expiry_warning BOOLEAN DEFAULT TRUE,
  email_announcements BOOLEAN DEFAULT TRUE,
  email_saved_search BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT FALSE,
  push_deal_filled BOOLEAN DEFAULT TRUE,
  push_expiry_warning BOOLEAN DEFAULT TRUE,
  push_subscription JSONB, -- Web Push subscription object
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Tasks [HUMAN-OWNED]

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/user/notification-prefs` | Get current user's prefs |
| PUT | `/api/user/notification-prefs` | Update prefs |
| POST | `/api/push/subscribe` | Save Web Push subscription |
| DELETE | `/api/push/subscribe` | Remove push subscription |

## Frontend Tasks
- `client/src/pages/Notifications.tsx` (already routed in App.tsx): build notification prefs UI with toggles per event type; save to API
- `client/src/App.tsx`: after user logs in, prompt for push permission; if granted, register service worker push subscription; call `/api/push/subscribe`
- Service worker (`public/sw.js`): add `push` event listener; show notification with title/body from push payload

## Backend Tasks [HUMAN-OWNED]
- `server/routes.ts` join handler: after successful join → `db.insert(emailQueue, { userId, emailType: 'group_commit_confirmed', payload: { listingId, listingTitle } })`
- `server/routes.ts` completion handler: iterate participants → bulk insert `group_completion` emails + trigger push for each subscriber
- `server/routes.ts` expiry warning cron: verify it inserts into `emailQueue` (not just logs); confirm `processEmailQueue` cron is running (every 5 min)
- `server/push.ts` (new file): `sendPushToUser(userId, payload)` — look up `notification_prefs.push_subscription`, call `webpush.sendNotification()`

## QA Test Plan
- Integration: join a listing → `emailQueue` has `group_commit_confirmed` within 1s; processed within 5 min; Resend API call verified
- Integration: listing fills → all participant emails enqueued within 1s
- Integration: push subscription stored → push notification delivered on fill
- E2E: user opts out of email_deal_filled → no email on fill; other users still receive
- Edge: Resend API down → `retryCount` incremented; alert after 3 retries; `status = 'failed'`

## Deployment Plan
1. Run migration M6-1
2. Deploy email trigger wiring (HUMAN-OWNED backend change)
3. Deploy push subscription endpoint
4. Deploy notification prefs UI
5. Generate VAPID keys (one-time, per environment); set env vars
6. Smoke test in staging: join → email in Resend dashboard within 5 min

## Dependencies
- E3 (ops hardening) for reliable cron
- Resend API key must be configured in prod (`RESEND_API_KEY`)

## Risks
- Email deliverability: mitigation — ensure `noreply@grouperry.com` domain is verified in Resend; add SPF/DKIM records
- Push permission prompt fatigue: mitigation — only request push permission after user's first successful join

## Estimated Effort
8 engineer-days | Medium complexity

## Acceptance Criteria (Definition of Done)
- [ ] Join, fill, completion, expiry events all insert into `emailQueue` consistently
- [ ] `processEmailQueue` cron delivers emails via Resend within 5 min
- [ ] Web Push subscription stored and push notification delivered on deal fill
- [ ] Notification prefs UI functional; opt-out respected
- [ ] Unsubscribe link in all emails works (removes subscription)
- [ ] Email delivery rate ≥95% in staging (Resend dashboard)

---

# EPIC E7 — Scale Hardening: Query Collapse & Spatial Indexing
**Maps to:** P1-2  
**Priority:** P1 | Release Urgency: P2 (Sprint 3–4)

## Objective
Collapse the 9-query listing-detail handler into ≤3 queries, bucket `listing_views` to prevent unbounded growth, and migrate `lat/lng` from TEXT to a spatial type with an index.

## Business Value
Current architecture fails at ~300–500 concurrent users (Phase A audit). A marketplace that works until it gets traction, then breaks, is unfundable. Fix before the liquidity wedge drives traffic.

## User Stories

**US7.1 — Fast listing detail load**  
As a buyer, I want listing pages to load in < 800ms at 1,000 concurrent users, so I'm not frustrated.  
- Acceptance: p95 listing detail response time ≤ 800ms under 1k concurrent load (k6 test).

**US7.2 — Accurate view counts without DB bloat**  
As an organiser, I want accurate "views today" counts, without my DB table growing by millions of rows per month.  
- Acceptance: `listing_views` is bucketed to hourly counts; view count queries use the bucketed table; raw insert rate reduced by 60x.

**US7.3 — Radius search**  
As a buyer, I want to search for deals within 50km of my location, so I find relevant local deals.  
- Acceptance: `/api/listings` with `lat`, `lng`, `radius` params returns only listings within the radius using a spatial index; < 100ms for 10k listings.

## Technical Approach

**Issue 1:** Listing detail loads 8 parallel queries + 1 serial  
Current State: `server/routes.ts` lines 207–216: `Promise.all([messages, images, updates, viewCount, tags, joinedToday, viewsToday, participants])` — 8 parallel queries after the initial listing fetch. While parallel, this is 2 round-trips and pulls large datasets (all messages, all participants) into Node.js memory.  
Why It Matters: At 500 concurrent users, the DB connection pool (typically 10–20 connections) is exhausted; p95 latency spikes to 5s+.  
Recommended Solution: (a) Use a single SQL query with CTEs or JOIN for listing + participants + images + tags + update count; (b) separate query for messages (paginated, not full load); (c) cache the combined result with the existing `cache.set(cacheKey, result, 15_000)` (already present). [HUMAN-OWNED]  
Expected Impact: Listing detail drops from 8 DB queries to 2; DB pool pressure reduced 4x.

**Issue 2:** `listing_views` inserts per pageview, grows unbounded  
Current State: `listingViews` table in schema.ts (line 151) inserts one row per view. At 10k views/day, this is 3.65M rows/year for a single metric.  
Why It Matters: `getViewsTodayCount()` and `getViewCount()` scan this table; at scale, these queries slow down and can take down the listing detail endpoint.  
Recommended Solution: (a) Add `listing_view_buckets` table with `(listing_id, hour, view_count)` — upsert on each view; (b) keep `listing_views` for detailed analytics but stop using it for display counts; (c) `prune_views` cron (already exists, daily) moves raw rows to `listing_view_buckets` then deletes. [HUMAN-OWNED]  
Expected Impact: `getViewsTodayCount()` changes from a table scan to a single-row lookup; listing_views growth rate cut 60x.

**Issue 3:** lat/lng stored as TEXT, no spatial index  
Current State: `listings.latitude` and `listings.longitude` are `text` (schema.ts lines 23–24). Radius search in `server/storage.ts` does `CAST(latitude AS FLOAT)` per row at query time.  
Why It Matters: Full-table scan with runtime CAST on every radius query; fails at 10k listings.  
Recommended Solution: Migrate to `FLOAT8` columns + `CREATE INDEX idx_listings_location ON listings(latitude, longitude)` for basic radius; or use PostGIS `POINT` + `ST_DWithin` for true geodesic. Start with FLOAT8 composite index. [HUMAN-OWNED]  
Expected Impact: Radius search from O(n) CAST scan to O(log n) index scan.

## Database Tasks [HUMAN-OWNED]

**Migration M7-1:** Add `listing_view_buckets` table
```sql
CREATE TABLE listing_view_buckets (
  listing_id INTEGER NOT NULL REFERENCES listings(id),
  hour TIMESTAMP NOT NULL, -- truncated to hour
  view_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (listing_id, hour)
);
CREATE INDEX idx_view_buckets_listing_hour ON listing_view_buckets(listing_id, hour DESC);
```

**Migration M7-2:** Migrate lat/lng to FLOAT8
```sql
-- Run in a transaction with a lock or use a background migration
ALTER TABLE listings 
  ADD COLUMN lat_f FLOAT8,
  ADD COLUMN lng_f FLOAT8;

UPDATE listings SET 
  lat_f = CASE WHEN latitude ~ '^-?[0-9]+\.?[0-9]*$' THEN latitude::FLOAT8 ELSE NULL END,
  lng_f = CASE WHEN longitude ~ '^-?[0-9]+\.?[0-9]*$' THEN longitude::FLOAT8 ELSE NULL END;

CREATE INDEX idx_listings_lat_lng ON listings(lat_f, lng_f) WHERE lat_f IS NOT NULL AND lng_f IS NOT NULL;

-- After backfill verified, swap column names (requires app deploy):
-- ALTER TABLE listings RENAME COLUMN latitude TO latitude_text_deprecated;
-- ALTER TABLE listings RENAME COLUMN lat_f TO latitude;
```

Add to `shared/schema.ts` after human migration. Update storage queries to use new columns.

## API Tasks [HUMAN-OWNED]
- `server/storage.ts` `getViewCount()` and `getViewsTodayCount()`: rewrite to query `listing_view_buckets`
- `server/storage.ts` `getListings()` radius filter: update to use `lat_f`/`lng_f` FLOAT8 columns with index-friendly bounding-box pre-filter
- `server/routes.ts` view insertion: change from `db.insert(listingViews)` to `db.execute(sql\`INSERT INTO listing_view_buckets ... ON CONFLICT DO UPDATE SET view_count = view_count + 1\`)`

## Frontend Tasks
No frontend changes required for this epic.

## Backend Tasks [HUMAN-OWNED]
- Refactor `getListing()` and parallel queries into a stored procedure or CTE-based query
- Load test suite: write k6 script targeting `GET /api/listings/:id` at 1k VU; run on staging

## QA Test Plan
- Performance: k6 load test 1k VU on listing detail → p95 ≤ 800ms
- Correctness: `listing_view_buckets` count matches `listing_views` count after migration backfill
- Radius search: 10k seeded listings; radius search returns only those within specified km; verified against known distance
- Edge: lat/lng migration — listings with null or invalid coordinates get null FLOAT8; not excluded from non-radius search

## Deployment Plan
1. Run M7-1 (non-breaking, additive)
2. Deploy view-bucketing write path alongside old write path (dual-write for 1 week)
3. Verify bucket counts match raw counts; switch read path to buckets
4. Remove raw write path; run M7-2 (lat/lng migration — requires maintenance window for UPDATE on large table)
5. Deploy storage query updates
6. Rollback: view-bucketing is additive; lat/lng rollback means reverting the column rename (keep `latitude_text_deprecated` until confident)

## Dependencies
- E5 (liquidity wedge) may drive traffic that triggers scale issues; E7 should be deployed before or during E5

## Risks
- lat/lng migration on live table: mitigation — use `ADD COLUMN` + background UPDATE in batches of 1000 rows; swap at zero-traffic window
- Dual-write period creates inconsistency: mitigation — cron reconciliation daily

## Estimated Effort
10 engineer-days | Medium complexity

## Acceptance Criteria (Definition of Done)
- [ ] Listing detail: ≤ 3 DB queries per request
- [ ] `listing_view_buckets` table live; view counts served from buckets
- [ ] `listing_views` raw insert rate dropped by ≥ 60x
- [ ] `lat_f`/`lng_f` FLOAT8 columns populated; index created; radius search uses index
- [ ] k6 load test: p95 ≤ 800ms at 1,000 concurrent users on listing detail
- [ ] No regressions on listing detail data completeness

---

# EPIC E8 — Success-Story / Social-Proof Engine
**Maps to:** P1-3  
**Priority:** P1 | Release Urgency: P2 (Sprint 4)

## Objective
Surface completed deals as social proof — testimonials, completion stats, organiser track records — so new visitors can see evidence that Grouperry works, reducing conversion friction.

## Business Value
Completed deals currently vanish into `status = 'completed'` invisibility. Each is a testimonial, an SEO page, and a growth loop trigger (participants share success). Not surfacing them is leaving compounding free value on the table.

## User Stories

**US8.1 — Completed deal showcase**  
As a visitor, I want to see recently completed group deals with participant counts and savings, so I understand what's possible.  
- Acceptance: `/discover` or landing page shows "Recently Completed" section with ≥5 completed deals; each shows: title, category, participant count, savings %, completion date.

**US8.2 — Organiser track record**  
As a buyer considering a deal, I want to see the organiser's completion history ("12 deals completed, 100% delivery rate"), so I can trust them.  
- Acceptance: Organiser profile card on listing detail shows: deals organised count, completion rate %, average time-to-fill.

**US8.3 — Review prompt post-completion**  
As a completed deal participant, I want a prompt to leave a review, so future buyers can see social proof.  
- Acceptance: 48h after `listing.status → completed`, email queued to all participants with "Rate your experience" CTA; review modal pre-filled with listing title.

## Technical Approach

**Issue 1:** Completed listings are not discoverable  
Current State: `GET /api/listings` filters `status = 'active'` only. Completed deals are only visible at `/listings/:id`.  
Why It Matters: Social proof is invisible; SEO benefit of completed deal pages is lost.  
Recommended Solution: Add `GET /api/listings/completed` (paginated, last 90 days); add "Recently Completed" section to discover page; add JSON-LD markup to completed listing detail for SEO. [HUMAN-OWNED for API endpoint]  
Expected Impact: 20–30% conversion uplift on deals similar to showcased completions (standard social proof lift).

**Issue 2:** Organiser track record not computed or displayed  
Current State: `reliabilityScore` is stored on users. But "N deals completed, X% delivery rate" is not derived from the data.  
Why It Matters: Numeric score without context ("80%") is meaningless; "12 deals, 100% delivery" is compelling.  
Recommended Solution: Compute derived stats in `/api/users/:id/reliability` endpoint: `completedDealsCount`, `completionRate`, `avgTimeToFillHours`, `avgRating`. Cache for 1h. [HUMAN-OWNED]  
Expected Impact: Buyer trust in organiser increases; reduces pre-join "who is this person?" abandonment.

## Database Tasks [HUMAN-OWNED]
No new tables required. Add a DB view:
```sql
CREATE OR REPLACE VIEW organiser_stats AS
SELECT 
  l.creator_id,
  COUNT(*) FILTER (WHERE l.status = 'completed') AS completed_deals,
  COUNT(*) AS total_deals,
  ROUND(100.0 * COUNT(*) FILTER (WHERE l.status = 'completed') / NULLIF(COUNT(*), 0), 1) AS completion_rate,
  AVG(EXTRACT(EPOCH FROM (l.completed_at - l.created_at))/3600) FILTER (WHERE l.status = 'completed' AND l.completed_at IS NOT NULL) AS avg_time_to_fill_hours,
  AVG(r.rating) AS avg_rating
FROM listings l
LEFT JOIN reviews r ON r.listing_id = l.id
WHERE l.created_at > NOW() - INTERVAL '365 days'
GROUP BY l.creator_id;
```

## API Tasks [HUMAN-OWNED]

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/listings/completed` | Paginated recently-completed deals for showcase |
| GET | `/api/users/:id/reliability` | Extended organiser stats (count, rate, avg rating) |

## Frontend Tasks
- `client/src/pages/Discover.tsx` (or landing page): add "Recently Completed" section with deal cards showing savings disc (`gp-savings-disc` CSS class already in `index.css`)
- `client/src/pages/ListingDetails.tsx` — organiser card: replace "Reliability: 80%" with "12 deals completed · 3.2h avg fill · ★4.8"
- `client/src/pages/ListingDetails.tsx` — post-completion: 48h after completion, show review prompt banner to participants
- JSON-LD on completed listing detail pages (already partially implemented per ListingDetails.tsx SEO section): add `aggregateRating` and `numberOfParticipants`

## Backend Tasks [HUMAN-OWNED]
- `server/email.ts`: add `review_prompt` email template
- `server/routes.ts` completion handler: enqueue `review_prompt` for all participants, delayed 48h (or use `processedAt + 48h` logic in email queue)

## QA Test Plan
- Integration: completed listing appears in `/api/listings/completed` within 60s of status change
- Integration: organiser stats match manual counts from `listings` and `reviews` tables
- E2E: user completes a deal → 48h review prompt email queued → review submitted → shows on listing
- SEO: JSON-LD on completed listing page validates via Google Rich Results Test

## Deployment Plan
1. Create DB view (non-breaking)
2. Deploy API endpoints
3. Deploy frontend "Recently Completed" section
4. Populate with real completed deals in staging (seed test completions)

## Dependencies
- E2 (buyer protection) for delivery confirmation → review prompt trigger

## Risks
- Completed deals with sensitive prices exposed publicly: mitigation — review ToS on what data is shown; default to showing percentage savings, not absolute price, until legal review

## Estimated Effort
7 engineer-days | Low complexity

## Acceptance Criteria (Definition of Done)
- [ ] "Recently Completed" section live on discover/landing page with ≥5 deals
- [ ] Organiser profile shows narrative stats ("12 deals, 100% delivery")
- [ ] Review prompt email queued 48h post-completion
- [ ] JSON-LD on completed listing pages validates
- [ ] `/api/listings/completed` paginated and cached (5-min TTL)

---

# EPIC E9 — Take-Rate Monetization Live
**Maps to:** P1-4  
**Priority:** P1 | Release Urgency: P2 (Sprint 4–5)

## Objective
Activate the platform fee transparently, complete organiser payout onboarding (Stripe Connect Express), and generate buyer/organiser receipts. Net revenue per completed deal must be measurable.

## Business Value
The take-rate infrastructure (Stripe Connect, `applicationFeeCents()`, `chargeOnCompletion()`) is built but dormant. Each completed deal generates zero revenue today. Turning it on with the built code is the highest-ROI engineering action in the backlog.

## User Stories

**US9.1 — Organiser payout onboarding**  
As an organiser, I want to connect my bank account to receive payouts, so I can actually get paid when my deal completes.  
- Acceptance: Profile page shows "Connect Bank Account" → calls `POST /api/stripe/connect-onboarding` → redirects to Stripe Express onboarding → on return, `users.stripePayoutsEnabled = true`.

**US9.2 — Transparent platform fee**  
As a buyer, I want to see the platform fee before I commit, so I'm not surprised.  
- Acceptance: CommitDialog step 3 shows: `Subtotal: $X · Platform fee (5%): $Y · Total: $Z`.

**US9.3 — Buyer receipt**  
As a buyer who was charged, I want an email receipt with amount, deal, and platform fee breakdown, so I have a record for expense claims or disputes.  
- Acceptance: After successful Stripe charge, `charge_receipt` email sent to buyer with: deal title, amount charged, fee, net amount to organiser, Stripe payment intent ID.

**US9.4 — Organiser receipt / payout confirmation**  
As an organiser, I want an email when my deal completes and my payout is initiated, so I know when to expect funds.  
- Acceptance: After `chargeCompletedListing()` runs, organiser receives `payout_initiated` email with: deal title, total collected, platform fee deducted, net payout amount, estimated arrival.

**US9.5 — Admin revenue dashboard**  
As the founder, I want to see total platform fees collected, so I can measure contribution margin.  
- Acceptance: Admin metrics page shows: total charges, total platform fees, total refunds, net revenue — per day/week/month.

## Technical Approach

**Issue 1:** Platform fee is applied in code but not shown to users pre-commit  
Current State: `applicationFeeCents()` in `server/stripe.ts` correctly computes the fee; `chargeOnCompletion()` passes `application_fee_amount` to Stripe. But the fee is invisible to buyers.  
Why It Matters: Undisclosed fees are an FTC UDAP violation in the US; equivalent violations exist in EU/UK. Also destroys trust.  
Recommended Solution: As described in E1 (Issue 2) — expose fee in CommitDialog. E9 implements the receipt side.  
Expected Impact: Regulatory compliance; buyer trust; reduced chargebacks.

**Issue 2:** Organiser Stripe Connect onboarding exists in API but has no UI entry point  
Current State: `ensureConnectAccount()` and `createConnectOnboardingLink()` exist in `server/stripe.ts`; a `/api/stripe/connect-onboarding` or similar endpoint likely exists in routes.ts. But there is no UI in the organiser profile to initiate this.  
Why It Matters: Without `stripePayoutsEnabled = true`, `chargeCompletedListing()` skips all charges (line 26 in `server/payments.ts`): `if (!organizer.stripePayoutsEnabled) return`.  
Recommended Solution: Add "Connect Payout Account" card to organiser profile page; gate listing creation on payout onboarding for deals with `pricePerSlot > 0`. [HUMAN-OWNED for any backend changes; frontend is in client/]  
Expected Impact: 100% of deals with prices have an onboarded organiser → 100% charge eligibility.

## Database Tasks [HUMAN-OWNED]
No schema changes required. Add to `site_settings`:
```sql
INSERT INTO site_settings (key, value) VALUES ('platform_fee_bps', '500') ON CONFLICT (key) DO NOTHING;
```

Add revenue metrics query (no new table needed — derived from `orders`):
```sql
CREATE OR REPLACE VIEW revenue_metrics AS
SELECT
  DATE_TRUNC('day', paid_at) AS day,
  COUNT(*) AS charges,
  SUM(amount_cents) AS gross_revenue_cents,
  ROUND(SUM(amount_cents) * 0.05) AS platform_fee_cents,
  SUM(amount_cents) - ROUND(SUM(amount_cents) * 0.05) AS net_to_organisers_cents
FROM orders
WHERE charge_status = 'paid'
GROUP BY DATE_TRUNC('day', paid_at)
ORDER BY day DESC;
```

## API Tasks [HUMAN-OWNED]

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/stripe/connect-onboarding` | Returns Stripe Connect Express onboarding URL |
| GET | `/api/stripe/connect-status` | Returns `{ accountId, payoutsEnabled, chargesEnabled }` |
| GET | `/api/admin/revenue` | Revenue metrics (fees, charges, refunds) |

## Frontend Tasks
- `client/src/pages/Profile.tsx` (or equivalent): add "Payout Account" section showing Connect status; "Connect Bank Account" button if not onboarded; "Payout enabled" badge if onboarded
- `client/src/pages/ListingDetails.tsx` — `CommitDialog` step 3: add fee line item (from E1; implement fully here)
- `client/src/pages/ListingDetails.tsx` — listing creation (`/create`): add gate — if `pricePerSlot > 0` and `!payoutsEnabled` → show "Connect your bank account to accept payments for this deal"
- Admin panel: add "Revenue" tab with daily charge/fee/refund table and totals

## Backend Tasks [HUMAN-OWNED]
- `server/email.ts`: add `charge_receipt` and `payout_initiated` email templates
- `server/payments.ts` `chargeCompletedListing()`: after successful charge, enqueue `charge_receipt` email to buyer and `payout_initiated` email to organiser
- `server/stripe.ts`: confirm `platformFeeBps()` reads from `PLATFORM_FEE_BPS` env var (already default 500); add `GET /api/platform/fee` returning current fee for UI display

## QA Test Plan
- Integration: organiser completes Connect onboarding in Stripe test mode → `stripePayoutsEnabled = true` in DB
- Integration: deal completes → all eligible orders charged → `charge_receipt` emails enqueued
- Integration: `application_fee_amount` on Stripe PI matches `pricePerSlot * feeBps / 10000`
- E2E: buyer commits → deal fills → charge receipt email received with correct amounts
- Reconciliation: sum of `orders.amount_cents WHERE charge_status = 'paid'` × fee rate = Stripe application fee reports
- Edge: organiser payouts disabled mid-deal → no charges; organiser notified to complete onboarding

## Deployment Plan
1. Deploy Connect onboarding UI (frontend only — no backend change needed if endpoint exists)
2. Onboard first N organisers manually in staging
3. Run test charges in Stripe test mode; verify fee splits in Stripe dashboard
4. After E1 legal sign-off: flip `stripe_payments_enabled = true` in production
5. Monitor first 10 live charges manually; check Stripe dashboard for correct fee splits
6. Deploy revenue dashboard

## Dependencies
- E1: legal sign-off gates production activation
- E2: charge flow must work end-to-end first
- Stripe Connect account must be approved for the platform (Stripe review process) [HUMAN-OWNED — external dependency]

## Risks
- Stripe Connect Express requires Stripe's approval: mitigation — apply immediately; takes 1–5 business days
- Tax/invoicing requirements: mitigation — Phase A flags this; legal review in E1 covers it; VAT invoicing is P3

## Estimated Effort
9 engineer-days | Medium complexity

## Acceptance Criteria (Definition of Done)
- [ ] Organiser can initiate and complete Stripe Connect Express onboarding from profile
- [ ] `users.stripePayoutsEnabled = true` after successful onboarding
- [ ] Listing creation gated on payout onboarding for priced deals
- [ ] CommitDialog shows platform fee pre-commit
- [ ] Charge receipt email sent to buyer after successful charge
- [ ] Payout notification email sent to organiser after deal charges
- [ ] Admin revenue dashboard shows correct daily totals
- [ ] Stripe ledger matches DB `orders` totals to the penny in staging

---

# EPIC E10 — Trust Score Made Legible
**Maps to:** P1-5  
**Priority:** P1 | Release Urgency: P2 (Sprint 3)

## Objective
Replace the raw numeric reliability score badge with a narrative trust summary ("Completed 12 deals · Ships 3 days faster than promised · ★4.8") that informs buyer decisions and is hard to game.

## Business Value
A score of "80" is meaningless without context. Narrative trust signals increase buyer willingness to commit by making the organiser's track record concrete. This uses data already in the DB.

## User Stories

**US10.1 — Narrative trust badge on listing detail**  
As a buyer, I want to see "Completed 12 deals · 100% delivery · ★4.8" instead of "Reliability: 80%", so I understand what the score means.  
- Acceptance: Organiser card on `ListingDetails.tsx` shows narrative: completed count, delivery rate %, average star rating, and verified badge if KYC complete.

**US10.2 — Trust explanation tooltip**  
As a buyer, I want to hover over the trust badge to see how it's calculated, so I know it's not fake.  
- Acceptance: Tooltip on trust badge explains: "Based on N deals, delivery confirmation from participants, and N reviews."

**US10.3 — Trust score history in admin**  
As an admin, I want to see trust score changes over time, so I can detect gaming or sudden drops.  
- Acceptance: Admin user detail page shows `reliabilityScore` value and a simple trend (last 30 days).

## Technical Approach

**Issue 1:** `reliabilityScore` (numeric) displayed without context  
Current State: `ListingDetails.tsx` `TrustBadgeRow` component shows the raw score. The `organiser_stats` view (from E8) already computes `completed_deals`, `completion_rate`, `avg_rating`.  
Why It Matters: Buyers can't act on a raw number; context drives conversion.  
Recommended Solution: (a) `/api/users/:id/reliability` (from E8) returns narrative fields; (b) `TrustBadgeRow` renders narrative; (c) tooltip added via existing `TooltipProvider` (already in `App.tsx`).  
Expected Impact: 10–15% increase in buyer commit rate on first-time organiser listings.

## Database Tasks
No new tables. Uses `organiser_stats` view from E8 and existing `reviews`, `listings`, `dealMilestones` tables.

## API Tasks
- `GET /api/users/:id/reliability` — already planned in E8; ensure it returns: `{ completedDeals, completionRate, avgRating, avgTimeToFillHours, verifiedKyc, reviewCount }` [HUMAN-OWNED]

## Frontend Tasks
- `client/src/pages/ListingDetails.tsx` — `TrustBadgeRow`:
  - Query `GET /api/users/:creatorId/reliability`
  - Replace `Reliability: {score}%` with: `✓ {completedDeals} deals · {completionRate}% delivery · ★{avgRating}`
  - Add `<Tooltip>` using `TooltipProvider` (already imported in App.tsx) explaining calculation
  - Show "ID Verified" badge if `verifiedKyc = true`
- `client/src/pages/Profile.tsx`: Show organiser's own trust stats; add motivation to complete KYC ("Get your Verified badge")

## Backend Tasks [HUMAN-OWNED]
- Ensure `GET /api/users/:id/reliability` endpoint caches result for 1h (not per-request DB hit)

## QA Test Plan
- Unit: narrative string generation from raw stats
- Integration: trust badge shows correct stats matching manual DB query
- E2E: new organiser with 0 deals shows "New organiser" instead of "0 deals · N/A"
- Edge: organiser with all cancelled deals shows "0% delivery" — not hidden

## Deployment Plan
1. Deploy E8 `organiser_stats` view and reliability API endpoint
2. Deploy trust badge narrative (frontend only change to `ListingDetails.tsx`)
3. No rollback concern — purely display change

## Dependencies
- E8 (`organiser_stats` view, reliability endpoint)

## Risks
- Narrative may feel aggressive for new organisers with 0 deals: mitigation — "New organiser · Verified ID" for 0-deal accounts with KYC

## Estimated Effort
5 engineer-days | Low complexity

## Acceptance Criteria (Definition of Done)
- [ ] TrustBadgeRow shows narrative stats (completed deals, delivery rate, avg rating)
- [ ] Tooltip explains calculation methodology
- [ ] "ID Verified" badge shows for KYC-complete organisers
- [ ] New organiser (0 deals) shows graceful fallback copy
- [ ] No regression on existing trust badge rendering

---

# EPIC E11 — Organiser Pro Subscription
**Maps to:** P2-1  
**Priority:** P2 | Release Urgency: P3 (Sprint 5–6)

## Objective
Offer a tiered Pro subscription for organisers: higher listing limits, analytics dashboard, verified badge, and priority support.

## Business Value
Recurring revenue diversification beyond take-rate. Targets power organisers who run deals regularly and want to grow their business on the platform.

## User Stories

**US11.1 — Pro subscription sign-up**  
As a power organiser, I want a Pro plan with higher listing limits and analytics, so I can grow my group-buying business.  
- Acceptance: Profile page has "Upgrade to Pro" CTA; Stripe billing checkout for monthly subscription; `users.proStatus = 'active'` on success.

**US11.2 — Listing limits enforced by plan**  
As the platform, I want free organisers limited to 3 active listings and Pro to unlimited, so there's a clear upgrade incentive.  
- Acceptance: `POST /api/listings/create` checks active listing count vs plan limit; returns 402 with upgrade prompt if exceeded.

**US11.3 — Analytics dashboard for Pro**  
As a Pro organiser, I want to see fill-rate trends, view counts, and conversion rates for my deals, so I can optimise.  
- Acceptance: Pro dashboard shows: views → joins → completions funnel; time-to-fill trend; revenue per deal; exportable CSV.

**US11.4 — Verified Pro badge**  
As a Pro organiser, I want a "Pro Verified" badge on my listings, so buyers trust me more.  
- Acceptance: Listings by Pro organisers show a "Pro" badge; badge is not self-assignable.

## Technical Approach

**Issue 1:** No subscription mechanism exists  
Current State: No `subscriptions` table, no Stripe Billing integration.  
Why It Matters: Pro revenue requires Stripe Billing (separate from Connect).  
Recommended Solution: Add `subscriptions` table; Stripe Billing checkout for monthly plan; webhook handles subscription lifecycle (active/cancelled/past_due). [HUMAN-OWNED]  
Expected Impact: Recurring revenue stream activated.

## Database Tasks [HUMAN-OWNED]

**Migration M11-1:** Add subscription fields to users and a `subscriptions` table
```sql
ALTER TABLE users ADD COLUMN pro_status VARCHAR(20) DEFAULT 'free'; -- free | active | cancelled | past_due
ALTER TABLE users ADD COLUMN pro_expires_at TIMESTAMP;

CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  stripe_subscription_id VARCHAR UNIQUE,
  stripe_price_id VARCHAR,
  status VARCHAR(20) NOT NULL, -- active | cancelled | past_due | trialing
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
```
Update `shared/schema.ts`.

## API Tasks [HUMAN-OWNED]

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/stripe/subscription/checkout` | Create Stripe Billing checkout session |
| POST | `/api/stripe/subscription/cancel` | Cancel Pro subscription |
| GET | `/api/user/subscription` | Get current subscription status |
| POST | `/api/stripe/billing-webhook` | Handle subscription lifecycle events |
| GET | `/api/organiser/analytics` | Pro analytics for authenticated organiser |

## Frontend Tasks
- Profile page: "Upgrade to Pro" card with feature list; billing management link for existing subscribers
- New page: `/analytics` — Pro organiser analytics dashboard (views, joins, completions funnel chart)
- Listing create: show upgrade prompt if free limit exceeded
- Listing detail / discover: "Pro" badge on organiser avatar and listing card

## Backend Tasks [HUMAN-OWNED]
- Stripe Billing product and price created in Stripe dashboard (one-time setup)
- `server/routes.ts` listing create: check active listing count vs `proStatus`; enforce limit
- Stripe billing webhook: `customer.subscription.updated`, `invoice.payment_failed` events → update `users.proStatus`

## QA Test Plan
- Integration: checkout → Stripe test mode → subscription created → `users.proStatus = 'active'`
- Integration: listing count gate: free user creates 4th listing → 402
- Integration: subscription cancelled → `proStatus = 'cancelled'`; listing limit re-enforced
- E2E: Pro organiser sees analytics dashboard; data matches manual DB query

## Deployment Plan
1. Schema migration M11-1
2. Create Stripe Billing product in dashboard [HUMAN-OWNED]
3. Deploy subscription endpoints and billing webhook
4. Deploy frontend Pro pages
5. Flip `pro_subscriptions_enabled` feature flag

## Dependencies
- E9 (Stripe Connect) must be live first — same Stripe account, same customer object
- Legal: subscription T&C addendum required

## Risks
- Stripe Billing churn/dunning management: mitigation — use Stripe's built-in dunning; configure 3 retry attempts before `past_due`

## Estimated Effort
14 engineer-days | Medium complexity

## Acceptance Criteria (Definition of Done)
- [ ] Pro subscription checkout functional in Stripe test mode
- [ ] Free listing limit (3) enforced; Pro has no limit
- [ ] Pro badge displayed on listings by Pro organisers
- [ ] Analytics dashboard: views/joins/completions funnel with 30-day default
- [ ] Subscription webhook handles all lifecycle events (active, cancelled, past_due)
- [ ] Pro organiser can export analytics as CSV

---

# EPIC E12 — Supplier/Vendor Lead-Gen
**Maps to:** P2-2  
**Priority:** P2 | Release Urgency: P3 (Sprint 6)

## Objective
Suppliers and vendors pay for aggregated demand signals — seeing how many buyers are grouping around a product category in their area — and can submit proposals to organise deals.

## Business Value
Second revenue stream; turns buyers into a demand signal that suppliers pay to access. High margin (data product, not infrastructure).

## User Stories

**US12.1 — Demand signal dashboard for suppliers**  
As a supplier, I want to see aggregated demand in my product category and region, so I can identify opportunities.  
- Acceptance: Supplier dashboard shows: category demand heatmap, active groups by category/region, top requested products (from search queries + saved searches).

**US12.2 — Supplier deal proposal**  
As a supplier, I want to submit a deal proposal (I'll supply X product at Y price to Z buyers), so I can fill existing demand.  
- Acceptance: Supplier submits proposal via form; admin reviews; if approved, listing is created with `sellerType = 'vendor'` and supplier as creator.

**US12.3 — Supplier verified badge**  
As a buyer, I want to see "Verified Supplier" on vendor listings, so I know the organiser is a legitimate business.  
- Acceptance: Suppliers complete business KYC; admin verifies; `users.vendorVerified = true`; "Verified Supplier" badge shown.

## Technical Approach

Demand signal data is already in the DB (`savedSearches`, `listings`, `participations` by category). This epic is primarily UI + a new supplier-facing page.

**Issue 1:** No supplier-facing product  
Current State: `listings` has a `sellerType` field (vendor/individual) but no supplier dashboard or proposal flow.  
Why It Matters: Supplier revenue requires a supplier-facing product.  
Recommended Solution: New `/supplier` route with dashboard + proposal form; admin review queue. [HUMAN-OWNED for route/endpoint]  
Expected Impact: First supplier revenue within 30 days of launch.

## Database Tasks [HUMAN-OWNED]

**Migration M12-1:** Add supplier fields and proposals table
```sql
ALTER TABLE users ADD COLUMN vendor_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN vendor_business_name TEXT;
ALTER TABLE users ADD COLUMN vendor_category TEXT;

CREATE TABLE supplier_proposals (
  id SERIAL PRIMARY KEY,
  supplier_id VARCHAR NOT NULL REFERENCES users(id),
  category TEXT NOT NULL,
  product_description TEXT NOT NULL,
  price_per_unit_cents INTEGER,
  min_quantity INTEGER,
  city TEXT,
  country TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending | approved | rejected
  admin_notes TEXT,
  reviewed_by VARCHAR REFERENCES users(id),
  reviewed_at TIMESTAMP,
  listing_id INTEGER REFERENCES listings(id), -- set when approved and listing created
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_supplier_proposals_supplier_id ON supplier_proposals(supplier_id);
CREATE INDEX idx_supplier_proposals_status ON supplier_proposals(status);
```

## API Tasks [HUMAN-OWNED]

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/supplier/demand` | Aggregated demand by category/region (auth: supplier only) |
| POST | `/api/supplier/proposals` | Submit deal proposal |
| GET | `/api/supplier/proposals` | List own proposals |
| GET | `/api/admin/supplier-proposals` | Admin review queue |
| PATCH | `/api/admin/supplier-proposals/:id` | Approve/reject proposal; create listing on approve |

## Frontend Tasks
- New route `/supplier` in `App.tsx` (requires code change)
- Supplier dashboard: demand heatmap by category; active deal counts per city
- Proposal submission form
- Admin: "Supplier Proposals" tab in admin panel

## Backend Tasks [HUMAN-OWNED]
- `server/email.ts`: add `proposal_approved` and `proposal_rejected` templates
- Admin proposal approval: auto-create listing from proposal fields + set `sellerType = 'vendor'`

## QA Test Plan
- Integration: proposal submitted → admin receives notification; admin approves → listing created with correct fields
- Integration: demand signal query returns correct category counts matching `listings` table
- E2E: supplier registers → verifies business → sees demand dashboard → submits proposal → admin approves → listing live

## Deployment Plan
1. Schema migration M12-1
2. Deploy supplier endpoints behind `supplier_module_enabled` feature flag
3. Manually onboard 3–5 pilot suppliers
4. Deploy demand dashboard
5. Flip feature flag

## Dependencies
- E4 (fraud floor): supplier KYC must be more rigorous than individual verification
- E9 (monetization): supplier lead-gen pricing model needs legal + product decision

## Risks
- Demand signal is thin in early stages (sparse data): mitigation — supplement with category-level intent (saved searches + newsletter topic interest)
- Supplier "gaming" proposal system: mitigation — admin review required; max 3 pending proposals per supplier

## Estimated Effort
10 engineer-days | Medium complexity

## Acceptance Criteria (Definition of Done)
- [ ] Supplier demand dashboard shows category/region demand aggregation
- [ ] Proposal submission, review, and approval workflow complete
- [ ] Approved proposal auto-creates listing with correct fields
- [ ] "Verified Supplier" badge displayed on vendor listings
- [ ] Admin proposal review queue functional with approve/reject
- [ ] Proposal approval/rejection email sent to supplier

---

# EPIC E13 — Test Coverage to a Credible Floor
**Maps to:** P2-5  
**Priority:** P2 | Release Urgency: P1 (Sprint 2–3, ongoing)

## Objective
Bring test coverage from ~10% to a credible floor (~60% on critical paths) with a focus on: payments, join race conditions, auth, and escrow lifecycle. Every critical path in E2 must have automated test coverage.

## Business Value
A payments-native marketplace that ships bugs in charge, refund, or escrow flows will churn users and face chargebacks. Tests are the safety net; 10% coverage on money flows is not a safety net.

## User Stories

**US13.1 — Payment flow tests**  
As a developer, I want automated tests covering the full charge-on-completion flow, so I can refactor with confidence.  
- Acceptance: Tests cover: `chargeCompletedListing()`, `refundOrder()`, skipped-if-already-paid, skipped-if-no-PM, Stripe error handling, Stripe recovery from PI error.

**US13.2 — Join race condition tests**  
As a developer, I want a test that simulates two concurrent joins to the last slot, so I know the unique constraint works.  
- Acceptance: Concurrent join test: 2 requests for the last slot → exactly 1 succeeds (200), 1 fails (409 or 400); `filledSlots` incremented once.

**US13.3 — Escrow lifecycle tests**  
As a developer, I want tests covering the full escrow API client, so I know it handles sandbox vs production correctly.  
- Acceptance: `createEscrowTransaction()`, `agreeToEscrowTransaction()`, `releaseEscrow()`, `cancelEscrow()` all have unit tests with mocked HTTP responses.

**US13.4 — Auth and authorization tests**  
As a developer, I want tests verifying that protected endpoints reject unauthorized requests, so auth bugs are caught before deploy.  
- Acceptance: All `requireAuth`-protected endpoints return 401 without session; `requireListingOwner` returns 403 for non-owner; admin endpoints return 403 for non-admin.

## Technical Approach

The test file glob pattern in the repo suggests `*.test.ts` or `__tests__/` structure. Tech stack: Node/Express/Drizzle backend — use `vitest` or `jest` with supertest for API integration tests; mock Stripe and Escrow HTTP calls with `nock` or `msw`.

**Issue 1:** No payment flow unit tests  
Current State: `server/payments.ts` has complex branching logic (skip paid, skip no-PM, recover from PI error, normalize status) but no tests.  
Why It Matters: Any refactor or Stripe SDK upgrade could break the charge/refund flow without detection.  
Recommended Solution: Write unit tests for `chargeCompletedListing()` and `refundOrder()` using Jest mocks for `chargeOnCompletion()` and `refundPaymentIntent()`. [HUMAN-OWNED]  
Expected Impact: Catches regressions in payment flow before deploy.

**Issue 2:** Join race condition untested  
Current State: `participations_listing_user_unique` unique index prevents duplicate joins; `filled_slots_not_exceed_total` DB check prevents overfill. But these are only tested manually.  
Why It Matters: A race condition bug in the join handler could allow overfill, a critical trust failure in a group-buying platform.  
Recommended Solution: Integration test with `Promise.all` firing 2 concurrent join requests for the last slot; assert exactly 1 succeeds. [HUMAN-OWNED]  
Expected Impact: Race condition class permanently caught by CI.

## Database Tasks
No schema changes. Test fixtures use the existing schema.

## API Tasks
Test coverage for all P0 endpoints:
- `POST /api/listings/:id/join` (race condition, auth gate, verification gate)
- `POST /api/stripe/setup-intent` (auth required, returns clientSecret)
- `POST /api/listings/:id/confirm-delivery` (auth, participant-only)
- `POST /api/listings/:id/dispute` (auth, evidence validation)

## Frontend Tasks
- Add `vitest` + React Testing Library for critical UI components:
  - `CommitDialog`: renders payment step, shows fee, calls join mutation on confirm
  - `TrustBadgeRow`: renders narrative stats from API response
  - `EscrowStatusPanel`: renders correct status for each escrow state

## Backend Tasks [HUMAN-OWNED]
All test files for `server/` must be created by a human engineer:
- `server/__tests__/payments.test.ts`
- `server/__tests__/escrow.test.ts`
- `server/__tests__/routes.join.test.ts` (race condition test)
- `server/__tests__/routes.auth.test.ts` (auth/authorization tests)
- `server/__tests__/stripe.test.ts` (mock HTTP for Stripe calls)

## QA Test Plan
This epic IS the QA plan. Success metrics:
- `npx vitest --coverage` shows ≥60% coverage on `server/payments.ts`, `server/escrow.ts`, `server/stripe.ts`
- All race condition tests pass consistently (run 10x in CI)
- All auth/authorization tests pass
- Frontend component tests cover CommitDialog happy path and error states

## Deployment Plan
1. Integrate test runner into CI (GitHub Actions or equivalent) [HUMAN-OWNED for CI config]
2. Set coverage threshold gate: CI fails if payments/escrow coverage drops below 60%
3. Run tests in staging against test DB before every prod deploy

## Dependencies
- E2 (buyer protection) — tests require the delivery confirm and dispute endpoints to exist
- E3 (staging environment) — integration tests need a staging DB

## Risks
- Mocking Stripe HTTP correctly is complex: mitigation — use Stripe's official test mode (test API keys) for integration tests rather than mocking
- Test suite becomes flaky under parallel execution: mitigation — each test creates its own DB fixtures and rolls back in `afterEach`

## Estimated Effort
12 engineer-days | Medium complexity

## Acceptance Criteria (Definition of Done)
- [ ] `server/payments.ts`: ≥80% test coverage
- [ ] `server/escrow.ts`: ≥80% test coverage
- [ ] `server/stripe.ts`: ≥70% test coverage
- [ ] Join race condition test: passes 10/10 consecutive runs in CI
- [ ] All `requireAuth` endpoints tested for 401 rejection
- [ ] `CommitDialog` React component test covers happy path + error state
- [ ] CI fails build if coverage drops below thresholds
- [ ] Test run < 60 seconds total (developer-friendly)

---

# DEVELOPMENT ROADMAP
## Sprint Plan: Sprints 1–6 (2-week sprints, ~3 engineers)

> **Phase sequencing:** Stabilize (S1) → Trust (S2–S3) → Liquidity (S3–S4) → Monetize (S4–S5) → Scale (S5–S6)

---

## Sprint 1 — STABILIZE
**Goal:** Zero release incidents, monitored errors, posture decision locked, notification triggers wired.  
**Epics:** E1 (P0-1), E3 (P0-3), E6-partial (P1-1 email triggers)

### Features
- [ ] Payments posture decision documented and signed off (E1) [HUMAN-OWNED: legal + founder]
- [ ] Trust badges updated to Path A language (E1 frontend)
- [ ] CommitDialog shows platform fee line-item (E1 frontend, partial)
- [ ] Email queue triggers wired for join-confirmed and deal-filled events (E6 backend) [HUMAN-OWNED]
- [ ] Notification prefs migration M6-1 executed (E6)

### Bug Fixes
- [ ] Expiry warning cron: verify it actually inserts into `emailQueue` (not just console.log) [HUMAN-OWNED]
- [ ] Expiry cron: fix PM2 `instances: 1` to prevent double-fire [HUMAN-OWNED]
- [ ] `Cache-Control: no-cache` on `index.html` (stale-SW incident class) [HUMAN-OWNED — infra]

### UI Improvements
- [ ] TrustBadgeRow: replace "Reliability: 80%" with escrow-backed messaging (E1)
- [ ] "Money protection strip" copy updated to Path A language (E1)

### SEO Improvements
- [ ] Verify JSON-LD on listing detail pages is valid (no code change; validation only)

### Security Improvements
- [ ] `PLATFORM_FEE_BPS` env var checked — ensure it cannot be overridden by client [HUMAN-OWNED]
- [ ] Review rate limiter configs in `server/routes.ts` — confirm `joinLimiter` and `otpLimiter` are adequate

### Testing Requirements
- [ ] Manual smoke test of email delivery: join a listing in staging → confirm `group_commit_confirmed` email delivered via Resend
- [ ] Manual test: new deploy in staging → verify users receive new UI version within 30 seconds
- [ ] Write `server/__tests__/escrow.test.ts` with mocked HTTP (E13 starts) [HUMAN-OWNED]

---

## Sprint 2 — TRUST (Part 1)
**Goal:** Sentry live, staging environment up, Stripe Elements in CommitDialog, fraud detection in shadow mode.  
**Epics:** E2-partial (P0-2), E3-completion (P0-3), E4-partial (P0-4), E13-partial (P2-5)

### Features
- [ ] Staging environment provisioned with separate DB + Stripe test keys (E3) [HUMAN-OWNED — infra]
- [ ] Sentry DSN configured for BE + FE; alert rules set up (E3) [HUMAN-OWNED]
- [ ] Stripe Elements integrated in CommitDialog step 2 (E2 frontend)
- [ ] `POST /api/stripe/setup-intent` endpoint live (E2) [HUMAN-OWNED]
- [ ] Fraud detection heuristics in shadow mode (log Sybil/pump-and-dump flags, no enforcement) (E4) [HUMAN-OWNED]
- [ ] Phone verification gate on join for deals > threshold (E4) [HUMAN-OWNED]
- [ ] Migrations M2-1 (deliveryConfirmedAt), M2-2 (escrowTransactionId), M2-3 (disputes) executed (E2) [HUMAN-OWNED]
- [ ] Migrations M4-1 (suspicious_flags.listing_id), M4-3 (fraud thresholds in site_settings) executed (E4) [HUMAN-OWNED]

### Bug Fixes
- [ ] Stripe webhook handler: verify `payment_intent.succeeded` updates `orders.chargeStatus` (E2) [HUMAN-OWNED]
- [ ] Fix `server/escrow.ts` to use env-driven base URL (E2) [HUMAN-OWNED]

### UI Improvements
- [ ] CommitDialog: Stripe Elements card capture UI (E2)
- [ ] ListingDetails join button: show "Verify phone to join" prompt on 403 (E4)

### SEO Improvements
- [ ] `GET /api/health` returns `version` + `gitSha` (used by monitoring to confirm deploy) (E3) [HUMAN-OWNED]

### Security Improvements
- [ ] Admin fraud flags dashboard added — admins can see unresolved Sybil/pump-dump flags (E4)
- [ ] `requireAdmin` middleware: confirm it rejects non-admin users on all `/api/admin/*` endpoints

### Testing Requirements
- [ ] `server/__tests__/payments.test.ts`: unit tests for `chargeCompletedListing()`, `refundOrder()` (E13) [HUMAN-OWNED]
- [ ] `server/__tests__/routes.auth.test.ts`: 401 rejection on all `requireAuth` endpoints (E13) [HUMAN-OWNED]
- [ ] Run E2E test in staging: CommitDialog → Stripe Elements → save PM → order has PM ID

---

## Sprint 3 — TRUST (Part 2) + LIQUIDITY (Start)
**Goal:** Full escrow/charge lifecycle live in staging; liquidity wedge defined; scale migration starts.  
**Epics:** E2-completion (P0-2), E4-completion (P0-4), E5-partial (P0-5), E7-partial (P1-2), E10 (P1-5)

### Features
- [ ] `POST /api/listings/:id/confirm-delivery` endpoint (E2) [HUMAN-OWNED]
- [ ] Delivery confirmation UI: "Confirm Delivery" button + progress count on completed listings (E2)
- [ ] Dispute creation: `POST /api/listings/:id/dispute` endpoint + UI upgrade (E2) [HUMAN-OWNED]
- [ ] Admin dispute queue tab in admin panel (E2)
- [ ] Expiry cron triggers `refundOrder()` for all authorized/paid orders (E2) [HUMAN-OWNED]
- [ ] Fraud detection moved to enforcement mode (E4) — after 1-week shadow validation [HUMAN-OWNED]
- [ ] Liquidity wedge documented in `docs/WEDGE.md` = geography-free digital/SaaS & subscription group buys (E5; see Addendum Override 2)
- [ ] `POST /api/listings/:id/extend` and `POST /api/listings/:id/rollover` endpoints (E5) [HUMAN-OWNED]
- [ ] Expiry recovery emails for organiser + participants (E5) [HUMAN-OWNED]
- [ ] `listing_view_buckets` migration M7-1 + dual-write deployed (E7) [HUMAN-OWNED]
- [ ] Trust score narrative badge on listing detail (E10)
- [ ] Organiser reliability endpoint `/api/users/:id/reliability` (E10) [HUMAN-OWNED]

### Bug Fixes
- [ ] Verify `releaseEscrow()` is called correctly after delivery threshold (E2)
- [ ] Waitlist leave → notify first-in-line user within 60s (E5) [HUMAN-OWNED]

### UI Improvements
- [ ] Expired listing view: show "Extend Deal" and "Start New Deal" CTAs for organiser (E5)
- [ ] TrustBadgeRow: full narrative stats + tooltip (E10)
- [ ] Profile page: organiser's own trust stats displayed (E10)

### SEO Improvements
- [ ] Completed listing JSON-LD: add `aggregateRating` and `numberOfParticipants` (E8 preview)

### Security Improvements
- [ ] Organiser freeze mechanism functional after pump-and-dump detection (E4) [HUMAN-OWNED]
- [ ] Max extension limit (3) enforced via `site_settings` (E5)

### Testing Requirements
- [ ] `server/__tests__/routes.join.test.ts`: race condition test (2 concurrent → 1 succeeds) (E13) [HUMAN-OWNED]
- [ ] E2E in staging: full lifecycle — commit → fill → charge → delivery confirm → escrow release
- [ ] Integration test: expiry → refund within 60s

---

## Sprint 4 — LIQUIDITY (Complete) + SOCIAL PROOF
**Goal:** Wedge seeded; fill-rate dashboard live; success-story engine live; scale hardening complete.  
**Epics:** E5-completion (P0-5), E7-completion (P1-2), E8 (P1-3)

### Features
- [ ] Admin metrics dashboard: fill-rate, time-to-fill, completion rate by category/city (E5)
- [ ] ≥10 seeded deals live in wedge city (E5) [HUMAN-OWNED — content/GTM operation]
- [ ] lat/lng migration M7-2 to FLOAT8 + spatial index (E7) [HUMAN-OWNED — maintenance window]
- [ ] `listing_views` read path switched to `listing_view_buckets` (E7) [HUMAN-OWNED]
- [ ] `GET /api/listings/completed` endpoint — paginated (E8) [HUMAN-OWNED]
- [ ] "Recently Completed" section on discover/landing page (E8)
- [ ] Organiser track record stats in listing detail card (E8)
- [ ] Review prompt email queued 48h post-completion (E8) [HUMAN-OWNED]

### Bug Fixes
- [ ] Discovery full-table scans: add 5-min cache to `GET /api/discover` (quick win) [HUMAN-OWNED]
- [ ] `prune_views` cron: update to aggregate into `listing_view_buckets` before deleting raw rows [HUMAN-OWNED]

### UI Improvements
- [ ] Admin metrics: fill-rate bar chart by category with date range filter (E5)
- [ ] Discover page: "Recently Completed" section with savings discs (E8)
- [ ] Completed listing organiser card: narrative stats (E8 + E10 combined)

### SEO Improvements
- [ ] Completed deal pages: add JSON-LD `aggregateRating` + `numberOfParticipants` (E8)
- [ ] `sitemap.xml` generation: include completed listing URLs [HUMAN-OWNED]

### Security Improvements
- [ ] Review rate limiters post-fraud-enforcement: tune based on actual attack patterns from S3 shadow data

### Testing Requirements
- [ ] k6 load test: 1,000 VU on `GET /api/listings/:id` → p95 ≤ 800ms (E7)
- [ ] Radius search accuracy test: 10k seeded listings, verify correct radius results (E7)
- [ ] Integration: review prompt email queued exactly once per participant per completed deal (E8)

---

## Sprint 5 — MONETIZE
**Goal:** Take-rate live; organiser payout onboarding; revenue dashboard.  
**Epics:** E9 (P1-4), E13-completion (P2-5)

### Features
- [ ] Organiser "Connect Bank Account" UI on profile page (E9)
- [ ] `POST /api/stripe/connect-onboarding` and `GET /api/stripe/connect-status` (E9) [HUMAN-OWNED]
- [ ] Listing creation gated on payout onboarding for priced deals (E9)
- [ ] Charge receipt email to buyer after successful charge (E9) [HUMAN-OWNED]
- [ ] Payout notification email to organiser after deal charges (E9) [HUMAN-OWNED]
- [ ] Admin revenue dashboard: daily charges, fees, refunds, net revenue (E9)
- [ ] Test coverage CI gate: build fails below 60% on payment/escrow paths (E13) [HUMAN-OWNED — CI config]
- [ ] `CommitDialog` React component tests (E13)

### Bug Fixes
- [ ] `chargeCompletedListing()`: ensure idempotency key format `charge-order-{id}` prevents double-charge on retry [HUMAN-OWNED — verify in Stripe dashboard]
- [ ] Refund path: verify `refundPaymentIntent()` reverses the `transfer_data` split correctly [HUMAN-OWNED]

### UI Improvements
- [ ] Profile page: payout account section with Connect status indicator (E9)
- [ ] Listing create: upgrade prompt when limit exceeded (E11 preview)
- [ ] CommitDialog step 3: full fee breakdown (subtotal + fee + total) (E9)

### SEO Improvements
- [ ] Organiser profile pages: add structured data for "person" + "aggregateRating" [HUMAN-OWNED]

### Security Improvements
- [ ] Stripe webhook signature verification: confirm `constructWebhookEvent()` validates `stripe-signature` header (already in `server/stripe.ts` — verify it's used) [HUMAN-OWNED]
- [ ] Revenue dashboard: restrict to admin only (confirm `requireAdmin` middleware applied)

### Testing Requirements
- [ ] Stripe integration test: charge → receipt email queued → Resend delivers
- [ ] Reconciliation script: orders DB totals vs Stripe dashboard amounts match
- [ ] E2E: full monetization journey — organiser connects bank → deal completes → charge → payout notification

---

## Sprint 6 — SCALE & P2 LEVERAGE
**Goal:** Pro subscription; supplier module; coverage floor achieved.  
**Epics:** E11 (P2-1), E12 (P2-2), E13-final (P2-5)

### Features
- [ ] Pro subscription checkout (Stripe Billing) (E11) [HUMAN-OWNED for endpoint + billing webhook]
- [ ] Free listing limit (3) enforced; Pro unlimited (E11) [HUMAN-OWNED]
- [ ] Pro analytics dashboard: views/joins/completions funnel (E11)
- [ ] "Pro Verified" badge on organiser listings (E11)
- [ ] Supplier demand dashboard (E12) [HUMAN-OWNED]
- [ ] Supplier proposal submission + admin review workflow (E12) [HUMAN-OWNED]
- [ ] "Verified Supplier" badge for vendor-verified organisers (E12)
- [ ] Final test coverage pass: all P0 payment/escrow paths at ≥80% (E13) [HUMAN-OWNED]

### Bug Fixes
- [ ] Subscription webhook: handle `invoice.payment_failed` → `proStatus = 'past_due'` (E11) [HUMAN-OWNED]
- [ ] Supplier proposal approval: ensure listing created with correct `sellerType = 'vendor'` and creator = supplier (E12) [HUMAN-OWNED]

### UI Improvements
- [ ] Pro upgrade CTA on profile and listing create pages (E11)
- [ ] Supplier `/supplier` dashboard page with demand heatmap (E12)
- [ ] Admin: "Subscriptions" tab showing active Pro count and MRR (E11)
- [ ] Admin: "Supplier Proposals" tab with approve/reject workflow (E12)

### SEO Improvements
- [ ] Supplier category landing pages: `/deals/electronics/london` style URLs for SEO [HUMAN-OWNED — route config]
- [ ] Blog/success-story section: completed deal featured articles (content operation, not engineering)

### Security Improvements
- [ ] Supplier KYC: require business verification (company number or VAT) before `vendorVerified = true` [HUMAN-OWNED — KYC flow]
- [ ] Pro subscription: verify Stripe billing portal access is restricted to the subscription owner

### Testing Requirements
- [ ] Pro subscription E2E: checkout → active → cancel → limit re-enforced (E11)
- [ ] Supplier proposal E2E: submit → admin approve → listing created (E12)
- [ ] Final coverage report: confirm ≥60% on critical paths; CI gate active (E13)
- [ ] Full regression suite run on staging before Sprint 6 deploys to production

---

## NORTH STAR TRACKING

Track these metrics weekly starting Sprint 3:

| Metric | Sprint 3 Target | Sprint 6 Target |
|--------|----------------|----------------|
| Weekly Completed Group Value (GMV) | > $0 (first real deal) | > $5,000 |
| Deal fill-rate (wedge) | N/A (seeding) | ≥ 40% |
| Median time-to-fill (hours) | N/A | ≤ 72h |
| Delivery confirmation rate | N/A | ≥ 60% |
| Dispute rate | N/A | < 5% |
| D7 retention (notified vs not) | Baseline | > 30% |
| Platform fee revenue | $0 | > $250/week |

---

## HUMAN-OWNED WORK SUMMARY

The following work **cannot be done by an AI assistant** in this repo and requires a human engineer:

| Category | Examples |
|----------|---------|
| Schema changes (`shared/schema.ts`) | All migrations M2-1 through M12-1 |
| Server code (`server/`) | All API endpoint additions, cron fixes, payment flow wiring |
| CI/CD config | Test runner setup, coverage gates, deployment pipeline |
| Infrastructure | Staging environment, PM2 config, Nginx cache headers |
| Legal | ToS/Privacy Policy updates, money-transmission review |
| Stripe Connect | Platform account approval (external Stripe review) |
| Content/GTM | Seeded supply deals, wedge city selection |
| Sentry DSN | Environment variable configuration in prod |
| VAPID keys | One-time key generation for Web Push |

---

*End of Phase B Execution Blueprint — Grouperry v1.0*  
*This document is the authoritative developer specification. All epics derive from `docs/STRATEGY_PHASE_A.md`. Questions → check Phase A first.*
