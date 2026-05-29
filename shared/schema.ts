import { pgTable, text, serial, integer, boolean, timestamp, varchar, pgEnum, jsonb, index, uniqueIndex, check } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import auth models - CRITICAL for Replit Auth
export * from "./models/auth";
import { users } from "./models/auth";

// Enums
export const categoryEnum = pgEnum("category", ["physical", "digital", "offer"]);
export const statusEnum = pgEnum("status", ["active", "completed", "expired", "cancelled"]);
export const orderStatusEnum = pgEnum("order_status", ["committed", "confirmed", "released", "refunded"]);

// Listings Table
export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: categoryEnum("category").notNull(),
  imageUrl: text("image_url"), // Required for physical, optional otherwise (enforced in app logic)
  location: text("location"), // Required for physical
  latitude: text("latitude"), // For map search
  longitude: text("longitude"), // For map search
  country: text("country"), // Country filter
  language: text("language"), // Language filter
  totalSlots: integer("total_slots").notNull(),
  filledSlots: integer("filled_slots").default(0).notNull(),
  pricePerSlot: integer("price_per_slot"), // Group price in cents (nullable = no price listed)
  marketPrice: integer("market_price"), // Regular market price in cents for savings calc
  expiresAt: timestamp("expires_at").notNull(),
  status: statusEnum("status").default("active").notNull(),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  isFeatured: boolean("is_featured").default(false),
  isTrending: boolean("is_trending").default(false),
  paymentMethod: text("payment_method"),
  paymentDetails: text("payment_details"),
  paymentNotes: text("payment_notes"),
  distributionType: text("distribution_type"),
  distributionDetails: text("distribution_details"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [
  index("idx_listings_status_expires").on(t.status, t.expiresAt),
  index("idx_listings_creator_id").on(t.creatorId),
  index("idx_listings_category").on(t.category),
  index("idx_listings_created_at").on(t.createdAt),
  check("filled_slots_not_exceed_total", sql`filled_slots <= total_slots`),
  check("total_slots_minimum", sql`total_slots >= 2`),
  check("price_per_slot_positive", sql`price_per_slot IS NULL OR price_per_slot > 0`),
  check("market_price_positive", sql`market_price IS NULL OR market_price > 0`),
]);

export const participationRoleEnum = pgEnum("participation_role", ["member", "co-organizer"]);

// Participations Table (Who joined which group)
export const participations = pgTable("participations", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: participationRoleEnum("role").default("member").notNull(),
  paymentStatus: text("payment_status").default("pending").notNull(),
  distributionPreference: text("distribution_preference"),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (t) => [
  // P1 fix: unique constraint prevents duplicate joins even under concurrent load
  uniqueIndex("participations_listing_user_unique").on(t.listingId, t.userId),
  index("idx_participations_listing_joined").on(t.listingId, t.joinedAt),
  index("idx_participations_user_id").on(t.userId),
]);

// Messages Table (Group chat per listing)
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("idx_messages_listing_id").on(t.listingId),
  index("idx_messages_created_at").on(t.listingId, t.createdAt),
]);

// Reports Table
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  listingId: integer("listing_id").references(() => listings.id), // Can report a listing
  reportedUserId: varchar("reported_user_id").references(() => users.id), // Can report a user
  reason: text("reason").notNull(),
  category: varchar("category", { length: 50 }).default("other"),
  resolved: boolean("resolved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Warnings Table - for group creators to warn inactive participants
export const warnings = pgTable("warnings", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  warnedUserId: varchar("warned_user_id").notNull().references(() => users.id),
  warnedByUserId: varchar("warned_by_user_id").notNull().references(() => users.id),
  reason: text("reason"),
  warnedAt: timestamp("warned_at").defaultNow(),
  kickableAt: timestamp("kickable_at").notNull(), // 1 hour after warning
  kicked: boolean("kicked").default(false),
  kickedAt: timestamp("kicked_at"),
}, (t) => [
  index("idx_warnings_listing_id").on(t.listingId),
  index("idx_warnings_warned_user_id").on(t.warnedUserId),
]);

export type Warning = typeof warnings.$inferSelect;
export type InsertWarning = typeof warnings.$inferInsert;

// Listing Images Table (multiple images per listing)
export const listingImages = pgTable("listing_images", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("idx_listing_images_listing_id").on(t.listingId),
]);

// Saved/Bookmarked Listings
export const savedListings = pgTable("saved_listings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  savedAt: timestamp("saved_at").defaultNow(),
}, (t) => [
  uniqueIndex("saved_listings_user_listing_unique").on(t.userId, t.listingId),
  index("idx_saved_listings_user_id").on(t.userId),
]);

// Reviews Table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  reviewedUserId: varchar("reviewed_user_id").notNull().references(() => users.id),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  uniqueIndex("reviews_reviewer_listing_unique").on(t.reviewerId, t.listingId),
]);

// Listing Views
export const listingViews = pgTable("listing_views", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  userId: varchar("user_id"),
  viewedAt: timestamp("viewed_at").defaultNow(),
}, (t) => [
  // Critical: supports viewsToday, joinedToday, and trending queries
  index("idx_listing_views_listing_viewed").on(t.listingId, t.viewedAt),
  index("idx_listing_views_user_viewed").on(t.userId, t.viewedAt),
]);

// Listing Updates / Announcements
export const listingUpdates = pgTable("listing_updates", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("idx_listing_updates_listing_id").on(t.listingId),
]);

// Listing Tags
export const listingTags = pgTable("listing_tags", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  tag: varchar("tag", { length: 50 }).notNull(),
}, (t) => [
  index("idx_listing_tags_listing_id").on(t.listingId),
  index("idx_listing_tags_tag").on(t.tag),
]);

// Saved Searches
export const savedSearches = pgTable("saved_searches", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  query: text("query"),
  filters: jsonb("filters"),
  lastNotifiedAt: timestamp("last_notified_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("idx_saved_searches_user_id").on(t.userId),
]);

// Listing Edit History
export const listingHistory = pgTable("listing_history", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  editorId: varchar("editor_id").notNull().references(() => users.id),
  changes: jsonb("changes").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("idx_listing_history_listing_id").on(t.listingId),
]);

// Suspicious Behavior Flags
export const suspiciousFlags = pgTable("suspicious_flags", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  flagType: varchar("flag_type").notNull(),
  details: text("details"),
  resolved: boolean("resolved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("idx_suspicious_flags_user_id").on(t.userId),
  index("idx_suspicious_flags_resolved").on(t.resolved),
]);

// Invitations
export const invitationStatusEnum = pgEnum("invitation_status", ["pending", "accepted", "declined"]);

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  inviterId: varchar("inviter_id").notNull().references(() => users.id),
  invitedUserId: varchar("invited_user_id").notNull().references(() => users.id),
  status: invitationStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("idx_invitations_listing_id").on(t.listingId),
  index("idx_invitations_invited_user_id").on(t.invitedUserId),
]);

// Activity Feed
export const activityFeed = pgTable("activity_feed", {
  id: serial("id").primaryKey(),
  type: varchar("type").notNull(),
  actorId: varchar("actor_id").references(() => users.id),
  listingId: integer("listing_id").references(() => listings.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("idx_activity_feed_listing_id").on(t.listingId),
  index("idx_activity_feed_actor_id").on(t.actorId),
  index("idx_activity_feed_created_at").on(t.createdAt),
]);

// Feature Flags
export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).unique().notNull(),
  enabled: boolean("enabled").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// System Events
export const systemEvents = pgTable("system_events", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type").notNull(),
  actorId: varchar("actor_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders Table (Commit to Buy system)
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: orderStatusEnum("status").default("committed").notNull(),
  amountCents: integer("amount_cents"),
  notes: text("notes"),
  // Stripe charge-on-completion: saved payment method + the charge intent
  stripePaymentMethodId: varchar("stripe_payment_method_id"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  chargeStatus: varchar("charge_status"), // null | authorized | paid | refunded | failed
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [
  uniqueIndex("orders_listing_user_unique").on(t.listingId, t.userId),
  index("idx_orders_listing_id").on(t.listingId),
  index("idx_orders_user_id").on(t.userId),
]);

// Waitlists — users waiting for a slot on a full listing
export const waitlists = pgTable("waitlists", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  notified: boolean("notified").default(false).notNull(),
}, (t) => [
  uniqueIndex("waitlists_listing_user_unique").on(t.listingId, t.userId),
  index("idx_waitlists_listing_id").on(t.listingId),
  index("idx_waitlists_user_id").on(t.userId),
]);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export type Waitlist = typeof waitlists.$inferSelect;
export type InsertWaitlist = typeof waitlists.$inferInsert;

// Email Queue
export const emailStatusEnum = pgEnum("email_status", ["pending", "sent", "failed"]);

export const emailQueue = pgTable("email_queue", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  emailType: varchar("email_type").notNull(),
  payload: jsonb("payload"),
  status: emailStatusEnum("status").default("pending").notNull(),
  retryCount: integer("retry_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
}, (t) => [
  // Critical: cron job scans for pending emails every 5 minutes — must use index
  index("idx_email_queue_status_created").on(t.status, t.createdAt),
  index("idx_email_queue_user_id").on(t.userId),
]);

export type ListingImage = typeof listingImages.$inferSelect;
export type SavedListing = typeof savedListings.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
export type ListingView = typeof listingViews.$inferSelect;
export type ListingUpdate = typeof listingUpdates.$inferSelect;
export type ListingTag = typeof listingTags.$inferSelect;
export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = typeof savedSearches.$inferInsert;
export type ListingHistoryEntry = typeof listingHistory.$inferSelect;
export type SuspiciousFlag = typeof suspiciousFlags.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;
export type ActivityFeedEntry = typeof activityFeed.$inferSelect;
export type FeatureFlag = typeof featureFlags.$inferSelect;
export type SystemEvent = typeof systemEvents.$inferSelect;
export type EmailQueueEntry = typeof emailQueue.$inferSelect;

// Relations
export const waitlistsRelations = relations(waitlists, ({ one }) => ({
  listing: one(listings, {
    fields: [waitlists.listingId],
    references: [listings.id],
  }),
  user: one(users, {
    fields: [waitlists.userId],
    references: [users.id],
  }),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  creator: one(users, {
    fields: [listings.creatorId],
    references: [users.id],
  }),
  participants: many(participations),
  messages: many(messages),
  images: many(listingImages),
  updates: many(listingUpdates),
  waitlists: many(waitlists),
}));

export const listingImagesRelations = relations(listingImages, ({ one }) => ({
  listing: one(listings, {
    fields: [listingImages.listingId],
    references: [listings.id],
  }),
}));

export const listingUpdatesRelations = relations(listingUpdates, ({ one }) => ({
  listing: one(listings, {
    fields: [listingUpdates.listingId],
    references: [listings.id],
  }),
  user: one(users, {
    fields: [listingUpdates.userId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: "reviewer",
  }),
  reviewedUser: one(users, {
    fields: [reviews.reviewedUserId],
    references: [users.id],
    relationName: "reviewed",
  }),
  listing: one(listings, {
    fields: [reviews.listingId],
    references: [listings.id],
  }),
}));

export const savedListingsRelations = relations(savedListings, ({ one }) => ({
  user: one(users, {
    fields: [savedListings.userId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [savedListings.listingId],
    references: [listings.id],
  }),
}));

export const participationsRelations = relations(participations, ({ one }) => ({
  listing: one(listings, {
    fields: [participations.listingId],
    references: [listings.id],
  }),
  user: one(users, {
    fields: [participations.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  listing: one(listings, {
    fields: [messages.listingId],
    references: [listings.id],
  }),
  sender: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertListingSchema = createInsertSchema(listings).omit({ 
  id: true, 
  filledSlots: true, 
  creatorId: true, 
  createdAt: true, 
  updatedAt: true,
  status: true 
}).extend({
  // Enforce validation for required fields
  title: z.string().min(3, "Title too short"),
  description: z.string().min(10, "Description too short"),
  totalSlots: z.number().min(2, "Must have at least 2 slots"),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  userId: true,
  createdAt: true
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  reporterId: true,
  createdAt: true
}).extend({
  category: z.enum(["fraud", "spam", "harassment", "fake", "other"]).default("other"),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  reviewerId: true,
  createdAt: true
}).extend({
  rating: z.number().min(1).max(5),
});

export const insertListingUpdateSchema = createInsertSchema(listingUpdates).omit({
  id: true,
  userId: true,
  createdAt: true
});

// ── Deal Milestones (5-stage tracker) ────────────────────────────────────────
export const dealMilestoneStageEnum = pgEnum("deal_milestone_stage", [
  "group_filled",
  "payments_collected",
  "order_placed",
  "shipment_received",
  "distribution_complete",
]);

export const dealMilestoneStatusEnum = pgEnum("deal_milestone_status", [
  "pending",
  "in_progress",
  "completed",
  "failed",
]);

export const dealMilestones = pgTable("deal_milestones", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  stage: dealMilestoneStageEnum("stage").notNull(),
  status: dealMilestoneStatusEnum("status").default("pending").notNull(),
  proofUrl: text("proof_url"),
  notes: text("notes"),
  confirmedCount: integer("confirmed_count").default(0).notNull(),
  actorId: varchar("actor_id"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [
  index("idx_deal_milestones_listing_id").on(t.listingId),
  index("idx_deal_milestones_listing_stage").on(t.listingId, t.stage),
]);

export type DealMilestone = typeof dealMilestones.$inferSelect;
export type InsertDealMilestone = typeof dealMilestones.$inferInsert;

// Referrals Table
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  referredUserId: varchar("referred_user_id").notNull().references(() => users.id),
  rewardGranted: boolean("reward_granted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  uniqueIndex("referrals_referred_user_unique").on(t.referredUserId),
  index("idx_referrals_referrer_id").on(t.referrerId),
]);

export type Referral = typeof referrals.$inferSelect;

// Marketing: landing-page newsletter signups (no auth required)
export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    locale: varchar("locale", { length: 16 }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [uniqueIndex("newsletter_subscribers_email_unique").on(t.email)]
);

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

// Phone OTP table — stores verification codes (mock SMS for now)
export const phoneOtps = pgTable("phone_otps", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  phone: varchar("phone", { length: 30 }).notNull(),
  otp: varchar("otp", { length: 10 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("idx_phone_otps_user_id").on(t.userId),
]);

export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;

// Deal Proofs Table — participants upload evidence after deal completion
export const dealProofs = pgTable("deal_proofs", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  imageUrl: text("image_url").notNull(),
  confirmed: boolean("confirmed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("idx_deal_proofs_listing_id").on(t.listingId),
  index("idx_deal_proofs_user_id").on(t.userId),
  uniqueIndex("uq_deal_proofs_listing_user").on(t.listingId, t.userId),
]);

export type DealProof = typeof dealProofs.$inferSelect;
export type InsertDealProof = typeof dealProofs.$inferInsert;

export const insertDealProofSchema = createInsertSchema(dealProofs).omit({
  id: true,
  userId: true,
  confirmed: true,
  createdAt: true,
});

export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Participation = typeof participations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Report = typeof reports.$inferSelect;

// Derived Types for API
export type CreateListingRequest = InsertListing;
export type UpdateListingRequest = Partial<InsertListing> & { status?: "active" | "completed" | "expired" | "cancelled" };
export type JoinListingRequest = { listingId: number };
export type SendMessageRequest = z.infer<typeof insertMessageSchema>;
export type CreateReportRequest = z.infer<typeof insertReportSchema>;

export type ListingWithCreator = Listing & { creator: typeof users.$inferSelect };
