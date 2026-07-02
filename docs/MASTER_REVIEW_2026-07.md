# Grouperry — Master Review & Improvement Plan (July 2026)

Synthesis of three parallel deep reviews: code/security audit, product/UX audit,
and strategy/marketing review. This document supersedes the priority ordering in
EXECUTION_PHASE_B.md (the strategy docs remain valid context).

---

## The one-paragraph verdict

The engineering foundation (28-table data model, KYC stack, reputation system,
atomic slot SQL, Stripe Connect) is far ahead of typical early-stage products —
but the **money layer is not production-grade** (escrow runs against a sandbox;
several charge/refund paths are exploitable), the **landing page shows fabricated
data on a trust product**, two visible features are **facades with no backend**
(vouchers, Protection Mode), and the single most important feature for the
chosen SaaS wedge — **recurring monthly deals** — doesn't exist. Strategy-wise,
"strangers" is the fragile half of the wedge: pivot the framing to
**communities/teams buying legitimate multi-user seats**, which dissolves both
cold-start and ToS risk at once.

---

## P0 — Block-launch items (fix before ANY marketing effort)

### P0.1 Money-layer critical bugs (from code review)
| ID | Defect | Where |
|----|--------|-------|
| C1 | Private group chat exposed on public listing endpoint | `server/routes.ts:185-221` |
| C2 | Escrow client hardcoded to Escrow.com **sandbox** — no real funds ever held | `server/escrow.ts:8` |
| C3 | Account pre-takeover: unverified email registration + Google auto-link by email | `server/replit_integrations/auth/routes.ts:85-112` |
| C4 | Buyers chargeable for amounts they never agreed to (pricePerSlot editable after commit) | `server/payments.ts:43` + `shared/routes.ts:61` |
| C5 | Creator can self-complete unfilled deal and charge everyone | `server/routes.ts:352-359` |
| C6 | Escrow tx created before order exists, outside transaction (orphaned fundable escrows) | `server/routes.ts:553-585` |
| C7 | `removeParticipant` corrupts slot accounting (no txn, no floor at 0) | `server/storage.ts:628-638` |
| C8 | Admin refund endpoints change money state without moving money | `server/routes.ts:659-674` |

Also HIGH: CSRF gap (H1), expired deals joinable (H2), phone-OTP account
pollution (H3), stale-read completion side effects (H4), webhook amount
mismatch orphans (H5), unescaped HTML in emails (H6).

### P0.2 Honesty fixes (from strategy review) — zero cost, this week
The landing components ignore the correct i18n wedge copy and render
**fabricated content**:
- `landing-v2/trust.tsx` — invented testimonials ("kitchen appliances with 12 neighbours")
- `landing-v2/categories.tsx` — fake deal counts ("Groceries 189 deals")
- `landing-v2/hero.tsx` — hardcoded "$2.4M saved / 12k+ savers" on mobile
- `landing-v2/how-it-works.tsx` — "Three steps to wholesale" (off-wedge)
- `client/index.html` — generic SEO meta, zero wedge alignment

Replace fake numbers with honest founding-member framing. Never drive traffic
to this page before it's fixed.

### P0.3 Kill the facades (from product audit)
- **Vouchers**: offer-type picker, claim button, `/vouchers` page have **no
  backend at all** (no table, no routes). Strip the UI now; rebuild later
  behind a flag if wanted.
- **Protection Mode**: `escrowEnabled` referenced in UI does not exist in the
  schema; no create-flow selector; escrow is sandbox. Decide: ship the real
  per-listing `protectionMode` column + Stripe hold/capture as the engine
  (recommended — drop Escrow.com entirely, its fee structure kills margin on
  sub-$50 digital items), or remove the protected-deal UI until true.

---

## P1 — The wedge-completing features (next 30–60 days)

Ranked by the product audit's impact assessment:

1. **Recurring/subscription deals (L)** — monthly renewals, member replacement,
   scheduled off-session charges. Without this, every subscription split dies
   after one cycle; the category leaders are built entirely on this.
2. **Real Protection Mode end-to-end (L)** — `protectionMode` column, create-flow
   selector, Stripe capture-on-fill / transfer-on-confirm (already 80% built in
   `payments.ts`).
3. **Push notifications (M)** — web push + Capacitor FCM/APNs. The fill loop is
   time-critical; email latency kills it.
4. **Server-rendered per-listing OG/SEO + dynamic sitemap (M)** — share-to-fill
   currently produces generic link previews; deals are invisible to Google.
   Fix the 404ing `/how-it-works` while at it.
5. **Credential/fulfilment vault for digital deals (M)** — keys revealed
   per-member after charge, member confirms access → triggers release.
6. **Deal requests / "wanted" board (M)** — Drop's original growth engine;
   cheapest cold-start lever.
7. **Buyer-visible dispute & refund tracking (M)** — status timeline,
   auto-refund on expiry.
8. **Wallet/credit balance (M)** — makes referral rewards real, refunds instant.
9. **Wedge-native deal templates (S)** — replace Electronics/Groceries templates
   with SaaS seats / streaming family plan / cloud credits / course cohort.
   Highest leverage-per-hour on the list.
10. **Route-level code splitting (S/M)** — 1.4 MB bundle; lazy-load all 21
    routes; Admin should never ship to regular users.

---

## Strategy: the sharpened thesis

**Old:** "Strangers split SaaS subscription costs, protected by escrow."
**New:** *"Grouperry is the trust rail that lets a community buy team-plan
software together at team prices — legitimately, with everyone's money
escrowed until the seats are delivered."*

Three moves inside that sentence:
- **strangers → communities** (Discord servers, cohorts, subreddits, creator
  audiences). Dissolves cold-start: the group pre-exists, deals fill fast.
- **subscription sharing → legitimate multi-user seats** (Figma/Notion/JetBrains
  team plans, volume licenses, cloud/API credits, course cohorts). Dissolves
  ToS/legal risk — this is what killed/threatens Spliiit-style products
  (Canal+/beIN lawsuits, Netflix 2023 crackdown). Avoid personal-account
  credential sharing entirely.
- **escrow.com → Stripe hold/capture**. Escrow.com's fee floor eats the entire
  margin on sub-$50 items; Stripe Connect separate charges & transfers with
  capture-on-fill is already mostly built.

**Unit economics reality:** 5% take on $260k/yr GMV ≈ $9k net — take-rate funds
the loop; the real business is organiser Pro subscriptions + eventual
vendor-side placement.

## Positioning (A/B the homepage)

**A — Indie hacker (current hero, keep):** "Pay team prices — without a team."
**B — Community organiser (recommended lead):** "Run a group buy for your
community — we handle the money and the trust."
**C — Small team (dedicated `/for-startups` SEO page):** "Get team-plan software
prices before you're a big team."

## Marketing 30/60/90 (zero budget)

- **0–30:** Fix landing honesty first. Pick ONE community (r/SaaS,
  r/indiehackers, or one AI-builder Discord). Recruit 3–5 organisers, run 5
  real deals end-to-end white-glove. Ship programmatic SEO template.
- **30–60:** `/split/[tool-slug]` programmatic pages ("split figma
  subscription") — 100–300 tool pages, Spliiit's proven SEO play. Turn on
  referral/share-to-fill loop with live slot-meter share cards.
- **60–90:** 3–5 micro-creator partnerships (organiser role + referral rev).
  Double down on whichever channel produced completed deals; cut the rest.
- **Don't:** paid ads, broad Product Hunt launch (save the one shot), multiple
  communities at once.

## Weekly metrics (in order)

1. # deals reaching first real commitment (earliest liquidity signal)
2. Fill rate ≥ 40% (< 25% after 6 weeks of seeding = wrong wedge)
3. Median time-to-fill ≤ 72h
4. Landing → signup (>5%) → first-join (>15%)
5. Referral coefficient: each filled deal → ≥1 new participant

Ignore: total signups, page views, listings created.

## Kill criteria (90 days)

Fill rate <25% / time-to-fill >2wk / referral ≈0 / repeat-organiser <15% →
pivot. Pivot 1 (low effort): communities/teams framing (start now anyway).
Pivot 2 (fallback): B2B embeddable "Stripe-for-group-buys" escrow-collection
widget — monetizes the trust rail without two-sided liquidity.

## Testing priorities (from code review)

1. `joinListing`/`leaveListing`/`removeParticipant` concurrency (core inventory invariant)
2. `chargeCompletedListing` + webhook reconciliation (money movement)
3. Authorization matrix over all mutating routes
4. Commit flow race/duplicate/escrow-failure paths
5. `transitionListing` state machine + expiry boundary
