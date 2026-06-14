# Grouperry Improvement Plan

Constraints: frontend only (no edits to `server/`, `shared/`, `ecosystem.config.cjs`,
`.github/workflows/`, `drizzle.config.ts`). Design system = "Momentum": violet
`#6d28d9` (`--v-700`), Poppins, `.gp-card`, `.gp-chip`, `.gp-slot`, hex tokens in
`client/src/index.css`. All work on `main`, auto-deploys via GitHub Actions.

Status legend: [ ] todo · [~] in progress · [x] done

---

## DONE
- [x] Profile picture upload: client-side resize to 512px JPEG + real error surfacing
      (`client/src/pages/Profile.tsx`).
- [x] SW cache v3 (network-first for non-hashed assets) — kills stale-design issue.
- [x] Real brand logo (Go infinity mark), OG images, referral `?ref=` capture.

> SERVER ACTION FOR USER (cannot be done from client): remove `GCS_BUCKET_NAME`
> from production `.env` so uploads fall back to local `uploads/` dir. The object
> storage client targets a Replit sidecar (`127.0.0.1:1106`) absent on Hetzner.

---

## PACKAGE A — Admin panel redesign  (file: `client/src/pages/Admin.tsx`, isolated)
Problem: 11 tabs, ~80 buttons, raw shadcn styling, 6-button user row in clashing
colors, no confirm dialogs on Ban/Reset.

How to fix:
1. **Regroup 11 tabs → 6** via `TabsList`:
   - Moderation (Verifications + Reports + Suspicious — sub-sections within one tab)
   - Users (keep)
   - Operations (Health + System Events + Edit History)
   - Listings & Orders (Orders + listing feature/trending toggles)
   - Analytics (stats + AI analyze)
   - Settings (keep)
   Keep all existing queries/mutations; only reorganize the `TabsTrigger`/`TabsContent`.
2. **User row (worst offender):** replace the 6 inline buttons with ONE primary
   button (Ban/Unban, `variant="outline"`) + a `DropdownMenu` (`⋮`) holding
   Make/Remove Admin, View Activity, Reset, Delete (Delete = `text-destructive`).
   Use shadcn `DropdownMenu` (already in `components/ui`).
3. **Momentum styling:** swap shadcn `<Card>` for `.gp-card` wrappers; replace
   hardcoded `text-green-600/blue-700/amber-500` with tokens (`--emerald`,
   `--v-700`, `--amber-c`, `--red-c`); titles `font-display`; active tab
   `text-primary` not `text-accent`.
4. **Confirm dialogs** for Ban and Reset (mirror the existing Delete `Dialog` at
   ~line 1567). Add `Loader2` spinner to every mutation button while `isPending`.
5. **Mobile:** tab bar `flex-wrap`, icons-only under `sm:`; user filters stack
   vertically; stat cards `grid-cols-2 md:grid-cols-4`.

## PACKAGE B — Urgency + sticky Join  (files: `client/src/pages/ListingDetails.tsx`)
Problem: no FOMO; mobile Join button buried below 5 sections.

How to fix:
1. **Sticky mobile Join CTA:** fixed bottom bar (above bottom nav) showing price +
   "X spots left" + a 56px violet gradient Join button; `sm:hidden`; only when the
   deal is active and user hasn't joined.
2. **Urgency header badge:** if `slotsLeft <= 3` or `hoursLeft <= 9`, show a red
   `.gp-almost`-style chip near the title: "🔥 80% full · 6h left".
3. **Live viewer count:** the presence ping already exists (~line 256). Add a
   `👁 N viewing` chip fed by `GET /api/listings/:id/presence` (read-only, exists).
4. **Countdown:** reuse the `DiscoverDealOfTheDay` countdown styling (dark pill,
   turns red when <9h).

## PACKAGE C — Referral value + trust visibility
Files: `client/src/components/explore/ReferralBanner.tsx`, `client/src/pages/Profile.tsx`
Problem: referral shows count but no $ earned; reliability score fetched but never shown.
How to fix:
1. ReferralBanner: render reward value from `/api/referrals/stats` (show
   `rewardedReferrals` × reward, and "You've earned $N"). Add progress to next reward.
2. Profile: render the already-fetched `reliability.score` as "Reliability N/100"
   with a tooltip breakdown; show verification status ("✅ ID verified" /
   "🔄 Review pending") near the name.

## PACKAGE D — Savings dashboard (higher effort; data already in reliability/stats)
File: new `client/src/components/profile/SavingsSummary.tsx`, used in Profile.
Show: total saved, deals done, avg discount, streak (from existing stats endpoints).
No backend changes — derive from `/api/users/:id/reliability` + `/api/my-groups`.

---

## Execution: delegate each package to a Sonnet agent (token savings).
Order: A and B in parallel (different files), then C, then D.
