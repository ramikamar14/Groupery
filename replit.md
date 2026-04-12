# Grouperry

## Overview

Grouperry is a group buying coordination platform that enables users to form groups for bulk purchases, share costs, and unlock group deals. The application facilitates listing creation, group participation, and real-time chat coordination between participants. It explicitly does not handle payments - it focuses purely on coordination.

The stack is a full-stack TypeScript application with React frontend, Express backend, PostgreSQL database with Drizzle ORM, and Replit Auth for authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built with Vite
- **Routing**: Wouter for client-side routing with protected route wrappers
- **State Management**: TanStack React Query for server state caching and mutations
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Fonts**: DM Sans (body) and Outfit (display) via Google Fonts
- **Animations**: Framer Motion for page transitions and micro-interactions

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in a centralized route manifest (`shared/routes.ts`) with Zod schemas for validation
- **Authentication**: Replit Auth via OpenID Connect with Passport.js, sessions stored in PostgreSQL
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries
- **Build**: esbuild for server bundling, Vite for client bundling

### Data Model
Core entities:
- **Users**: Managed by Replit Auth, stored in `users` table with extended fields:
  - `userType`: "individual" or "vendor" - distinguishes personal users from business accounts
  - `verificationStatus`: "pending", "verified", "rejected" - identity verification workflow
  - `idDocumentUrl`, `selfieUrl`: URLs for verification document uploads
  - `isAdmin`: Boolean flag for admin privileges
  - `rating`, `ratingCount`: User rating system
  - `city`, `bio`: Extended profile fields (city/location + personal bio)
  - `phone`, `phoneVerified`: Phone number with OTP-verified status
  - `role`: User role enum ("user", "admin", "moderator")
  - `isDisabled`: Admin ban/disable flag
  - `reliabilityScore`, `joinCount`, `completedParticipations`, `cancelledParticipations`, `noShowFlags`: Reliability metrics
- **Listings**: Group buying opportunities with categories (physical, digital, offer), slots, expiration, location data, GPS coordinates (latitude/longitude) for nearby search, country and language fields for filtering
- **ListingImages**: Multiple images per listing with sort order
- **Participations**: Join table tracking which users joined which listings
- **Messages**: Per-listing group chat messages
- **Reports**: User-submitted reports for moderation with `resolved` status
- **Warnings**: Tracks warnings issued to participants by listing creators
  - `warnedAt`, `kickableAt` (1 hour after warning), `kicked` status
  - Used for the warn → wait 1 hour → kick workflow
- **VendorDetails**: Business information for vendor accounts (name, license, address, etc.)
- **Notifications**: In-app notification system for join events, messages, verification updates, warnings
- **BlockedUsers**: User blocking functionality
- **SavedListings**: User bookmarks/saved listings
- **Reviews**: User-to-user reviews with 1-5 rating after completed listings
- **ListingViews**: View tracking per listing for trending algorithm
- **ListingUpdates**: Host announcements/updates posted to listing participants

### Location-Based Search
- Listings can include optional GPS coordinates (latitude/longitude)
- The Browse page has a "Nearby" button that uses the browser's Geolocation API
- Backend uses bounding box filtering with a default radius of ~10km (0.1 degrees)
- CreateListing page has "Use My Location" button to capture coordinates

### Key Features
- **User Types**: Two-tier system - Individual users and Vendors with business profiles
- **Identity Verification**: Onboarding flow with ID document + selfie upload, admin approval workflow
- **Admin Dashboard**: Pending verifications management, reports queue, platform statistics
- **Notifications System**: In-app notifications with unread counts displayed in navigation
- **User Blocking**: Block/unblock other users from interacting
- **My Listings**: Profile page shows user's created listings with status
- **Advanced Filtering**: Filter listings by country (60+ worldwide options including Americas, Europe, Arab countries, Asia-Pacific, Africa), language (12 options), and "Filling Fast" (≥50% slots filled)
- **Multi-language UI**: Internationalization (i18n) with Arabic, English, French, Spanish translations and language switcher. RTL support for Arabic (dir/lang attributes auto-set on language change via RTLProvider in App.tsx).
- **Multiple Image Upload**: Upload up to 5 images per listing with image carousel/gallery on detail page
- **Image Upload**: File browse upload option with drag-drop area, or paste URL fallback; images stored in Replit Object Storage
- **Warning/Kick System**: Listing creators can warn inactive participants; after 1 hour, they can kick them. Participants can report creators for fraud.
- **Saved/Bookmarked Listings**: Users can bookmark listings and view them in a dedicated "Saved" page
- **User Reviews & Ratings**: After a listing completes, participants can leave 1-5 star reviews with optional comments. Ratings display on profiles and listing cards.
- **Share Listings**: Share via Web Share API (native mobile), WhatsApp, Telegram, or copy link
- **Discovery Sections**: Home page shows Trending, Ending Soon, and Recently Added horizontal scroll sections
- **Search Autocomplete**: Search bar shows live suggestions as user types (debounced 300ms)
- **View Tracking**: Listing views are tracked and displayed; powers the trending algorithm
- **Host Announcements**: Listing creators can post announcements visible above group chat, and extend listing expiry
- **Enhanced Progress**: Milestone badges at 50%/75%/100%, "Almost Full" indicators, countdown timers for expiry
- **Landing Page**: Professional multi-section landing page for unauthenticated visitors (hero, how it works, categories, trust & safety, social proof, CTA). Fully translated in all 4 languages.
- **Reliability Score & Trust Badges**: Computed reliability score (0-100) with "Verified", "Trusted Member", "Top Organizer" badges displayed on profiles and listing cards
- **Tag System**: Listings can have up to 10 tags; popular tags shown as quick-filter chips on home page
- **Saved Searches**: Save search criteria with filters; get notified when new matching listings appear
- **Co-Organizer Role**: Listing creators can promote participants to co-organizers who can warn/kick/post announcements
- **Listing Edit History**: Audit trail of all listing changes visible to creators and admins
- **Watchlist Notifications**: Users who save a listing get notified about slot changes, updates, and completion
- **Suspicious Behavior Detection**: Auto-flags rapid joins, message spam, and users with multiple reports; admin flagged queue
- **Listing Completion Celebration**: Confetti animation and completion banner when a group fills up
- **Waitlist**: When a listing is full, users can join a waitlist and see their position. The first waiter is automatically notified when a slot opens (triggered on leave). Managed via `/api/listings/:id/waitlist` (GET/POST/DELETE).
- **Leave Group Confirmation**: Users see an AlertDialog confirmation before leaving a group to prevent accidental exits.
- **AI Conversation History**: The AI chat widget sends full conversation history with each message for context-aware responses.
- **Background Expiry Cron**: A node-cron job runs every 15 minutes to expire stale listings in bulk; the list endpoint no longer writes DB updates on every request.
- **Reliability Score Cache**: `/api/users/:id/reliability` results are cached with 5-minute TTL using the in-memory cache.
- **My Groups Endpoint**: `GET /api/my-groups` returns only the user's created and joined listings in two DB queries (no more full-table scan in MyGroups.tsx).
- **DB Indexes**: 41 secondary indexes + 4 unique constraints added across all tables (see Opus Audit Fixes below for full list).
- **Admin Route Guard**: `/admin-secret-dashboard` is protected at the router level — non-admin users are redirected to home before the component even loads.
- **AI Chat Widget Mobile Offset**: Widget positioned `bottom-20 right-4` on mobile to avoid overlapping the bottom navigation bar.
- **User Activity Feed**: Real-time feed showing recent platform activity (joins, creations, completions)
- **Feature Flags System**: Admin-toggleable feature flags for controlling feature rollout
- **System Event Logging**: Audit log of admin actions and important system events
- **Email Queue Infrastructure**: Backend email queue with worker for sending notifications (stub for actual email provider)
- **Platform Health Monitoring**: Health check endpoints and admin health dashboard with DB/API status
- **Performance Caching**: In-memory TTL cache for discovery endpoints and popular tags
- **AI Integration**: Dual AI provider support (Anthropic Claude primary, OpenAI fallback) via `server/ai.ts`
  - `/api/ai` — General chat endpoint for user questions
  - `/api/ai/suggestions` — Personalized deal recommendations based on user activity
  - `/api/admin/ai/analyze` — AI-powered platform health analysis for admins
- **AI Chat Widget**: Floating chat bubble (`AIChatWidget`) available to all authenticated users on every page
- **Admin Users Table**: Full user list at `/api/admin/users` with verification status and type
- **Admin Orders Management**: Participation management at `/api/admin/orders` with approve/reject actions
- **Admin AI Analytics Tab**: Analytics overview with AI "Analyze Platform" button for health reports
- **Admin Verifications Tab**: 5th admin tab shows users with pending verification status; admins can approve or reject directly with POST `/api/admin/verify-user/:userId`

### Security Hardening (April 2026 — Opus Audit Fixes)
- **C1 Race Condition (FIXED)**: `joinListing()` uses PostgreSQL transaction with unique constraint `participations_listing_user_unique(listing_id, user_id)`; 23505 duplicate key error caught gracefully
- **C2 Coordinate Validation (FIXED)**: `lat`/`lng`/`radius` query params validated with `isFinite()` + range checks (lat: ±90, lng: ±180, radius: 0–500km) before reaching the DB
- **C3 Unbounded Uploads (FIXED)**: Server-side 5 MB size limit added to `POST /api/uploads/request-url`; returns 413 if client sends larger `size` value
- **C4 Session Fixation (FIXED)**: Auth callback now uses custom Passport callback that calls `req.session.regenerate()` after login, issuing a fresh session ID after authentication
- **P2 DB Indexes (FIXED)**: 41 secondary indexes + 4 unique constraints added across all tables

### Branding & UI/UX Overhaul (April 2026)
- **Logo**: New SVG `LogoIcon` component (`client/src/components/Logo.tsx`) — gradient indigo-to-violet rounded square, white shopping bag with double handle (representing group), 3 dots inside (representing members). Used on Landing, Layout mobile header, Sidebar, and Footer
- **Sidebar**: Now shows user profile card (avatar + name + verified badge + reliability %) between logo and nav links
- **Footer**: Multi-column layout with Platform / Support / Legal columns + social links + copyright; used inside main Layout
- **Mobile header**: Updated to use new LogoIcon with gradient wordmark

### Phase 3: Growth, Engagement & Viral Features (April 2026)
- **Referral System**: Full referral tracking — `referrals` DB table, `POST /api/referrals/claim`, `GET /api/referrals/stats`; ReferralBanner enabled on homepage with live referral count, copy-to-clipboard, and `?ref=userId` auto-claim on signup; pending referral stored in localStorage and claimed on first auth
- **Deal Templates**: 5 pre-built templates in CreateListing (Electronics, Groceries, Gym, Software, Books) — each pre-fills title, description, category, slots, and tags; toggleable with visual selection feedback
- **Organizer Dashboard Analytics**: Stats card in MyGroups "Organised" tab showing Total Groups, Total Members, Fill Rate %, and Completed count
- **AI Model**: Switched to `claude-sonnet-4-5` as primary model (previously `claude-opus-4-5`)
- **Deal of the Day**: Visually prominent rotating homepage section (`GET /api/discover/deal-of-the-day`); deterministic daily rotation via UTC day key; priority: admin-featured → most-viewed (7d) → most-filled; hero image with gradient overlay, fill progress bar, urgency badges, live countdown to midnight UTC, "Save X%" badge when market price present; gracefully hides when no active listings exist

### Recent UI/UX Improvements (April 2026)
A comprehensive UI/UX overhaul was applied across all major pages:
- **ListingCard**: Tri-color progress bar (green/blue/amber/red by fill %), "X spots left" urgency text, compact creator+rating+tags row, countdown "Xd/Xh left" (amber/red when urgent)
- **ListingDetails**: Safety notice moved to footnote below CTA; expiry date replaced with color-coded countdown; social proof (participant avatars + view count) below join button; post-join coach mark; Similar Deals section at bottom of page; tri-color progress bar
- **Home.tsx**: Hero banner for unauthenticated visitors ("Buy Together, Save More"); secondary filters collapsed into "Filters ▾" slide-out drawer with active filter chips; AI banner only shown to returning users (with prior participations); Discovery sections show empty state placeholders instead of returning null
- **Onboarding.tsx**: Verification step redesigned with prominent "Skip — I'll verify later" button at top, "or verify now" divider; clearly marked as optional
- **Navigation**: Mobile bottom nav reduced to 5 items (removed Saved — still accessible via sidebar and profile)

### Key Design Patterns
- **Shared Types**: Schema definitions in `shared/schema.ts` are shared between frontend and backend via path aliases
- **Route Manifest**: API routes defined declaratively in `shared/routes.ts` with Zod schemas, used by both client hooks and server handlers
- **Custom Hooks**: Data fetching abstracted into `use-auth`, `use-listings`, `use-messages` hooks
- **Layout Pattern**: Consistent page layout with sidebar (desktop) and bottom nav (mobile)

### File Structure
```
client/src/          # React frontend
  components/        # Reusable UI components
    listing/         # Extracted ListingDetails sub-components
      ChatInterface.tsx
      ParticipantsManagement.tsx
      ReviewSection.tsx
      AnnouncementsSection.tsx
      SimilarDealsSection.tsx
      EditHistorySection.tsx
  hooks/             # Custom React hooks for data fetching
  pages/             # Route page components
  lib/               # Utilities (queryClient, auth helpers)
server/              # Express backend
  replit_integrations/auth/  # Replit Auth setup
shared/              # Shared code between frontend/backend
  schema.ts          # Drizzle schema definitions
  routes.ts          # API route manifest
  models/            # Auth-related models
```

### Audit Fixes Applied (April 2026) — All 24 Issues Complete
#### Security & Backend (Batches A+B)
- **F1 Chat privacy guard**: Chat messages endpoint validates user is a participant before returning messages
- **F2 requireAuth on upload**: `/api/upload` now protected with auth middleware
- **F8 React Query cache clear on logout**: `queryClient.clear()` called in logout handler
- **PR6 HTTP caching headers**: Public listing endpoints get `Cache-Control: public, max-age=15` headers
- **F3 deleteListing transaction**: Wrapped in DB transaction for atomicity; cascades all child records
- **F6 Co-organizer demotion**: `PATCH /api/listings/:id/co-organizer/:userId` endpoint added; UI in ParticipantsManagement
- **PR1 Saved search scan**: `getMatchingSavedSearches` replaced with targeted indexed query instead of full table scan
- **PR2 Listing details cache**: 15s TTL cache on `GET /api/listings/:id`
- **PR3 LRU-style cache max-size**: `MemoryCache` evicts oldest entries when size > 500
- **F4 Atomic slot increment**: `joinListing` uses conditional `WHERE filledSlots < totalSlots` in a single UPDATE — no TOCTOU race
#### UX Improvements (Batch C)
- **U1 Sticky join button**: Fixed bar at bottom of mobile screen with price + "Confirm Join" AlertDialog
- **U4 Saved in mobile nav**: Saved link added to mobile bottom navigation
- **U9 Horizontal scroll arrows**: Left/right arrow buttons on discovery section carousels
- **A1 AI suggestions for new users**: AI banner shown to all users, new users get tailored "explore" suggestions
#### Admin UI (Batch D)
- **AD1 Reports tab**: Full reports management tab in AdminSecretDashboard with resolve/ban actions
- **AD2 Suspicious flags tab**: Suspicious behavior flags tab with dismiss/ban actions
- **AD3 Feature flags toggle**: Toggle switches for enabling/disabling platform features
- **AD7 Real health data**: Health tab reads live data from `/api/admin/health` (DB latency, memory, uptime)
#### Complex Features (Batch E)
- **U2 File upload for ID verification**: Profile verification dialog replaced URL text inputs with proper file upload buttons (using `/api/upload`)
- **A2 AI listing context injection**: `useListingContext` hook passes current listing data to `AIChatWidget`; backend sanitizes context to 600 chars
- **A3 AI description generation**: "Generate with AI" button in `CreateListing` calls `/api/ai` with listing title/category to auto-fill description
- **P1 Commitment confirmation**: AlertDialog confirmation wraps both the main join CTA and the sticky mobile join bar
- **U3 GPS auto-fill**: "Use My Location" button already implemented in CreateListing (confirmed working)
- **P5 Price/savings display**: `pricePerSlot` and `marketPrice` integer columns (cents) added to schema; price inputs in CreateListing; savings % shown on ListingCard and ListingDetails

#### Audit Improvements (Batch F — Session 3)
- **T1 Seed 15 realistic listings**: `POST /api/admin/seed-listings` endpoint creates 15 active, realistic deals (coffee, tech, SaaS, travel, food) with real Unsplash images, varied fill rates and expiry dates; "Seed 15 Real Listings" button in AdminSecretDashboard
- **T2 Social proof signals**: `joinedToday` + `viewsToday` fields added to listing GET response (stored in DB, not mocked); ListingDetails shows green "+X today" badge and "X viewing today" with TrendingUp icon
- **T3 Enhanced commit dialog**: Redesigned "Commit to Buy" AlertDialog with price comparison, 5-step deal journey, payment coordination note, reliability impact warning, slot/expiry info
- **T4 Deal milestone tracker**: `dealMilestones` table with 5 stages (`group_filled → payments_collected → order_placed → shipment_received → distribution_complete`); `MilestoneTracker` component shows timeline for all participants; organizers can advance stages; participants can confirm receipt; routes at `GET/POST /api/listings/:id/milestones` + `POST /api/listings/:id/milestones/:stage/confirm`
- **T5 Email via Resend**: `server/email.ts` module with Resend API integration; 6 email templates (group completion, commit confirmed, milestone advanced, expiry warning, verification update, saved search alert); email queue worker runs every 5 min; 24h expiry warning cron runs every 6h; gracefully falls back to dry-run mode when `RESEND_API_KEY` is not set

#### Opus Audit Fixes (Batch G — Session 4)
- **P1 Unique constraint + duplicate-join guard**: Added `UNIQUE INDEX participations_listing_user_unique ON participations(listing_id, user_id)`. `joinListing` now checks for existing participation inside the transaction before incrementing `filledSlots`; catches PostgreSQL error code 23505 and returns a friendly "Already participating" message. DB is the final backstop even under concurrent load.
- **P2 DB indexes (41 secondary + 4 unique)**: Added indexes across every table on all hot query paths:

  - `listings`: `(status, expiresAt)`, `(creatorId)`, `(category)`, `(createdAt)`
  - `participations`: UNIQUE `(listingId, userId)`, `(listingId, joinedAt)`, `(userId)`
  - `listing_views`: `(listingId, viewedAt)`, `(userId, viewedAt)` — powers viewsToday/trending
  - `messages`: `(listingId)`, `(listingId, createdAt)`
  - `email_queue`: `(status, createdAt)`, `(userId)` — cron processor no longer full-scans
  - `saved_listings`: UNIQUE `(userId, listingId)`, `(userId)`
  - `waitlists`: UNIQUE `(listingId, userId)`, `(listingId)`, `(userId)`
  - `orders`: UNIQUE `(listingId, userId)`, `(listingId)`, `(userId)`
  - `deal_milestones`: `(listingId)`, `(listingId, stage)`
  - `listing_images`, `listing_tags`, `listing_updates`, `listing_history`: each indexed on `(listingId)`
  - `listing_tags`: also indexed on `(tag)` for tag-based search
  - `warnings`, `suspicious_flags`, `invitations`, `activity_feed`, `saved_searches`: indexed on their primary FK + lookup columns

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema-first ORM with migrations in `/migrations` directory
- **connect-pg-simple**: Session storage in PostgreSQL

### Authentication
- **Replit Auth**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware with OIDC strategy
- **express-session**: Session management with PostgreSQL store

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `ISSUER_URL`: OIDC issuer URL (defaults to Replit's OIDC endpoint)
- `REPL_ID`: Replit environment identifier (auto-set in Replit)

### Development Tools
- Vite dev server with HMR for frontend
- tsx for TypeScript execution in development
- Replit-specific Vite plugins for development banners and cartographer

#### Pre-Launch Critical Fixes (Session 5)
- **SEO meta tags**: Added full `<title>`, `<meta name="description">`, Open Graph (`og:title`, `og:description`, `og:type`), and Twitter card tags to `client/index.html`
- **Privacy Policy page**: Created `/privacy` route with a comprehensive, legally-structured Privacy Policy at `client/src/pages/PrivacyPolicy.tsx` (12 sections: intro, data collected, usage, verification docs, sharing, retention, cookies, rights, security, children's privacy, changes, contact); added to `App.tsx` routing; Footer updated to use `Link href="/privacy"` instead of dead anchor
- **Real landing page stats**: `Landing.tsx` now fetches `/api/stats` (real DB data) and displays actual active listing count and member count instead of the previous hardcoded fake numbers ("2,500+ groups", "18,000+ members"); floating UI cards on hero also updated to remove fake numbers
- **Public listing preview**: `/listings/:id` route now accessible to unauthenticated users (removed auth redirect in `App.tsx`); `ListingDetails.tsx` shows "Sign in to Join" CTA instead of join button for guests; sticky mobile bar shows sign-in prompt for guests; chat section shows "Sign in to join the conversation" with a sign-in button for guests
- **Onboarding back navigation**: Added "Back" button (ChevronLeft) to the Account Type (step 2), Identity Verification (step 3), and Vendor Details (step 4) steps in `Onboarding.tsx`, allowing users to navigate backwards if they make a mistake
- **Terms & Privacy acceptance**: Added required Terms & Conditions + Privacy Policy acceptance checkbox in the personal-info step of `Onboarding.tsx`; Continue button disabled until checked; validation also guards the submit handler
- **Honest referral copy**: Changed "Invite friends & earn rewards" → "Invite friends & grow your network" and referral toast changed from "earn rewards" to neutral discovery language; removes misleading reward implication since no reward system is implemented

#### Claude Opus Security Audit & P0 Fixes (Session 7)
- **PII Leakage eliminated**: Created `server/dto.ts` with `toPublicUser()`, `toPublicListing()`, `toPublicParticipation()`, `toPublicMessage()` DTO helpers that strip sensitive fields (`email`, `phone`, `idDocumentUrl`, `selfieUrl`, `isAdmin`, `role`, `isDisabled`, `noShowFlags`, `cancelledParticipations`) before sending to clients. Applied to all listing, discover, my-groups, user-listings, saved-listings, messages, and reviews API endpoints.
- **OTP logging secured**: OTP codes now only logged in dev mode (`NODE_ENV !== "production"`). Production logs only a redacted prefix of the phone number.
- **Reliability endpoint protected**: `GET /api/users/:userId/reliability` now requires authentication (`requireAuth`).
- **Rate limiters added**: `messageLimiter` (30/min), `reportLimiter` (5/min), `reviewLimiter` (5/min) added and applied to `POST /api/.../messages`, `POST /api/reports`, `POST /api/reviews` endpoints.
- **Misleading "Money Protected" badge removed**: Replaced with accurate "Coordination Platform" badge (stating Grouperry does not hold funds, payments are peer-to-peer) in all 4 languages (EN/AR/FR/ES). i18n keys changed from `moneyProtected/moneyProtectedDesc` to `coordinationPlatform/coordinationPlatformDesc`.

#### Admin System & Translation Fixes (Session 6)
- **AI Model**: Changed from `claude-opus-4-5` to `claude-sonnet-4-5` (Claude Sonnet) in `server/ai.ts`
- **Role System**: Added `userRoleEnum` (`"user"`, `"admin"`, `"moderator"`) and `role` column to users table in `shared/models/auth.ts`; schema pushed to DB
- **Primary Admin**: `rami.kamar@gmail.com` is the hardcoded primary owner — set in `server/replit_integrations/auth/replitAuth.ts` (auto-granted on login) and `server/routes.ts` (auto-granted on startup); cannot be demoted by any admin action
- **Admin Routes**: Removed `/admin-secret-dashboard` page (route now redirects to `/admin`); removed `AdminSecretDashboard` import from `App.tsx`
- **New Backend Endpoints**:
  - `PATCH /api/admin/users/:userId/role` — role management endpoint with primary admin protection and backend validation
  - `GET /api/admin/users` — now returns `isPrimaryOwner: boolean` flag for each user
  - Updated `POST /api/admin/users/:userId/promote` — syncs `role` field with `isAdmin` and protects primary admin
- **Auth Storage**: Added `getUserByEmail(email)` method to `IAuthStorage` interface and `AuthStorage` implementation
- **Admin UI**: Users tab now shows Role column with colored badges (Owner=amber/crown, Admin=red/shield, Moderator=blue, User=gray); "Make Admin" and "Remove Admin" buttons per user; primary owner shows protected label (no buttons); all strings use translation keys
- **Translations**: Added 24 new keys to all 4 languages (en, ar, fr, es): `searchUsers`, `allTypes`, `allStatuses`, `noUsersMatch`, `userColumn`, `emailColumn`, `roleColumn`, `statusColumn`, `joinedColumn`, `actionsColumn`, `roleOwner`, `roleAdmin`, `roleModerator`, `roleUser`, `makeAdmin`, `removeAdmin`, `roleUpdated`, `promotedToAdmin`, `demotedToUser`, `primaryOwner`, `primaryOwnerLabel`, `cannotChangeOwner`
