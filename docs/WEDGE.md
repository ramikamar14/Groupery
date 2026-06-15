# Grouperry — Liquidity Wedge Playbook
**Maps to:** Phase A §4 Pillar II · Phase B Epic E5 (P0-5)
**Decision:** Geography-free **digital / SaaS & subscription group buys** as the beachhead.
**Date:** 2026-06-15 · **Owner:** Founder / GTM

> This is the one P0 artifact that needs **no engineering** to start. The goal of the wedge is the narrowest market in which Grouperry's loop (deal fills → delivers → completes) repeats reliably. Everything else in the roadmap exists to serve fills in this wedge.

---

## 1. Why digital/SaaS, not a city

| Criterion | Digital/SaaS wedge | Physical local wedge |
|---|---|---|
| **Cold-start density** | None required — a "10 seats for 40% off X" deal draws from the entire internet | Needs local critical mass before any deal can fill |
| **Fulfilment risk** | Near-zero — license key / invite / credit | Shipping, pickup, damage, logistics |
| **Time-to-deliver** | Minutes | Days–weeks |
| **Escrow release loop** | Closes in minutes (instant, verifiable delivery) → tight trust loop | Slow; disputes harder to adjudicate |
| **Savings legibility** | High & recurring ("save $X/month forever") → strong word-of-mouth | One-off, variable |
| **Plays to existing code** | `category: digital`, digital-distribution option, AI description gen already exist | Needs city fields + spatial index (E7) first |

**Conclusion:** the digital wedge removes the two hardest problems at once — *local density* and *fulfilment* — so the team can prove the trust + monetization loop before taking on logistics. Land here, then expand to one physical metro.

---

## 2. Wedge definition (the bounded market)

**In scope (launch):** group buys for digital goods where bulk/seat/volume pricing exists —
- **SaaS seat bundles** (design, productivity, dev tools, AI tools): annual/team plans split across strangers who only need 1 seat.
- **Subscription splits** where the provider's ToS permits family/team sharing (streaming family plans, cloud storage, music).
- **Cloud / API credits** bought at volume tiers.
- **Online courses / bootcamp cohorts / memberships** with group/cohort discounts.
- **Bulk license keys / vouchers** (games, software, gift cards) at reseller volume breaks.

**Out of scope (for now):** anything physical, anything requiring local pickup, anything where provider ToS forbids resale/sharing (screen those out — see §6 Risk).

**Primary persona — the Organiser ("Splitter"):** someone already coordinating SaaS-cost-splitting informally in a spreadsheet or Discord, who wants the platform to handle trust + collection.
**Primary persona — the Buyer ("Saver"):** cost-conscious indie hacker / student / freelancer who wants one seat at the group price without fronting the whole plan.

---

## 3. Seed supply — target 20–40 live deals on launch day

Liquidity is seeded, not waited for. Stand up real deals with real organisers (staff, partners, or recruited power-splitters). Indicative seed set (replace specifics with current market offers and **verify provider ToS for each**):

| # | Category | Example deal shape | Slots | Savings hook |
|---|---|---|---|---|
| 1–6 | SaaS seats | "6 seats on a Team annual plan — split the per-seat cost" (design, PM, dev, AI writing, analytics, email tools) | 5–10 | 30–50% vs solo monthly |
| 7–12 | AI tools | "Pooled API credits / team plan for [LLM/image tool]" | 5–15 | volume tier unlock |
| 13–18 | Cloud/storage | "Family/team cloud storage split" | 4–6 | 40–60% per person |
| 19–24 | Streaming/music | "Family plan seats" (ToS-permitted only) | 4–6 | 50–70% per person |
| 25–30 | Courses/memberships | "Cohort group rate for [course]" | 8–20 | group discount |
| 31–36 | License keys/vouchers | "Bulk key buy at reseller break" | 10–25 | wholesale margin |
| 37–40 | Long-tail | organiser-proposed digital deals | varies | varies |

**Seeding rules:**
- Every seeded deal has a **real organiser, real product, real price** — no fake demand (that's the pump-and-dump pattern E4 defends against; we don't model the behavior we police).
- Default each seed to **Protected mode** (escrow + fee) so the trust loop and monetization are exercised from day one; instant digital delivery makes release fast.
- Price the group rate to a **clear, screenshot-able savings %** — that number is the share asset.

---

## 4. Demand — organiser & buyer recruitment

The deal *must spread to unlock*, so distribution is the product. Recruit where SaaS-cost-splitting already happens:

**Channels (organisers first — they bring their own buyers):**
- Reddit: r/SaaS, r/indiehackers, r/selfhosted, r/churning-adjacent deal subs, tool-specific subs.
- Discord/Slack: indie-hacker, no-code, AI-builder, freelancer communities.
- X/LinkedIn: indie-hacker and "build-in-public" circles.
- Existing spreadsheet/Telegram group-buy groups — offer to migrate their coordination onto Grouperry (trust + collection handled).

**Organiser pitch (one line):** *"Run your cost-split on Grouperry — we hold everyone's money in escrow and release it to you when the group's full, so no one has to trust a stranger with their card."*

**Buyer pitch (one line):** *"Get one seat at the group price. Your money's protected until the deal goes through — or you're refunded."*

**Share-to-fill loop:** every near-full deal ("2 spots left") is the highest-converting share moment — wire the existing share button + the E5 "didn't fill" recovery (extend/rollover) so accumulated demand is never silently lost.

---

## 5. Metrics — track weekly from first seeded deal (by category, not city)

North Star: **Weekly Successfully-Completed Group Value** (deals that filled *and* delivered).

| Metric | Definition | Sprint-3 target | Sprint-6 target |
|---|---|---|---|
| Weekly completed group value | Σ value of delivered, completed deals | > $0 (first real deal) | > $5,000 |
| Fill-rate | completed / (completed + expired) | seeding | ≥ 40% |
| Median time-to-fill | median(completed_at − created_at) | — | ≤ 72h |
| Delivery-confirmation rate | % protected deals confirmed delivered | — | ≥ 60% |
| Dispute rate | disputes / completed | — | < 5% |
| Repeat-organiser rate | organisers running ≥2 deals | — | ≥ 30% |
| Protected-mode share | % of deals chosen Protected | baseline | trending up |

Watch **Protected-mode share** specifically: the strategic bet is that protected deals fill/complete better, pulling organisers toward the monetized mode on their own. If that's true, the data will show it — and that's the green light to lean into monetization (E9).

---

## 6. Risks specific to this wedge

| Risk | Mitigation |
|---|---|
| **Provider ToS forbids sharing/resale** (esp. streaming, some SaaS) | Screen every seed deal for ToS compliance; maintain an allowlist of share-permitted providers; reject proposals that violate ToS. This is a launch-blocking review, owned by founder/legal. |
| **Account-sharing grey area** burns trust if a provider claws back access | Prefer *seat-based team plans* and *volume license keys* (legitimately multi-user) over personal-account sharing; disclose the model honestly on the listing. |
| **Digital fraud** (fake keys, non-delivery) | Protected mode + delivery confirmation + dispute path (E2/E4) is exactly the defense; require proof-of-delivery for protected digital deals. |
| **Thin novelty** (organisers try once, don't return) | Repeat-organiser rate is a tracked metric; the "didn't fill" recovery loop (E5) and fast payouts (E9) are the retention levers. |
| **Chargebacks on digital goods** (card networks favor buyers) | Escrow + explicit delivery confirmation creates the evidence trail; keep dispute SLAs tight. |

---

## 7. Two-week launch checklist (no-engineering items the founder can start now)

- [ ] Pick the 20–40 seed deals; **verify provider ToS** for each (allowlist).
- [ ] Recruit 5–10 organisers from the channels in §4 (warm intros > cold posts).
- [ ] Write the organiser + buyer one-liners into outreach templates.
- [ ] Define the savings % display standard (the share asset).
- [ ] Set the dispute SLA and who staffs it.
- [ ] Stand up the weekly metrics review (§5) — even in a spreadsheet at first.
- [ ] Confirm Protected mode is the default for seeded digital deals (pairs with Phase B E1/E2 when the `protectionMode` field ships).

---

## 8. Expand criterion (when to add the physical wedge)

Add **one physical metro × bulk-household/grocery** wedge only after the digital loop is repeatable:
- ≥ 40% fill-rate sustained for 3+ weeks in the digital wedge, **and**
- positive contribution margin on completed protected deals, **and**
- repeat-organiser rate ≥ 30%.

That milestone is also when Phase B **E7** (spatial indexing, `city` fields) earns its place — not before.

---

*Companion to `docs/STRATEGY_PHASE_A.md` and `docs/EXECUTION_PHASE_B.md`.*
