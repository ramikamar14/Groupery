# Grouperry — Group Buying, Made Simple

**Live site:** https://grouperry.com

Grouperry is a marketplace where people organise group purchases to unlock bulk/wholesale pricing. An organiser creates a deal listing (e.g. "10 people needed to get 40% off Figma Pro"), others commit to join, and when the slot target is reached the deal unlocks and everyone saves.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui component library |
| Animations | Framer Motion |
| Icons | Lucide React |
| State / Data | TanStack Query (React Query) |
| Routing | Wouter |
| i18n | i18next (EN / AR / FR / ES) |
| Backend | Express 5, Node.js |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Session-based (passport.js) + Google OAuth |
| Payments | Stripe Connect (env-gated) |
| Deployment | PM2 on Ubuntu VPS, GitHub Actions CI/CD |

---

## Frontend Structure

```
client/
  src/
    pages/          # Route-level pages
      Landing.tsx         — public landing page (unauthenticated)
      Home.tsx            — authenticated home / deal discovery
      ListingDetails.tsx  — single deal page
      CreateListing.tsx   — create a new group deal
      Dashboard.tsx       — user dashboard with stats
      Profile.tsx         — user profile + KYC verification
      Admin.tsx           — admin panel
      Discover.tsx        — browse/search all deals
      MyGroups.tsx        — deals the user joined
      ...
    components/
      landing-v2/         — landing page sections (hero, how-it-works, stats, etc.)
      listing/            — deal page components (chat, milestones, participants, etc.)
      billing/            — Stripe payment components
      explore/            — discovery filters, activity feed
      ui/                 — shadcn/ui primitives
    lib/
      analytics.ts        — provider-agnostic analytics (Plausible/GA4/PostHog)
      stripe.ts           — Stripe client helper
      i18n.ts             — i18next setup
```

---

## Design System

- **Primary colour:** Purple (`#6d28d9` / Tailwind `violet-700`)
- **Font:** Poppins (loaded from Google Fonts)
- **Radius:** `rounded-2xl` / `rounded-3xl` for cards
- **Theme:** Supports light + dark mode via CSS variables in `client/src/index.css`
- **Component library:** shadcn/ui — customised in `client/src/components/ui/`
- **Tailwind config:** `tailwind.config.ts`

---

## Key Pages to Redesign

The frontend needs a mobile-first redesign. Priority pages:

1. **Landing page** (`client/src/pages/Landing.tsx` + `client/src/components/landing-v2/`) — hero, how-it-works, categories, stats, footer
2. **Home / Discover** (`client/src/pages/Home.tsx`, `Discover.tsx`) — deal cards grid, filters toolbar
3. **Deal detail** (`client/src/pages/ListingDetails.tsx`) — deal info, commit flow, chat, milestones
4. **Dashboard** (`client/src/pages/Dashboard.tsx`) — stats cards, deal list
5. **Profile** (`client/src/pages/Profile.tsx`) — avatar upload, bio, verification flow

The `ListingCard` component (`client/src/components/ListingCard.tsx`) is used everywhere deals are listed — improving this single component has the highest impact.

---

## Do Not Touch

- `server/` — all backend code; do not modify
- `shared/` — shared TypeScript types and DB schema
- `ecosystem.config.cjs` — PM2 production config
- `.github/workflows/` — CI/CD pipelines
- `drizzle.config.ts` — database migration config

---

## Running Locally

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and SESSION_SECRET
npm run dev            # starts both Vite dev server and Express API
```

The app runs at `http://localhost:5000`.
