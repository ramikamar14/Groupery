# Grouperry Improvement Plan

Constraints: frontend only (no edits to `server/`, `shared/`, `ecosystem.config.cjs`,
`.github/workflows/`, `drizzle.config.ts`). Design system = "Momentum": violet
`#6d28d9` (`--v-700`), Poppins, `.gp-card`, `.gp-chip`, `.gp-slot`, hex tokens in
`client/src/index.css`. All work on `main`, auto-deploys via GitHub Actions.

Status legend: [ ] todo · [~] in progress · [x] done

---

## DONE
- [x] Profile picture upload: client-side resize to 512px JPEG + real error surfacing.
- [x] SW cache v3 (network-first for non-hashed assets) — kills stale-design issue.
- [x] Real brand logo (Go infinity mark), OG images, referral `?ref=` capture.
- [x] **Package A** — Admin panel redesign: 11→6 tabs, dropdown menus, Momentum styling.
- [x] **Package B** — Listing urgency + sticky Join CTA + viewer count + countdown.
- [x] **Package C** — ReferralBanner shows rewarded referral count; Profile already has reliability score.
- [x] **Package D** — SavingsSummary component on Profile (deals joined, total saved, avg discount, completed).
- [x] GDPR cookie consent banner (slide-up, localStorage, links to /privacy).
- [x] Newsletter section integrated into landing page.
- [x] "Forgot password? Contact support" link in LoginModal sign-in mode.
- [x] Notification preferences panel on Profile (toggles saved via PATCH /api/user/profile).
- [x] Dark mode toggle in sidebar nav (useTheme hook, system/light/dark, persisted to localStorage).
- [x] 404 page improved with large 404 display and cleaner button layout.

> SERVER ACTION FOR USER (cannot be done from client): remove `GCS_BUCKET_NAME`
> from production `.env` so uploads fall back to local `uploads/` dir. The object
> storage client targets a Replit sidecar (`127.0.0.1:1106`) absent on Hetzner.

---

## REMAINING TODOS

### High Priority
- [ ] **Password reset flow** — no server endpoint exists; only workaround currently is
      "Forgot password? Contact support" link in LoginModal. Needs server-side token
      generation + email + `/reset-password?token=` page. Blocked on server/ restriction.

### Medium Priority
- [ ] **Transactional emails** — join confirmation, "deal filled!" alert, "deal completed"
      email. Server has RESEND_API_KEY support but no triggers. Blocked on server/ restriction.
- [ ] **Stripe Connect UI** — creators need to set up payout accounts. `PayoutOnboarding`
      component exists but UX could be improved; requires Stripe env vars in production.
- [ ] **DE/IT/PT translations** — i18n currently supports EN/AR/FR/ES. Adding German,
      Italian, Portuguese requires ~1200 new keys each in `client/src/lib/i18n.ts`.
- [ ] **PWA install prompt** — no prompt to "Add to home screen". Could be added as a
      `BeforeInstallPrompt` event listener shown as a dismissable banner.

### Low Priority
- [ ] **Social sharing from listing cards** — share button on `DiscoverListingCard` for
      viral loop (currently only on listing detail page).
- [ ] **Back-to-top button** on long Discover page.
- [ ] **Search history** — show recently searched terms in the filter toolbar.
