# Grouperry — Phase A: Strategic Master Plan
**Author:** Office of the Chief Strategy Officer (CEO / CTO / CPO / CMO / Investor / UX lenses)
**Date:** 2026-06-15
**Status:** Master blueprint. Phase B (execution) derives from this and must not contradict it.

---

## 0. Executive Summary

Grouperry is a **group-buying marketplace** where an organiser opens a deal ("10 people needed for 40% off"), others commit, and the deal unlocks when the slot target is hit. After a deep audit of the codebase (28 DB tables, ~120 API endpoints, full React/Capacitor frontend, 4 languages), the headline is counter-intuitive:

> **The product is ~80% feature-complete but ~0% go-to-market-ready.** The risk is not missing features. The risks are (1) a positioning/capability contradiction around money, (2) no enforceable proof that a commitment happened, (3) marketplace cold-start/liquidity, (4) gameable trust mechanics, and (5) release/operational fragility (this very engagement was lost to a caching/deploy incident).

**The one decision that gates everything else:** *Is Grouperry a payments-native trust rail, or a payments-free coordination tool?* The code is already built for the former; the docs claim the latter. **Recommendation: commit to payments-native, escrow-backed group buys (Path A).** It is the only path that simultaneously (a) closes the existential "no proof of coordination" gap, (b) converts already-built-but-dormant infrastructure into a moat, and (c) unlocks a take-rate business model with a far higher ceiling than ads/subscriptions on an empty marketplace.

---

## 1. Situation Assessment (grounded in the audit)

### 1.1 Genuine strengths (do not rebuild these)
- **Deep, coherent domain model.** Listings, participations, orders, milestones, proofs, waitlists, reviews, referrals, reliability scoring, suspicious-flag heuristics, audit logs — this is years of product thinking already shipped.
- **Real money rails exist.** Stripe Connect Express, off-session charging on group-fill, platform-fee split, refunds, Escrow.com sandbox. Most "fintech-adjacent" startups spend 6–12 months here.
- **Trust & safety scaffolding.** KYC (ID+selfie+admin review), reliability score, warn/kick, blocking, reports, fraud heuristics (rapid-join, message-spam, multi-report).
- **Production-grade frontend.** Momentum design system, dark mode, 4 languages incl. RTL Arabic, PWA + Capacitor iOS/Android, comprehensive admin suite.
- **Operational instrumentation.** Email queue + cron, activity feed, system-event audit trail, admin health endpoint.

### 1.2 Existential risks (these kill the company, not the sprint)
1. **Positioning ↔ capability contradiction (P0).** "Pure coordination" messaging vs. a built take-rate payment engine. Every downstream decision (legal, KYC depth, dispute policy, monetization) forks here. *Unresolved, you ship a product that lies about itself in one direction or the other.*
2. **No enforceable commitment artifact (P0).** In coordination-only mode, "I commit to pay you $X by Friday" produces only chat logs. When disputes arise — and in group buying they always do — there is no receipt, no ledger, no proof. This is legally and operationally fatal and was already flagged internally.
3. **Marketplace liquidity / cold-start (P0 business).** A group buy with 1/10 slots is worth zero. Density is geographic and categorical. The platform has no liquidity strategy, no supply-seeding engine, no "what happens when the group doesn't fill" recovery loop beyond a silent expiry.
4. **Gameable trust mechanics (P1).** The core mechanic ("unlock when full") invites Sybil fill (fake accounts to fake momentum) and pump-and-dump (build to 80%, cancel, redirect to scam). Verification is not required to participate.
5. **Release & operational fragility (P1).** Single PM2 instance, in-process cron (double-fires if scaled), single-node in-memory cache, no staging, no error monitoring (Sentry), and a service-worker/CDN cache discipline that just cost a multi-hour outage of *the wrong design being served*. Growth will amplify each of these.

### 1.3 Scale bottlenecks (predictable, pre-growth)
- Listing detail = ~9 sequential queries/request.
- Discovery = 4 independent full-table scans per load.
- `listing_views` grows unbounded (insert per view, no bucketing).
- `lat/lng` stored as TEXT → no spatial index, runtime CAST per row.
- Estimated first failures at 300–500 concurrent users.

### 1.4 Maturity scorecard
| Domain | Completeness | Confidence |
|---|---|---|
| Data model | 95% | High |
| Core API | 95% | High |
| Frontend flows | 85% | High |
| Payments rails | 90% built / 30% activated in UX | Medium |
| Trust & safety | 70% | Medium |
| Liquidity / GTM | 5% | High (it's absent) |
| Release/ops maturity | 40% | High |
| Test coverage | ~10% | High (it's thin) |

---

## 2. Product Vision & North Star

**Vision:** *Make collective buying power a default consumer behavior — the safest, simplest way for strangers and communities to buy together and save, with trust guaranteed by the platform rather than by hope.*

**Positioning (recommended):** Not "Groupon" (merchant-led discounts) and not a Facebook-group spreadsheet (coordination-only). Grouperry is the **trust rail for demand aggregation**: buyers pool, money is held safely until the deal is delivered, and the platform underwrites the trust.

**North Star Metric:** **Weekly Successfully-Completed Group Value (GMV of deals that filled *and* delivered).** It captures liquidity (deals fill), trust (deals deliver), and monetization (take-rate rides on it) in one number. Vanity metrics (signups, listings created) are explicitly demoted.

**Supporting "health of the loop" metrics:** deal fill-rate, time-to-fill, completion (delivery-confirmed) rate, dispute rate, repeat-organiser rate, repeat-buyer rate.

---

## 3. The Pivotal Decision: Payments Posture

### Option A — Payments-native, escrow-backed (RECOMMENDED)
Money is held by the platform/escrow on commitment, charged on fill, released on delivery confirmation; platform earns a take-rate.
- **Pros:** Closes the proof-of-coordination gap structurally; turns existing code into a moat; highest revenue ceiling; strongest trust narrative; enables buyer protection as the marketing wedge.
- **Cons:** Regulatory/compliance load (money transmission, KYC/AML, chargebacks, tax/invoicing); requires reliability and support maturity; higher stakes on bugs.
- **Why it wins:** The hardest part (the rails) is *already built*. Walking away from it to de-risk legally is paying the full cost of the infrastructure and capturing none of the value — while still inheriting the dispute liability of coordinating other people's money.

### Option B — Coordination-only
No money touch; monetize via featured listings / subscriptions / supplier leads.
- **Pros:** Lower regulatory burden; faster to "launch."
- **Cons:** The proof gap remains and must be patched with receipts/ledgers anyway; monetization ceiling is low and depends on liquidity that doesn't exist yet; the built payment stack becomes dead weight; "coordination platform" is a weak, undefensible position.

### Recommendation & guardrails — CONFIRMED: Hybrid "Trust Mode is a per-listing choice"
**Founder decision (2026-06-15): both modes are first-class; the organiser chooses per listing and the buyer decides with full disclosure.** This is the strongest form of Path A — the market, not the platform, drives adoption of protection.

**The model — "Protection Mode" set at listing creation:**
1. **Protected (escrow) deal** — funds held via Escrow.com/Stripe until the buyer confirms delivery; a transparent **buyer-protection fee** (the platform take-rate, `STRIPE_PLATFORM_FEE_BPS`) applies and is shown in the price breakdown *before* commit. Buyers see a green **"Buyer Protection"** badge on the card and detail page.
2. **Direct (coordination-only) deal** — no money flows through the platform; organiser and buyers settle directly; **no fee**. Buyers see a neutral **"Direct deal — no buyer protection"** notice so the trade-off is explicit.
3. **The buyer chooses with disclosure:** badge + one-line explanation + fee shown pre-commit. No dark patterns — the protection trade-off is stated plainly in the listing and at the commit step.

**Why this is the optimal design (strategic insight):**
- It removes the launch blocker of "are we a money business?" — we are *both*, and the listing declares which.
- **Protected deals will fill faster and complete more reliably** (trust reduces buyer hesitation), so the data will pull organisers toward protection on its own. Monetization compounds as a *consequence* of trust, never as a tax we impose.
- It preserves the low-friction friends-and-family use case (Direct mode) while giving strangers a safe way to transact (Protected mode) — covering both the social and the marketplace motions with one mechanic.

**Implementation shape (detail handed to Phase B):**
- `listings` gains a `protectionMode` enum (`protected` | `direct`) + fee-disclosure fields (server/shared schema change — **human-owned**, flagged in Phase B). `orders`/escrow fields already exist.
- Listing-create UI adds a Protection Mode selector with plain-language copy and a category-aware *recommended default* (digital/high-value → suggest Protected).
- Card + detail render the trust badge; commit dialog shows the fee line for Protected deals and a "you are settling directly" acknowledgement for Direct deals.
- Reliability surface: show "% of this organiser's deals that were Buyer-Protected and delivered."

**Guardrails (unchanged):**
- **Compliance gate (acceptance criterion, §7):** legal review of money-transmission posture per launch geography *before* enabling real charges beyond sandbox — applies to Protected mode only.
- **Anti-confusion:** crisp, consistent badges everywhere a listing appears; the two modes must never be ambiguous.
- **Anti-abuse:** Direct mode must not become a loophole to dodge fees on what are really high-risk stranger transactions — pair with the P0-4 fraud floor (verified-to-participate above a value threshold regardless of mode).

---

## 4. Strategic Pillars

**Pillar I — Trust as the Product.** Buyer protection, enforceable commitments, KYC-gated participation, fraud defense. This is the moat and the marketing.

**Pillar II — Liquidity Before Features.** Win a narrow wedge to density, with a supply-seeding playbook and a "didn't fill" recovery loop. No new consumer features until a wedge has repeatable fills.

> **CHOSEN WEDGE (CSO call, 2026-06-15): geography-free digital / SaaS & subscription group buys.**
> **Rationale:** (1) *Solves cold-start structurally* — a "10 people for 40% off [SaaS/streaming/cloud credits]" deal draws from the entire internet, not one neighbourhood, so we never need local density to reach the unlock threshold. (2) *Lowest fulfilment & dispute risk* — delivery is a license key / invite / credit, near-instant and verifiable, which makes **Protected-mode escrow release clean and fast** (the trust loop closes in minutes, not weeks of shipping). (3) *High, legible savings* on recurring spend → strong word-of-mouth and share-to-fill virality. (4) *Plays to existing strengths* — the `category: digital` path, AI description generation, and the digital-distribution option already exist.
> **Beachhead motion:** seed 20–40 high-demand digital deals; recruit organisers from existing online communities (Reddit/Discord/maker & indie-hacker circles) where SaaS-cost-splitting already happens informally in spreadsheets. **Land-and-expand:** once the loop is repeatable, extend to one physical local wedge (a single metro × bulk household/grocery) to prove the logistics-heavy motion. Phase B's P0-5 seeding playbook and dashboards are written against this digital wedge.

**Pillar III — Operational Reliability.** Staging env, error monitoring, release discipline, scale hardening, externalized cron/cache. Earned the hard way this week.

**Pillar IV — Monetization on Real Volume.** Take-rate first (rides on escrow), then organiser Pro subscriptions and supplier lead-gen — sequenced *after* liquidity, not before.

**Pillar V — Growth Loops.** Referral (built, underused), share-to-fill (the deal *needs* spreading to unlock — viral by construction), success-story social proof, lifecycle notifications (push + email triggers that are currently missing).

---

## 5. Prioritized Initiatives

Priorities: **P0** = launch-blocking / existential. **P1** = required for sustainable growth. **P2** = leverage. **P3** = opportunistic.

### P0 — Foundations (no real launch without these)
- **P0-1 Resolve payments posture & align all messaging/legal** (Pillar I/IV). Pick Path A; reconcile docs, badges, ToS, and UX to one truth.
- **P0-2 Enforceable commitments / Buyer Protection** (Pillar I). Activate escrow flow end-to-end in the UI (or, if Path B, ship commitment receipts + payment ledger). Deliver-confirm → release; expiry → refund.
- **P0-3 Production hardening & release discipline** (Pillar III). Staging environment, Sentry error monitoring, the cache/SW incident class permanently closed, deploy/rollback runbook.
- **P0-4 Fraud floor for the core mechanic** (Pillar I). Require verified identity to participate in deals above a threshold; detect Sybil fill and sudden-cancel pump-and-dump; rate-limit account creation by device/phone.
- **P0-5 Liquidity wedge definition & supply seeding** (Pillar II). Choose the beachhead; instrument fill-rate/time-to-fill; build the "didn't fill" recovery loop (extend/notify/rollover) replacing silent expiry.

### P1 — Growth-critical
- **P1-1 Lifecycle notifications** (Pillar V). Wire the *already-built* email queue triggers (join confirmed, deal filled, deal completed, expiring) + web/mobile push. Retention is impossible without this.
- **P1-2 Scale hardening** (Pillar III). Collapse the 9-query listing detail; cache/bucket discovery; bucket `listing_views`; migrate `lat/lng` to a spatial type + index.
- **P1-3 Success-story / social-proof engine** (Pillar V). Completed deals currently vanish; surface them as testimonials and SEO surface area.
- **P1-4 Take-rate monetization live** (Pillar IV). Turn on the platform fee transparently with organiser payout UX polish; invoices/receipts.
- **P1-5 Trust score made legible** (Pillar I). Replace numeric badges with narrative ("completed 12 deals, ships 3 days faster than promised").

### P2 — Leverage
- **P2-1 Organiser Pro subscription** (tiered listings/analytics/verified badge).
- **P2-2 Supplier/vendor lead-gen** (suppliers pay for demand signals).
- **P2-3 Featured/boosted listings** (only meaningful once browse traffic exists).
- **P2-4 AI Deal Scout** (personal agent: monitor, match, suggest join timing) — move AI from supportive to core loop.
- **P2-5 Test coverage to a credible floor** (payments, join race-conditions, auth).

### P3 — Opportunistic
- **P3-1 DE/IT/PT localization** (only if a wedge is in those markets).
- **P3-2 White-label / embed widget** (B2B SaaS; large effort, post-PMF).
- **P3-3 Contact-form backend wiring, Vouchers page refactor, app-icon/asset cleanup, a11y pass.**

---

## 6. Roadmap (phased, outcome-oriented)

**Phase 1 — STABILIZE (Weeks 1–3).** P0-3 ops hardening + P0-1 posture decision + P1-1 notification triggers (quick, high ROI). *Exit:* zero release incidents, monitored errors, one source of truth on positioning.

**Phase 2 — TRUST (Weeks 3–7).** P0-2 buyer protection live, P0-4 fraud floor, P1-5 legible trust. *Exit:* a buyer can complete a deal with money protected and a dispute path; Sybil/pump-and-dump defended.

**Phase 3 — LIQUIDITY (Weeks 6–12, overlaps).** P0-5 wedge + seeding + recovery loop, P1-3 social proof, P1-2 scale hardening. *Exit:* repeatable fills in the wedge; fill-rate and time-to-fill trending right.

**Phase 4 — MONETIZE (Weeks 10–16).** P1-4 take-rate, then P2-1/P2-2. *Exit:* positive contribution margin per completed deal.

**Phase 5 — SCALE (Weeks 14+).** P2-3/P2-4, geographic expansion, P3 items. *Exit:* growth loops compounding; CAC < LTV.

---

## 7. Success Metrics & Acceptance Criteria (per major recommendation)

| Initiative | Success Metric | Acceptance Criteria (Definition of Done at strategy altitude) |
|---|---|---|
| **P0-1 Posture** | Single coherent positioning | Founder sign-off on Path A/B; ToS + privacy + UI badges + docs all consistent; legal review of money-transmission for launch geo **completed and passed**. |
| **P0-2 Buyer Protection** | Delivery-confirmed completion rate; dispute resolution time | A buyer joins → funds held → deal fills → charged → delivery confirmed → released; expiry/failure → auto-refund; dispute opens a defined workflow with evidence (proofs) attached; reconciliation matches Stripe/Escrow ledger to the penny in staging. |
| **P0-3 Ops hardening** | Release incident rate → 0; MTTR | Staging env mirrors prod; Sentry capturing FE+BE errors with alerts; documented deploy + one-click rollback; the SW/CDN stale-asset class provably closed (versioned assets + correct cache headers verified in prod). |
| **P0-4 Fraud floor** | Fraud/chargeback rate; flagged-account precision | Verified ID required to join deals above threshold; Sybil-fill detector + sudden-cancel detector firing into the existing suspicious-flags queue; account creation rate-limited by phone/device. |
| **P0-5 Liquidity wedge** | Fill-rate, time-to-fill in wedge | Wedge documented; ≥N seeded supply deals live; "didn't fill" loop (extend/notify/rollover) replaces silent expiry; dashboards live for fill-rate & time-to-fill. |
| **P1-1 Notifications** | D1/D7 retention; deal-fill conversion | Queue triggers wired for join/fill/complete/expiring; web push + mobile push delivered; user notification prefs respected; opt-out works. |
| **P1-2 Scale** | p95 latency at 1k concurrent | Listing detail ≤3 queries; discovery cached/bucketed; `listing_views` bucketed; `lat/lng` spatial-indexed; load test passes 1k concurrent without pool starvation. |
| **P1-4 Take-rate** | Net revenue per completed deal | Platform fee applied + shown transparently pre-commit; organiser payout onboarding completes; buyer/organiser receipts generated; refunds reverse the fee correctly. |

---

## 8. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Regulatory exposure on holding funds | Med | High | Path-A compliance gate (§7 P0-1); use Stripe/Escrow as the regulated rail; geo-phase launches. |
| Liquidity never reaches density | High | High | Narrow wedge; supply seeding; share-to-fill viral mechanic; kill silent expiry. |
| Fraud erodes trust early | Med | High | P0-4 floor before scale; verified-to-participate; manual review queue already exists. |
| Release incidents during growth | Med (proven) | Med | P0-3 ops hardening; staging + monitoring + rollback. |
| Scope sprawl (80% feature-complete invites gold-plating) | High | Med | This plan's prioritization is the forcing function; "liquidity before features." |
| Founder fatigue / thrash (observed this week) | Med | Med | Tight Phase-1 wins (notifications, ops) to rebuild momentum and trust in the process. |

---

## 9. Investor Lens — the one-paragraph thesis
Grouperry has de-risked the *build* (rails, trust scaffolding, multi-platform UX) and not yet touched the *market*. That is the rarer and better position than the reverse — but only if the company now refuses to add features and instead spends its next quarter on trust activation, a liquidity wedge, and operational reliability. The investable milestone is **repeatable, delivery-confirmed group completions in one wedge with positive contribution margin** — not feature count. Fund to that milestone; gate the next round on the North Star metric.

---

## 10. Handoff to Phase B (Execution)
Phase B converts every P0/P1 initiative (and P2 where specified) into epics, user stories, technical specs, DB/API/FE/BE tasks, QA plans, deployment plans, effort, risk, and a Sprint 1–6 plan — using the mandated per-issue format. Phase B assumes **Path A** unless the founder redirects. Constraints noted in the repo (no edits to `server/`, `shared/`, CI, etc.) are **development-environment constraints for the AI assistant, not product constraints**; Phase B will flag where a recommendation requires server/infra work that a human engineer must own.
