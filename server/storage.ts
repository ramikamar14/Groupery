import { db } from "./db";
import { referrals, Referral } from "@shared/schema";
import { 
  listings, participations, messages, reports, warnings,
  listingImages, savedListings, reviews, listingViews, listingUpdates, listingTags,
  savedSearches, suspiciousFlags, listingHistory, activityFeed, systemEvents, featureFlags, emailQueue,
  waitlists, orders, dealMilestones, siteSettings, dealProofs, invitations, newsletterSubscribers,
  type Listing, type InsertListing, type UpdateListingRequest,
  type Participation, 
  type Message, 
  type Report, type CreateReportRequest,
  type ListingWithCreator,
  type Warning, type InsertWarning,
  type ListingImage, type SavedListing, type Review, type InsertReview,
  type ListingView, type ListingUpdate, type ListingTag,
  type SavedSearch, type SuspiciousFlag, type ListingHistoryEntry,
  type ActivityFeedEntry, type SystemEvent, type EmailQueueEntry, type FeatureFlag,
  type Waitlist, type Order, type DealMilestone, type DealProof, type InsertDealProof,
  type Invitation
} from "@shared/schema";
import { users } from "@shared/models/auth";
import { eq, and, desc, asc, ilike, sql, gte, count, inArray, or } from "drizzle-orm";

export interface IStorage {
  // Listings
  getListings(filters?: { category?: string, sellerType?: "individual" | "vendor", search?: string, location?: string, lat?: number, lng?: number, radius?: number, country?: string, language?: string, fillingFast?: boolean, tag?: string, limit?: number, offset?: number }): Promise<ListingWithCreator[]>;
  getListing(id: number): Promise<ListingWithCreator | undefined>;
  createListing(listing: InsertListing & { creatorId: string; filledSlots?: number; status?: "active" | "completed" | "expired" | "cancelled" }): Promise<Listing>;
  updateListing(id: number, updates: UpdateListingRequest): Promise<Listing | undefined>;
  deleteListing(id: number): Promise<void>;

  // Participations
  joinListing(listingId: number, userId: string): Promise<{ participation: Participation; listing: Listing }>;
  getExpiredActiveListings(): Promise<Listing[]>;
  leaveListing(listingId: number, userId: string): Promise<void>;
  getParticipation(listingId: number, userId: string): Promise<Participation | undefined>;
  getParticipationById(id: number): Promise<Participation | undefined>;
  getParticipationsByListing(listingId: number): Promise<Participation[]>;
  getUserParticipations(userId: string): Promise<Participation[]>;
  getAllParticipations(): Promise<(Participation & { listing?: any; user?: any })[]>;

  // Messages
  getMessages(listingId: number): Promise<(Message & { sender: any })[]>;
  createMessage(message: { listingId: number, userId: string, content: string }): Promise<Message>;

  // Reports
  createReport(report: CreateReportRequest & { reporterId: string }): Promise<Report>;
  getReports(): Promise<any[]>;
  resolveReport(id: number): Promise<void>;

  // Deal Proofs
  createDealProof(proof: { listingId: number; userId: string; imageUrl: string }): Promise<DealProof>;
  getDealProofs(listingId: number): Promise<(DealProof & { user: any })[]>;
  confirmDealProof(proofId: number): Promise<void>;

  // Warnings
  warnUser(warning: InsertWarning): Promise<Warning>;
  getWarning(listingId: number, userId: string): Promise<Warning | undefined>;
  getWarningsByListing(listingId: number): Promise<Warning[]>;
  kickUser(warningId: number): Promise<void>;
  wasKicked(listingId: number, userId: string): Promise<boolean>;
  removeParticipant(listingId: number, userId: string): Promise<void>;

  // User listings
  getUserListings(userId: string): Promise<ListingWithCreator[]>;
  getUserGroups(userId: string): Promise<ListingWithCreator[]>;

  // Waitlists
  joinWaitlist(listingId: number, userId: string): Promise<Waitlist>;
  leaveWaitlist(listingId: number, userId: string): Promise<void>;
  getWaitlistPosition(listingId: number, userId: string): Promise<number>;
  getWaitlistForListing(listingId: number): Promise<Waitlist[]>;
  notifyFirstWaiter(listingId: number): Promise<string | null>;

  // Listing Images
  addListingImages(listingId: number, imageUrls: string[]): Promise<ListingImage[]>;
  getListingImages(listingId: number): Promise<ListingImage[]>;

  // Saved Listings
  saveListing(userId: string, listingId: number): Promise<SavedListing>;
  unsaveListing(userId: string, listingId: number): Promise<void>;
  getSavedListings(userId: string): Promise<any[]>;
  isSaved(userId: string, listingId: number): Promise<boolean>;

  // Reviews
  createReview(review: InsertReview & { reviewerId: string }): Promise<Review>;
  getReviewsForUser(userId: string): Promise<any[]>;
  hasReviewed(reviewerId: string, listingId: number): Promise<boolean>;

  // Listing Views
  trackView(listingId: number, userId?: string): Promise<void>;
  getViewCount(listingId: number): Promise<number>;
  getJoinedTodayCount(listingId: number): Promise<number>;
  getViewsTodayCount(listingId: number): Promise<number>;
  getTrendingListings(limit?: number): Promise<ListingWithCreator[]>;
  getExpiringSoonListings(limit?: number): Promise<ListingWithCreator[]>;
  getRecentListings(limit?: number): Promise<ListingWithCreator[]>;
  getDealOfDay(): Promise<ListingWithCreator | null>;

  // Listing Updates
  createListingUpdate(update: { listingId: number, userId: string, content: string }): Promise<ListingUpdate>;
  getListingUpdates(listingId: number): Promise<any[]>;

  // Co-organizer
  promoteToCoOrganizer(listingId: number, userId: string): Promise<Participation>;
  demoteCoOrganizer(listingId: number, userId: string): Promise<Participation>;

  // Watchlist
  getUsersWhoSavedListing(listingId: number): Promise<string[]>;

  // Search suggestions
  getSearchSuggestions(query: string): Promise<string[]>;

  // Tags
  addTagsToListing(listingId: number, tags: string[]): Promise<ListingTag[]>;
  getTagsForListing(listingId: number): Promise<ListingTag[]>;
  getTagsForListings(listingIds: number[]): Promise<Map<number, ListingTag[]>>;
  getPopularTags(limit?: number): Promise<{ tag: string; count: number }[]>;

  // Reliability
  computeReliabilityScore(userId: string): Promise<{ score: number; badges: string[]; stats: { completedGroups: number; avgRating: number; reportsReceived: number; cancelledParticipations: number; completedListingsCreated: number } }>;

  // Saved Searches
  createSavedSearch(userId: string, query: string | null, filters: any): Promise<SavedSearch>;
  getSavedSearches(userId: string): Promise<SavedSearch[]>;
  deleteSavedSearch(id: number, userId: string): Promise<void>;
  getMatchingSavedSearches(listing: Listing): Promise<SavedSearch[]>;

  // User Deletion (anonymize + cleanup)
  deleteUserData(userId: string): Promise<void>;

  // Suspicious Flags
  createSuspiciousFlag(userId: string, flagType: string, details: string): Promise<SuspiciousFlag>;
  getSuspiciousFlags(resolved?: boolean): Promise<(SuspiciousFlag & { user?: any })[]>;
  resolveSuspiciousFlag(id: number): Promise<void>;
  checkJoinRateLimit(userId: string): Promise<boolean>;
  checkUnresolvedReports(userId: string): Promise<boolean>;
  checkMessageSpam(userId: string, listingId: number): Promise<boolean>;

  // Listing Edit History
  recordListingHistory(listingId: number, editorId: string, changes: Record<string, { old: any; new: any }>): Promise<ListingHistoryEntry>;
  getListingHistory(listingId: number): Promise<(ListingHistoryEntry & { editor?: any })[]>;
  getAllListingHistory(limit?: number): Promise<(ListingHistoryEntry & { editor?: any; listing?: any })[]>;

  // Deal Milestones
  getMilestones(listingId: number): Promise<DealMilestone[]>;
  upsertMilestone(listingId: number, stage: DealMilestone["stage"], data: { status?: DealMilestone["status"]; proofUrl?: string; notes?: string; actorId?: string }): Promise<DealMilestone>;
  confirmMilestone(listingId: number, stage: DealMilestone["stage"]): Promise<DealMilestone>;

  // System Events
  createSystemEvent(eventType: string, actorId: string | null, metadata?: any): Promise<SystemEvent>;
  getSystemEvents(filters?: { eventType?: string; limit?: number; offset?: number }): Promise<{ events: SystemEvent[]; total: number }>;

  // Activity Feed
  recordActivity(type: string, actorId: string | null, listingId: number | null, metadata?: any): Promise<ActivityFeedEntry>;
  getActivityFeed(limit?: number, offset?: number): Promise<(ActivityFeedEntry & { actor?: any; listing?: any })[]>;

  // Email Queue
  enqueueEmail(userId: string, emailType: string, payload: any): Promise<EmailQueueEntry>;
  getEmailQueue(status?: string): Promise<EmailQueueEntry[]>;
  markEmailProcessed(id: number, status: "sent" | "failed"): Promise<void>;

  /** Landing-page newsletter; email stored lowercased, unique. */
  subscribeNewsletterEmail(email: string, locale?: string | null): Promise<"created" | "exists">;

  // Feature Flags
  getFeatureFlag(key: string): Promise<FeatureFlag | undefined>;
  setFeatureFlag(key: string, enabled: boolean): Promise<FeatureFlag>;

  // Site Settings
  getSiteSetting(key: string): Promise<string | null>;
  setSiteSetting(key: string, value: string): Promise<void>;
  getAllSiteSettings(): Promise<Record<string, string>>;
  getAllFeatureFlags(): Promise<FeatureFlag[]>;

  // Orders (Commit to Buy)
  createOrder(order: { listingId: number; userId: string; amountCents?: number; notes?: string }): Promise<Order>;
  getOrder(id: number): Promise<Order | null>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrderByListingAndUser(listingId: number, userId: string): Promise<Order | undefined>;
  getOrdersByUser(userId: string): Promise<(Order & { listing?: any })[]>;
  getOrdersByListing(listingId: number): Promise<(Order & { user?: any })[]>;
  updateOrderStatus(id: number, status: Order["status"]): Promise<Order>;
  updateOrder(id: number, updates: Partial<Order>): Promise<Order>;
  deleteOrder(id: number): Promise<void>;
  getAllOrders(limit?: number): Promise<(Order & { listing?: any; user?: any })[]>;

  // Referrals
  createReferral(referrerId: string, referredUserId: string): Promise<Referral>;
  getReferralStats(userId: string): Promise<{ totalReferrals: number; rewardedReferrals: number; referredUsers: any[] }>;
  hasBeenReferred(userId: string): Promise<boolean>;
  grantReferralReward(referredUserId: string): Promise<string | null>;

  // State machine — enforces valid transitions inside a transaction
  transitionListing(id: number, newStatus: "active" | "completed" | "expired" | "cancelled"): Promise<Listing>;

  // Discovery
  getNearCompletionListings(limit?: number): Promise<ListingWithCreator[]>;

  // Invitations
  createInvitation(data: { listingId: number; inviterId: string; invitedUserId: string }): Promise<Invitation>;
  getInvitationsForUser(userId: string): Promise<any[]>;
  getInvitation(id: number): Promise<Invitation | null>;
  updateInvitation(id: number, status: "accepted" | "declined"): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getListings(filters?: { category?: string, sellerType?: "individual" | "vendor", search?: string, location?: string, lat?: number, lng?: number, radius?: number, country?: string, language?: string, fillingFast?: boolean, tag?: string, limit?: number, offset?: number }): Promise<ListingWithCreator[]> {
    let tagListingIds: number[] | undefined;
    if (filters?.tag) {
      const tagResults = await db.select({ listingId: listingTags.listingId })
        .from(listingTags)
        .where(eq(listingTags.tag, filters.tag));
      tagListingIds = tagResults.map(t => t.listingId);
      if (tagListingIds.length === 0) return [];
    }

    const results = await db.query.listings.findMany({
      where: (listings, { eq, and, ilike, or, sql, inArray: inArr }) => {
        const conditions = [];
        if (tagListingIds) {
          conditions.push(inArr(listings.id, tagListingIds));
        }
        if (filters?.category) {
          conditions.push(eq(listings.category, filters.category as any));
        }
        if (filters?.search) {
          conditions.push(or(
            ilike(listings.title, `%${filters.search}%`),
            ilike(listings.description, `%${filters.search}%`)
          ));
        }
        if (filters?.location) {
           conditions.push(ilike(listings.location, `%${filters.location}%`));
        }
        if (filters?.country) {
          conditions.push(eq(listings.country, filters.country));
        }
        if (filters?.language) {
          conditions.push(eq(listings.language, filters.language));
        }

        // Simple coordinate-based bounding box filtering for "nearby"
        // Radius is in degrees (approximate)
        if (filters?.lat !== undefined && filters?.lng !== undefined) {
          const r = filters.radius || 0.1; // Default radius ~10km
          conditions.push(and(
            sql`CAST(${listings.latitude} AS DOUBLE PRECISION) BETWEEN ${filters.lat - r} AND ${filters.lat + r}`,
            sql`CAST(${listings.longitude} AS DOUBLE PRECISION) BETWEEN ${filters.lng - r} AND ${filters.lng + r}`
          ));
        }

        // Filling fast: listings with >= 50% slots filled
        if (filters?.fillingFast) {
          conditions.push(sql`${listings.filledSlots}::float / ${listings.totalSlots}::float >= 0.5`);
        }

        // Seller type in SQL — a JS post-filter after LIMIT/OFFSET broke
        // pagination (filtered pages returned fewer rows than exist).
        if (filters?.sellerType) {
          conditions.push(
            sql`${listings.creatorId} IN (SELECT id FROM users WHERE user_type = ${filters.sellerType})`
          );
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
      },
      with: {
        creator: true,
      },
      orderBy: filters?.fillingFast 
        ? [sql`${listings.filledSlots}::float / ${listings.totalSlots}::float DESC`, desc(listings.createdAt)]
        : [desc(listings.createdAt)],
      limit: filters?.limit,
      offset: filters?.offset,
    });

    return results;
  }

  /** Active listings whose deadline has passed — used by the expiry cron and
   *  admin endpoint instead of scanning the whole table in JS. */
  async getExpiredActiveListings(): Promise<Listing[]> {
    return await db.select().from(listings).where(
      and(eq(listings.status, "active"), sql`${listings.expiresAt} IS NOT NULL AND ${listings.expiresAt} < now()`)
    );
  }

  async getListing(id: number): Promise<any> {
    return await db.query.listings.findFirst({
      where: eq(listings.id, id),
      with: {
        creator: true,
        participants: {
          with: {
            user: true
          }
        }
      },
    });
  }

  async createListing(insertListing: InsertListing & { creatorId: string; filledSlots?: number; status?: "active" | "completed" | "expired" | "cancelled" }): Promise<Listing> {
    const [listing] = await db.insert(listings).values(insertListing).returning();
    return listing;
  }

  async updateListing(id: number, updates: UpdateListingRequest): Promise<Listing | undefined> {
    const [updated] = await db
      .update(listings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning();
    return updated;
  }

  async deleteListing(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      await Promise.all([
        tx.delete(participations).where(eq(participations.listingId, id)),
        tx.delete(messages).where(eq(messages.listingId, id)),
        tx.delete(savedListings).where(eq(savedListings.listingId, id)),
        tx.delete(listingImages).where(eq(listingImages.listingId, id)),
        tx.delete(listingTags).where(eq(listingTags.listingId, id)),
        tx.delete(listingUpdates).where(eq(listingUpdates.listingId, id)),
        tx.delete(listingHistory).where(eq(listingHistory.listingId, id)),
        tx.delete(listingViews).where(eq(listingViews.listingId, id)),
        tx.delete(warnings).where(eq(warnings.listingId, id)),
        tx.delete(waitlists).where(eq(waitlists.listingId, id)),
      ]);
      await tx.delete(listings).where(eq(listings.id, id));
    });
  }

  async joinListing(listingId: number, userId: string): Promise<{ participation: Participation; listing: Listing }> {
    // Atomic transaction: increment filledSlots only if listing is active and not full.
    // Unique constraint on (listing_id, user_id) is the DB-level backstop for duplicate joins.
    return await db.transaction(async (tx) => {
      // Check for duplicate participation first — prevents slot increment on already-joined users
      const [existing] = await tx.select({ id: participations.id })
        .from(participations)
        .where(and(eq(participations.listingId, listingId), eq(participations.userId, userId)));
      if (existing) throw new Error("Already participating in this listing");

      // Atomically check and increment in one SQL statement — no read-then-write race.
      // Expired listings (past expiresAt) are not joinable; null expiresAt means no expiry.
      const updated = await tx.update(listings)
        .set({ filledSlots: sql`${listings.filledSlots} + 1` })
        .where(and(
          eq(listings.id, listingId),
          eq(listings.status, "active"),
          sql`${listings.filledSlots} < ${listings.totalSlots}`,
          sql`(${listings.expiresAt} IS NULL OR ${listings.expiresAt} > now())`
        ))
        .returning();

      if (updated.length === 0) {
        // Distinguish between not found, not active, expired, and full
        const [listing] = await tx.select().from(listings).where(eq(listings.id, listingId));
        if (!listing) throw new Error("Listing not found");
        if (listing.status !== "active") throw new Error("Listing is not active");
        if (listing.expiresAt && new Date(listing.expiresAt) <= new Date()) throw new Error("Listing has expired");
        throw new Error("Listing is full");
      }

      let participation: Participation;
      try {
        [participation] = await tx.insert(participations).values({
          listingId,
          userId,
        }).returning();
      } catch (err: any) {
        // PostgreSQL unique violation (23505) — concurrent join race, treat as duplicate
        if (err?.code === "23505") throw new Error("Already participating in this listing");
        throw err;
      }

      // Mark completed if now full — capture the final row so callers branch on
      // the post-update state (no stale pre-join read).
      let finalListing: Listing = updated[0];
      if (updated[0].filledSlots >= updated[0].totalSlots) {
        const [completed] = await tx.update(listings)
          .set({ status: "completed" })
          .where(eq(listings.id, listingId))
          .returning();
        if (completed) finalListing = completed;
      }

      return { participation, listing: finalListing };
    });
  }

  async leaveListing(listingId: number, userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      const deleted = await tx.delete(participations)
        .where(and(eq(participations.listingId, listingId), eq(participations.userId, userId)))
        .returning();
      
      if (deleted.length > 0) {
        await tx.update(listings)
          .set({ filledSlots: sql`${listings.filledSlots} - 1` })
          .where(eq(listings.id, listingId));
          
        // If it was completed, maybe revert to active? 
        // Logic: If status was completed, and now slots < total, set to active.
        const [listing] = await tx.select().from(listings).where(eq(listings.id, listingId));
        if (listing.status === 'completed' && listing.filledSlots < listing.totalSlots) {
             await tx.update(listings)
              .set({ status: "active" })
              .where(eq(listings.id, listingId));
        }
      }
    });
  }

  async getParticipation(listingId: number, userId: string): Promise<Participation | undefined> {
    const [p] = await db.select().from(participations)
      .where(and(eq(participations.listingId, listingId), eq(participations.userId, userId)));
    return p;
  }

  async getParticipationsByListing(listingId: number): Promise<Participation[]> {
    return await db.select().from(participations).where(eq(participations.listingId, listingId));
  }
  
  async getUserParticipations(userId: string): Promise<Participation[]> {
     return await db.select().from(participations).where(eq(participations.userId, userId));
  }

  async getParticipationById(id: number): Promise<Participation | undefined> {
    const [p] = await db.select().from(participations).where(eq(participations.id, id));
    return p;
  }

  async getAllParticipations(): Promise<(Participation & { listing?: any; user?: any })[]> {
    const rows = await db.query.participations.findMany({
      with: {
        listing: true,
        user: true,
      },
      orderBy: [desc(participations.joinedAt)],
      limit: 500,
    });
    return rows as any;
  }

  async getMessages(listingId: number): Promise<(Message & { sender: any })[]> {
    return await db.query.messages.findMany({
      where: eq(messages.listingId, listingId),
      with: {
        sender: true
      },
      orderBy: [desc(messages.createdAt)],
      limit: 300,
    });
  }

  async createMessage(message: { listingId: number, userId: string, content: string }): Promise<Message> {
    const [msg] = await db.insert(messages).values(message).returning();
    return msg;
  }

  async createReport(report: CreateReportRequest & { reporterId: string }): Promise<Report> {
    const [rpt] = await db.insert(reports).values(report).returning();
    return rpt;
  }

  async getReports(): Promise<any[]> {
    const rows = await db.select().from(reports)
      .where(eq(reports.resolved, false))
      .orderBy(desc(reports.createdAt))
      .limit(200);

    if (rows.length === 0) return [];

    // Batch-fetch all referenced users and listings in 3 total queries (not N+1)
    const userIds = [...new Set([
      ...rows.map(r => r.reporterId),
      ...rows.map(r => r.reportedUserId).filter(Boolean) as string[],
    ])];
    const listingIds = [...new Set(rows.map(r => r.listingId).filter(Boolean))] as number[];

    const [usersData, listingsData] = await Promise.all([
      userIds.length > 0
        ? db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName, email: users.email })
            .from(users).where(inArray(users.id, userIds))
        : [],
      listingIds.length > 0
        ? db.select({ id: listings.id, title: listings.title, status: listings.status })
            .from(listings).where(inArray(listings.id, listingIds))
        : [],
    ]);

    const userMap = new Map(usersData.map(u => [u.id, u]));
    const listingMap = new Map(listingsData.map(l => [l.id, l]));

    return rows.map(r => ({
      ...r,
      reporter: userMap.get(r.reporterId) ?? null,
      reportedUser: r.reportedUserId ? userMap.get(r.reportedUserId) ?? null : null,
      listing: r.listingId ? listingMap.get(r.listingId) ?? null : null,
    }));
  }

  async resolveReport(id: number): Promise<void> {
    await db.update(reports).set({ resolved: true }).where(eq(reports.id, id));
  }

  async createDealProof(proof: { listingId: number; userId: string; imageUrl: string }): Promise<DealProof> {
    const [row] = await db.insert(dealProofs).values(proof).returning();
    return row;
  }

  async getDealProofs(listingId: number): Promise<(DealProof & { user: any })[]> {
    const rows = await db.select().from(dealProofs)
      .where(eq(dealProofs.listingId, listingId))
      .orderBy(desc(dealProofs.createdAt));

    if (rows.length === 0) return [];

    // Batch-fetch all proof owners in a single query (no N+1)
    const userIds = [...new Set(rows.map(p => p.userId))];
    const usersData = await db.select({
      id: users.id, firstName: users.firstName, lastName: users.lastName, profileImageUrl: users.profileImageUrl,
    }).from(users).where(inArray(users.id, userIds));

    const userMap = new Map(usersData.map(u => [u.id, u]));
    return rows.map(p => ({ ...p, user: userMap.get(p.userId) ?? null }));
  }

  async confirmDealProof(proofId: number): Promise<void> {
    await db.update(dealProofs).set({ confirmed: true }).where(eq(dealProofs.id, proofId));
  }

  async getUserListings(userId: string): Promise<ListingWithCreator[]> {
    return await db.query.listings.findMany({
      where: eq(listings.creatorId, userId),
      with: {
        creator: true
      },
      orderBy: [desc(listings.createdAt)]
    });
  }

  async getUserGroups(userId: string): Promise<ListingWithCreator[]> {
    // First get the listing IDs the user participates in
    const userParticipations = await db
      .select({ listingId: participations.listingId })
      .from(participations)
      .where(eq(participations.userId, userId));

    const participatedIds = userParticipations.map((p) => p.listingId);

    // Fetch all listings where user is creator OR participant in one query
    return await db.query.listings.findMany({
      where: participatedIds.length > 0
        ? or(eq(listings.creatorId, userId), inArray(listings.id, participatedIds))
        : eq(listings.creatorId, userId),
      with: {
        creator: true,
        participants: { with: { user: true } },
      },
      orderBy: [desc(listings.updatedAt)],
    });
  }

  async joinWaitlist(listingId: number, userId: string): Promise<Waitlist> {
    const existing = await db.query.waitlists.findFirst({
      where: and(eq(waitlists.listingId, listingId), eq(waitlists.userId, userId)),
    });
    if (existing) return existing;
    const [entry] = await db.insert(waitlists).values({ listingId, userId }).returning();
    return entry;
  }

  async leaveWaitlist(listingId: number, userId: string): Promise<void> {
    await db.delete(waitlists).where(
      and(eq(waitlists.listingId, listingId), eq(waitlists.userId, userId))
    );
  }

  async getWaitlistPosition(listingId: number, userId: string): Promise<number> {
    const all = await db.query.waitlists.findMany({
      where: eq(waitlists.listingId, listingId),
      orderBy: [desc(waitlists.joinedAt)],
    });
    const idx = all.findIndex((w) => w.userId === userId);
    return idx === -1 ? -1 : idx + 1;
  }

  async getWaitlistForListing(listingId: number): Promise<Waitlist[]> {
    return await db.query.waitlists.findMany({
      where: eq(waitlists.listingId, listingId),
      orderBy: [desc(waitlists.joinedAt)],
    });
  }

  async notifyFirstWaiter(listingId: number): Promise<string | null> {
    const first = await db.query.waitlists.findFirst({
      where: and(eq(waitlists.listingId, listingId), eq(waitlists.notified, false)),
      orderBy: [asc(waitlists.joinedAt)], // FIFO: oldest waiter first
    });
    if (!first) return null;
    await db.update(waitlists).set({ notified: true }).where(eq(waitlists.id, first.id));
    return first.userId;
  }

  // Warnings
  async warnUser(warning: InsertWarning): Promise<Warning> {
    const [w] = await db.insert(warnings).values(warning).returning();
    return w;
  }

  async getWarning(listingId: number, userId: string): Promise<Warning | undefined> {
    return await db.query.warnings.findFirst({
      where: and(
        eq(warnings.listingId, listingId),
        eq(warnings.warnedUserId, userId),
        eq(warnings.kicked, false)
      )
    });
  }

  async getWarningsByListing(listingId: number): Promise<Warning[]> {
    return await db.select().from(warnings)
      .where(and(eq(warnings.listingId, listingId), eq(warnings.kicked, false)))
      .orderBy(desc(warnings.warnedAt));
  }

  async kickUser(warningId: number): Promise<void> {
    await db.update(warnings).set({ 
      kicked: true, 
      kickedAt: new Date() 
    }).where(eq(warnings.id, warningId));
  }

  async wasKicked(listingId: number, userId: string): Promise<boolean> {
    const record = await db.query.warnings.findFirst({
      where: and(
        eq(warnings.listingId, listingId),
        eq(warnings.warnedUserId, userId),
        eq(warnings.kicked, true)
      ),
    });
    return !!record;
  }

  async removeParticipant(listingId: number, userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      const deleted = await tx.delete(participations).where(
        and(
          eq(participations.listingId, listingId),
          eq(participations.userId, userId)
        )
      ).returning();
      // Only decrement when a row was actually removed, and never below zero.
      if (deleted.length > 0) {
        await tx.update(listings)
          .set({ filledSlots: sql`GREATEST(${listings.filledSlots} - 1, 0)` })
          .where(eq(listings.id, listingId));
      }
    });
  }

  // Listing Images
  async addListingImages(listingId: number, imageUrls: string[]): Promise<ListingImage[]> {
    if (imageUrls.length === 0) return [];
    const values = imageUrls.map((url, i) => ({ listingId, imageUrl: url, sortOrder: i }));
    return await db.insert(listingImages).values(values).returning();
  }

  async getListingImages(listingId: number): Promise<ListingImage[]> {
    return await db.select().from(listingImages)
      .where(eq(listingImages.listingId, listingId))
      .orderBy(listingImages.sortOrder);
  }

  // Saved Listings
  async saveListing(userId: string, listingId: number): Promise<SavedListing> {
    const [saved] = await db.insert(savedListings).values({ userId, listingId }).returning();
    return saved;
  }

  async unsaveListing(userId: string, listingId: number): Promise<void> {
    await db.delete(savedListings).where(
      and(eq(savedListings.userId, userId), eq(savedListings.listingId, listingId))
    );
  }

  async getSavedListings(userId: string): Promise<any[]> {
    return await db.query.savedListings.findMany({
      where: eq(savedListings.userId, userId),
      with: { listing: { with: { creator: true } } },
      orderBy: [desc(savedListings.savedAt)],
    });
  }

  async isSaved(userId: string, listingId: number): Promise<boolean> {
    const [result] = await db.select().from(savedListings)
      .where(and(eq(savedListings.userId, userId), eq(savedListings.listingId, listingId)));
    return !!result;
  }

  // Reviews
  async createReview(review: InsertReview & { reviewerId: string }): Promise<Review> {
    const [r] = await db.insert(reviews).values(review).returning();
    return r;
  }

  async getReviewsForUser(userId: string): Promise<any[]> {
    return await db.query.reviews.findMany({
      where: eq(reviews.reviewedUserId, userId),
      with: { reviewer: true, listing: true },
      orderBy: [desc(reviews.createdAt)],
    });
  }

  async hasReviewed(reviewerId: string, listingId: number): Promise<boolean> {
    const [result] = await db.select().from(reviews)
      .where(and(eq(reviews.reviewerId, reviewerId), eq(reviews.listingId, listingId)));
    return !!result;
  }

  // Listing Views
  async trackView(listingId: number, userId?: string): Promise<void> {
    await db.insert(listingViews).values({ listingId, userId: userId || null });
  }

  async getViewCount(listingId: number): Promise<number> {
    const [result] = await db.select({ count: count() }).from(listingViews)
      .where(eq(listingViews.listingId, listingId));
    return result?.count || 0;
  }

  async getJoinedTodayCount(listingId: number): Promise<number> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [result] = await db.select({ count: count() }).from(participations)
      .where(and(eq(participations.listingId, listingId), gte(participations.joinedAt, todayStart)));
    return result?.count || 0;
  }

  async getViewsTodayCount(listingId: number): Promise<number> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [result] = await db.select({ count: count() }).from(listingViews)
      .where(and(eq(listingViews.listingId, listingId), gte(listingViews.viewedAt, todayStart)));
    return result?.count || 0;
  }

  async getTrendingListings(limit = 10): Promise<ListingWithCreator[]> {
    const now = new Date();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const trendingIds = await db.select({
      listingId: listingViews.listingId,
      viewCount: count(),
    })
      .from(listingViews)
      .where(gte(listingViews.viewedAt, sevenDaysAgo))
      .groupBy(listingViews.listingId)
      .orderBy(desc(count()))
      .limit(limit);

    if (trendingIds.length === 0) {
      return await db.query.listings.findMany({
        where: (listings, { and, eq, gte: gteOp }) => and(
          eq(listings.status, "active"),
          gteOp(listings.expiresAt, now)
        ),
        with: { creator: true },
        orderBy: [desc(listings.createdAt)],
        limit,
      });
    }

    const ids = trendingIds.map(t => t.listingId);
    const results = await db.query.listings.findMany({
      where: (listings, { and, eq, inArray, gte: gteOp }) => and(
        inArray(listings.id, ids),
        eq(listings.status, "active"),
        gteOp(listings.expiresAt, now)
      ),
      with: { creator: true },
    });

    return results.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  }

  async getExpiringSoonListings(limit = 10): Promise<ListingWithCreator[]> {
    const now = new Date();
    const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    return await db.query.listings.findMany({
      where: (listings, { and, eq, gte: gteOp, lte }) => and(
        eq(listings.status, "active"),
        gteOp(listings.expiresAt, now),
        lte(listings.expiresAt, twoDaysFromNow)
      ),
      with: { creator: true },
      orderBy: [listings.expiresAt],
      limit,
    });
  }

  async getRecentListings(limit = 10): Promise<ListingWithCreator[]> {
    const now = new Date();
    return await db.query.listings.findMany({
      where: (listings, { and, eq, gte: gteOp }) => and(
        eq(listings.status, "active"),
        gteOp(listings.expiresAt, now)
      ),
      with: { creator: true },
      orderBy: [desc(listings.createdAt)],
      limit,
    });
  }

  async getDealOfDay(): Promise<ListingWithCreator | null> {
    const now = new Date();

    // Seed a deterministic day offset so the deal rotates daily at midnight UTC
    const dayKey = Math.floor(now.getTime() / (24 * 60 * 60 * 1000));

    // Priority 1: admin-featured listings
    const featuredListings = await db.query.listings.findMany({
      where: (l, { and, eq: eqOp, gte: gteOp }) => and(
        eqOp(l.status, "active"),
        eqOp(l.isFeatured, true),
        gteOp(l.expiresAt, now)
      ),
      with: { creator: true },
      orderBy: [desc(listings.filledSlots)],
      limit: 20,
    });

    let pool: ListingWithCreator[] = featuredListings;

    // Priority 2: top trending active listings if no featured
    if (pool.length === 0) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const trendingIds = await db.select({ listingId: listingViews.listingId, viewCount: count() })
        .from(listingViews)
        .where(gte(listingViews.viewedAt, sevenDaysAgo))
        .groupBy(listingViews.listingId)
        .orderBy(desc(count()))
        .limit(20);

      if (trendingIds.length > 0) {
        pool = await db.query.listings.findMany({
          where: (l, { and, eq: eqOp, inArray: inArrayOp, gte: gteOp }) => and(
            eqOp(l.status, "active"),
            gteOp(l.expiresAt, now),
            inArrayOp(l.id, trendingIds.map(t => t.listingId))
          ),
          with: { creator: true },
          limit: 20,
        });
      }
    }

    // Priority 3: most filled active listings
    if (pool.length === 0) {
      pool = await db.query.listings.findMany({
        where: (l, { and, eq: eqOp, gte: gteOp }) => and(
          eqOp(l.status, "active"),
          gteOp(l.expiresAt, now)
        ),
        with: { creator: true },
        orderBy: [desc(listings.filledSlots)],
        limit: 20,
      });
    }

    if (pool.length === 0) return null;

    // Rotate deterministically based on day
    return pool[dayKey % pool.length];
  }

  // Listing Updates
  async createListingUpdate(update: { listingId: number, userId: string, content: string }): Promise<ListingUpdate> {
    const [u] = await db.insert(listingUpdates).values(update).returning();
    return u;
  }

  async getListingUpdates(listingId: number): Promise<any[]> {
    return await db.query.listingUpdates.findMany({
      where: eq(listingUpdates.listingId, listingId),
      with: { user: true },
      orderBy: [desc(listingUpdates.createdAt)],
    });
  }

  // Co-organizer
  async promoteToCoOrganizer(listingId: number, userId: string): Promise<Participation> {
    const [updated] = await db.update(participations)
      .set({ role: "co-organizer" })
      .where(and(eq(participations.listingId, listingId), eq(participations.userId, userId)))
      .returning();
    return updated;
  }

  async demoteCoOrganizer(listingId: number, userId: string): Promise<Participation> {
    const [updated] = await db.update(participations)
      .set({ role: "member" })
      .where(and(eq(participations.listingId, listingId), eq(participations.userId, userId)))
      .returning();
    return updated;
  }

  // Watchlist
  async getUsersWhoSavedListing(listingId: number): Promise<string[]> {
    const results = await db.select({ userId: savedListings.userId })
      .from(savedListings)
      .where(eq(savedListings.listingId, listingId));
    return results.map(r => r.userId);
  }

  // Search suggestions
  async getSearchSuggestions(query: string): Promise<string[]> {
    const results = await db.select({ title: listings.title })
      .from(listings)
      .where(and(
        ilike(listings.title, `%${query}%`),
        eq(listings.status, "active")
      ))
      .limit(8);
    return results.map(r => r.title);
  }

  async computeReliabilityScore(userId: string): Promise<{ score: number; badges: string[]; stats: { completedGroups: number; avgRating: number; reportsReceived: number; cancelledParticipations: number; completedListingsCreated: number } }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return { score: 0, badges: [], stats: { completedGroups: 0, avgRating: 0, reportsReceived: 0, cancelledParticipations: 0, completedListingsCreated: 0 } };
    }

    const completedGroups = user.completedParticipations || 0;
    const cancelledParticipations = user.cancelledParticipations || 0;
    const avgRating = user.ratingCount && user.ratingCount > 0 ? (user.rating || 0) : 0;

    const [[reportsResult], [completedListingsResult]] = await Promise.all([
      db.select({ count: count() }).from(reports)
        .where(and(eq(reports.reportedUserId, userId), eq(reports.resolved, false))),
      db.select({ count: count() }).from(listings)
        .where(and(eq(listings.creatorId, userId), eq(listings.status, "completed"))),
    ]);
    const reportsReceived = reportsResult?.count || 0;
    const completedListingsCreated = completedListingsResult?.count || 0;

    let score = 50;
    score += Math.min(20, completedGroups * 4);
    if (avgRating > 0) {
      score += Math.round((avgRating / 5) * 15);
    }
    score -= reportsReceived * 10;
    score -= cancelledParticipations * 5;
    score += Math.min(10, completedListingsCreated * 2);
    score = Math.max(0, Math.min(100, score));

    await db.update(users).set({ reliabilityScore: score }).where(eq(users.id, userId));

    const badges: string[] = [];
    if (user.verificationStatus === "verified") {
      badges.push("verified");
    }
    if (score >= 70) {
      badges.push("trusted");
    }
    if (completedListingsCreated >= 5) {
      badges.push("top_organizer");
    }

    return {
      score,
      badges,
      stats: {
        completedGroups,
        avgRating,
        reportsReceived,
        cancelledParticipations,
        completedListingsCreated,
      },
    };
  }

  async createSavedSearch(userId: string, query: string | null, filters: any): Promise<SavedSearch> {
    const [saved] = await db.insert(savedSearches).values({
      userId,
      query,
      filters,
    }).returning();
    return saved;
  }

  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    return await db.select().from(savedSearches)
      .where(eq(savedSearches.userId, userId))
      .orderBy(desc(savedSearches.createdAt));
  }

  async deleteSavedSearch(id: number, userId: string): Promise<void> {
    await db.delete(savedSearches).where(
      and(eq(savedSearches.id, id), eq(savedSearches.userId, userId))
    );
  }

  async addTagsToListing(listingId: number, tags: string[]): Promise<ListingTag[]> {
    if (tags.length === 0) return [];
    const normalizedTags = tags.map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
    const uniqueTags = Array.from(new Set(normalizedTags));
    if (uniqueTags.length === 0) return [];
    const values = uniqueTags.map(tag => ({ listingId, tag }));
    return await db.insert(listingTags).values(values).returning();
  }

  async getTagsForListing(listingId: number): Promise<ListingTag[]> {
    return await db.select().from(listingTags)
      .where(eq(listingTags.listingId, listingId));
  }

  async getTagsForListings(listingIds: number[]): Promise<Map<number, ListingTag[]>> {
    const result = new Map<number, ListingTag[]>();
    if (listingIds.length === 0) return result;
    const rows = await db.select().from(listingTags)
      .where(inArray(listingTags.listingId, listingIds));
    for (const row of rows) {
      const existing = result.get(row.listingId) ?? [];
      existing.push(row);
      result.set(row.listingId, existing);
    }
    return result;
  }

  async getPopularTags(limit = 20): Promise<{ tag: string; count: number }[]> {
    const results = await db.select({
      tag: listingTags.tag,
      count: count(),
    })
      .from(listingTags)
      .groupBy(listingTags.tag)
      .orderBy(desc(count()))
      .limit(limit);
    return results;
  }

  async getMatchingSavedSearches(listing: Listing): Promise<SavedSearch[]> {
    // Fetch only candidates whose category/country/language filters match at the SQL level
    const candidates = await db.select().from(savedSearches).where(
      and(
        or(
          sql`${savedSearches.filters}->>'category' IS NULL`,
          sql`${savedSearches.filters}->>'category' = ''`,
          sql`${savedSearches.filters}->>'category' = ${listing.category}`
        ),
        or(
          sql`${savedSearches.filters}->>'country' IS NULL`,
          sql`${savedSearches.filters}->>'country' = ''`,
          sql`${savedSearches.filters}->>'country' = ${listing.country ?? ""}`
        ),
        or(
          sql`${savedSearches.filters}->>'language' IS NULL`,
          sql`${savedSearches.filters}->>'language' = ''`,
          sql`${savedSearches.filters}->>'language' = ${listing.language ?? ""}`
        )
      )
    );
    // Filter by free-text query in JS (full-text index would be future improvement)
    return candidates.filter(saved => {
      if (saved.query) {
        const q = saved.query.toLowerCase();
        const titleMatch = listing.title.toLowerCase().includes(q);
        const descMatch = listing.description.toLowerCase().includes(q);
        if (!titleMatch && !descMatch) return false;
      }
      return true;
    });
  }

  async createSuspiciousFlag(userId: string, flagType: string, details: string): Promise<SuspiciousFlag> {
    const [flag] = await db.insert(suspiciousFlags).values({
      userId,
      flagType,
      details,
    }).returning();
    return flag;
  }

  async getSuspiciousFlags(resolved?: boolean): Promise<(SuspiciousFlag & { user?: any })[]> {
    const flags = await db.select().from(suspiciousFlags)
      .where(resolved !== undefined ? eq(suspiciousFlags.resolved, resolved) : undefined)
      .orderBy(desc(suspiciousFlags.createdAt));

    const userIds = Array.from(new Set(flags.map(f => f.userId)));
    const usersData = userIds.length > 0
      ? await db.select().from(users).where(inArray(users.id, userIds))
      : [];
    const userMap = new Map(usersData.map(u => [u.id, u]));

    return flags.map(f => ({ ...f, user: userMap.get(f.userId) || null }));
  }

  async resolveSuspiciousFlag(id: number): Promise<void> {
    await db.update(suspiciousFlags).set({ resolved: true }).where(eq(suspiciousFlags.id, id));
  }

  async checkJoinRateLimit(userId: string): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const [result] = await db.select({ count: count() }).from(participations)
      .where(and(
        eq(participations.userId, userId),
        gte(participations.joinedAt, oneHourAgo)
      ));
    return (result?.count || 0) > 10;
  }

  async checkUnresolvedReports(userId: string): Promise<boolean> {
    const [result] = await db.select({ count: count() }).from(reports)
      .where(and(
        eq(reports.reportedUserId, userId),
        eq(reports.resolved, false)
      ));
    return (result?.count || 0) >= 3;
  }

  async checkMessageSpam(userId: string, listingId: number): Promise<boolean> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const [result] = await db.select({ count: count() }).from(messages)
      .where(and(
        eq(messages.userId, userId),
        eq(messages.listingId, listingId),
        gte(messages.createdAt, fiveMinutesAgo)
      ));
    return (result?.count || 0) > 20;
  }

  async deleteUserData(userId: string): Promise<void> {
    const userParticipations = await db.select().from(participations).where(eq(participations.userId, userId));
    for (const p of userParticipations) {
      await db.update(listings)
        .set({ filledSlots: sql`GREATEST(filled_slots - 1, 0)` })
        .where(eq(listings.id, p.listingId));
    }
    await db.delete(participations).where(eq(participations.userId, userId));
    await db.delete(messages).where(eq(messages.userId, userId));
    await db.delete(savedListings).where(eq(savedListings.userId, userId));
    await db.delete(reviews).where(or(eq(reviews.reviewerId, userId), eq(reviews.reviewedUserId, userId)));
    await db.delete(reports).where(eq(reports.reporterId, userId));
    await db.delete(suspiciousFlags).where(eq(suspiciousFlags.userId, userId));
  }

  async createSystemEvent(eventType: string, actorId: string | null, metadata?: any): Promise<SystemEvent> {
    const [event] = await db.insert(systemEvents).values({
      eventType,
      actorId,
      metadata: metadata || null,
    }).returning();
    return event;
  }

  async getSystemEvents(filters?: { eventType?: string; limit?: number; offset?: number }): Promise<{ events: SystemEvent[]; total: number }> {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const conditions = [];
    if (filters?.eventType) {
      conditions.push(eq(systemEvents.eventType, filters.eventType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db.select({ count: count() }).from(systemEvents)
      .where(whereClause);

    const events = await db.select().from(systemEvents)
      .where(whereClause)
      .orderBy(desc(systemEvents.createdAt))
      .limit(limit)
      .offset(offset);

    return { events, total: totalResult?.count || 0 };
  }

  async recordActivity(type: string, actorId: string | null, listingId: number | null, metadata?: any): Promise<ActivityFeedEntry> {
    const [entry] = await db.insert(activityFeed).values({
      type,
      actorId,
      listingId,
      metadata: metadata || null,
    }).returning();
    return entry;
  }

  async getActivityFeed(limit = 20, offset = 0): Promise<(ActivityFeedEntry & { actor?: any; listing?: any })[]> {
    const entries = await db.select().from(activityFeed)
      .orderBy(desc(activityFeed.createdAt))
      .limit(limit)
      .offset(offset);

    const actorIds = Array.from(new Set(entries.filter(e => e.actorId).map(e => e.actorId!)));
    const listingIds = Array.from(new Set(entries.filter(e => e.listingId).map(e => e.listingId!)));

    const actorsMap: Record<string, any> = {};
    if (actorIds.length > 0) {
      const actorsData = await db.select().from(users).where(inArray(users.id, actorIds));
      for (const a of actorsData) {
        actorsMap[a.id] = a;
      }
    }

    const listingsMap: Record<number, any> = {};
    if (listingIds.length > 0) {
      const listingsData = await db.select().from(listings).where(inArray(listings.id, listingIds));
      for (const l of listingsData) {
        listingsMap[l.id] = l;
      }
    }

    return entries.map(entry => ({
      ...entry,
      actor: entry.actorId ? actorsMap[entry.actorId] || null : null,
      listing: entry.listingId ? listingsMap[entry.listingId] || null : null,
    }));
  }

  async enqueueEmail(userId: string, emailType: string, payload: any): Promise<EmailQueueEntry> {
    const [entry] = await db.insert(emailQueue).values({
      userId,
      emailType,
      payload: payload || null,
      status: "pending",
    }).returning();
    return entry;
  }

  async getEmailQueue(status?: string): Promise<EmailQueueEntry[]> {
    if (status) {
      return await db.select().from(emailQueue)
        .where(eq(emailQueue.status, status as any))
        .orderBy(desc(emailQueue.createdAt));
    }
    return await db.select().from(emailQueue)
      .orderBy(desc(emailQueue.createdAt));
  }

  async markEmailProcessed(id: number, status: "sent" | "failed"): Promise<void> {
    await db.update(emailQueue)
      .set({ status, processedAt: new Date() })
      .where(eq(emailQueue.id, id));
  }

  async recordListingHistory(listingId: number, editorId: string, changes: Record<string, { old: any; new: any }>): Promise<ListingHistoryEntry> {
    const [entry] = await db.insert(listingHistory).values({
      listingId,
      editorId,
      changes,
    }).returning();
    return entry;
  }

  async getListingHistory(listingId: number): Promise<(ListingHistoryEntry & { editor?: any })[]> {
    const entries = await db
      .select()
      .from(listingHistory)
      .where(eq(listingHistory.listingId, listingId))
      .orderBy(desc(listingHistory.createdAt));

    const editorIds = Array.from(new Set(entries.map(e => e.editorId)));
    const editorRecords = editorIds.length > 0
      ? await db.select().from(users).where(inArray(users.id, editorIds))
      : [];
    const editorMap = new Map(editorRecords.map(u => [u.id, u]));

    return entries.map(entry => ({
      ...entry,
      editor: editorMap.get(entry.editorId) || null,
    }));
  }

  async getAllListingHistory(limit = 50): Promise<(ListingHistoryEntry & { editor?: any; listing?: any })[]> {
    const entries = await db
      .select()
      .from(listingHistory)
      .orderBy(desc(listingHistory.createdAt))
      .limit(limit);

    const editorIds = Array.from(new Set(entries.map(e => e.editorId)));
    const listingIds = Array.from(new Set(entries.map(e => e.listingId)));

    const [editorRecords, listingRecords] = await Promise.all([
      editorIds.length > 0 ? db.select().from(users).where(inArray(users.id, editorIds)) : [],
      listingIds.length > 0 ? db.select().from(listings).where(inArray(listings.id, listingIds)) : [],
    ]);

    const editorMap = new Map(editorRecords.map(u => [u.id, u]));
    const listingMap = new Map(listingRecords.map(l => [l.id, l]));

    return entries.map(entry => ({
      ...entry,
      editor: editorMap.get(entry.editorId) || null,
      listing: listingMap.get(entry.listingId) || null,
    }));
  }

  async getFeatureFlag(key: string): Promise<FeatureFlag | undefined> {
    const [flag] = await db.select().from(featureFlags).where(eq(featureFlags.key, key));
    return flag;
  }

  async setFeatureFlag(key: string, enabled: boolean): Promise<FeatureFlag> {
    const existing = await this.getFeatureFlag(key);
    if (existing) {
      const [updated] = await db.update(featureFlags)
        .set({ enabled })
        .where(eq(featureFlags.key, key))
        .returning();
      return updated;
    }
    const [created] = await db.insert(featureFlags)
      .values({ key, enabled })
      .returning();
    return created;
  }

  async getAllFeatureFlags(): Promise<FeatureFlag[]> {
    return await db.select().from(featureFlags).orderBy(featureFlags.key);
  }

  // Site Settings
  async getSiteSetting(key: string): Promise<string | null> {
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return row?.value ?? null;
  }

  async setSiteSetting(key: string, value: string): Promise<void> {
    await db.insert(siteSettings)
      .values({ key, value })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
  }

  async getAllSiteSettings(): Promise<Record<string, string>> {
    const rows = await db.select().from(siteSettings);
    const result: Record<string, string> = {
      siteName: "Grouperry",
      commissionPct: "0",
      defaultExpiry: "7",
      maxUsersPerListing: "100",
      currency: "USD",
    };
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  }

  // Orders (Commit to Buy)
  async createOrder(order: { listingId: number; userId: string; amountCents?: number; notes?: string }): Promise<Order> {
    const [created] = await db.insert(orders).values({
      listingId: order.listingId,
      userId: order.userId,
      status: "committed",
      amountCents: order.amountCents ?? null,
      notes: order.notes ?? null,
    }).returning();
    return created;
  }

  async getOrder(id: number): Promise<Order | null> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return order ?? null;
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return order;
  }

  async getOrderByListingAndUser(listingId: number, userId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders)
      .where(and(eq(orders.listingId, listingId), eq(orders.userId, userId)))
      .limit(1);
    return order;
  }

  async getOrdersByUser(userId: string): Promise<(Order & { listing?: any })[]> {
    const results = await db.select().from(orders)
      .leftJoin(listings, eq(orders.listingId, listings.id))
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
    return results.map(r => ({ ...r.orders, listing: r.listings }));
  }

  async getOrdersByListing(listingId: number): Promise<(Order & { user?: any })[]> {
    const results = await db.select().from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.listingId, listingId))
      .orderBy(desc(orders.createdAt));
    return results.map(r => ({ ...r.orders, user: r.users }));
  }

  async updateOrderStatus(id: number, status: Order["status"]): Promise<Order> {
    const [updated] = await db.update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async deleteOrder(id: number): Promise<void> {
    await db.delete(orders).where(eq(orders.id, id));
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order> {
    const [updated] = await db.update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async getAllOrders(limit = 100): Promise<(Order & { listing?: any; user?: any })[]> {
    const results = await db.select().from(orders)
      .leftJoin(listings, eq(orders.listingId, listings.id))
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt))
      .limit(limit);
    return results.map(r => ({ ...r.orders, listing: r.listings, user: r.users }));
  }

  // ── Deal Milestones ─────────────────────────────────────────────────────────

  async getMilestones(listingId: number): Promise<DealMilestone[]> {
    return db.select().from(dealMilestones)
      .where(eq(dealMilestones.listingId, listingId))
      .orderBy(dealMilestones.stage);
  }

  async upsertMilestone(listingId: number, stage: DealMilestone["stage"], data: { status?: DealMilestone["status"]; proofUrl?: string; notes?: string; actorId?: string }): Promise<DealMilestone> {
    const [existing] = await db.select().from(dealMilestones)
      .where(and(eq(dealMilestones.listingId, listingId), eq(dealMilestones.stage, stage)));
    
    const now = new Date();
    const completedAt = data.status === "completed" ? now : undefined;

    if (existing) {
      const [updated] = await db.update(dealMilestones)
        .set({ ...data, updatedAt: now, ...(completedAt ? { completedAt } : {}) })
        .where(eq(dealMilestones.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(dealMilestones)
        .values({ listingId, stage, ...data, ...(completedAt ? { completedAt } : {}) })
        .returning();
      return created;
    }
  }

  async updateParticipationPaymentStatus(listingId: number, userId: string, paymentStatus: string): Promise<void> {
    await db.update(participations)
      .set({ paymentStatus } as any)
      .where(and(eq(participations.listingId, listingId), eq(participations.userId, userId)));
  }

  async confirmMilestone(listingId: number, stage: DealMilestone["stage"]): Promise<DealMilestone> {
    const [existing] = await db.select().from(dealMilestones)
      .where(and(eq(dealMilestones.listingId, listingId), eq(dealMilestones.stage, stage)));
    
    const newCount = (existing?.confirmedCount ?? 0) + 1;
    if (existing) {
      const [updated] = await db.update(dealMilestones)
        .set({ confirmedCount: newCount, updatedAt: new Date() })
        .where(eq(dealMilestones.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(dealMilestones)
        .values({ listingId, stage, confirmedCount: newCount, status: "in_progress" })
        .returning();
      return created;
    }
  }

  // Referral implementations
  async createReferral(referrerId: string, referredUserId: string): Promise<Referral> {
    const [referral] = await db.insert(referrals)
      .values({ referrerId, referredUserId, rewardGranted: false })
      .onConflictDoNothing()
      .returning();
    return referral;
  }

  async getReferralStats(userId: string): Promise<{ totalReferrals: number; rewardedReferrals: number; referredUsers: any[] }> {
    const userReferrals = await db.select({
      id: referrals.id,
      referredUserId: referrals.referredUserId,
      rewardGranted: referrals.rewardGranted,
      createdAt: referrals.createdAt,
    })
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt));

    const referredUserIds = userReferrals.map(r => r.referredUserId);
    let referredUsersData: any[] = [];

    if (referredUserIds.length > 0) {
      referredUsersData = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt,
      })
        .from(users)
        .where(inArray(users.id, referredUserIds));
    }

    const enriched = userReferrals.map(r => ({
      ...r,
      user: referredUsersData.find(u => u.id === r.referredUserId) || null,
    }));

    return {
      totalReferrals: userReferrals.length,
      rewardedReferrals: userReferrals.filter(r => r.rewardGranted).length,
      referredUsers: enriched,
    };
  }

  async hasBeenReferred(userId: string): Promise<boolean> {
    const [existing] = await db.select({ id: referrals.id })
      .from(referrals)
      .where(eq(referrals.referredUserId, userId))
      .limit(1);
    return !!existing;
  }

  async grantReferralReward(referredUserId: string): Promise<string | null> {
    const [row] = await db.update(referrals)
      .set({ rewardGranted: true })
      .where(and(eq(referrals.referredUserId, referredUserId), eq(referrals.rewardGranted, false)))
      .returning({ referrerId: referrals.referrerId });
    return row?.referrerId ?? null;
  }

  async transitionListing(id: number, newStatus: "active" | "completed" | "expired" | "cancelled"): Promise<Listing> {
    const VALID_TRANSITIONS: Record<string, string[]> = {
      active: ["completed", "expired", "cancelled"],
      expired: ["cancelled"],
      completed: [],
      cancelled: [],
    };

    return await db.transaction(async (tx) => {
      const [current] = await tx
        .select({ status: listings.status })
        .from(listings)
        .where(eq(listings.id, id))
        .limit(1);

      if (!current) throw new Error(`Listing ${id} not found`);

      const allowed = VALID_TRANSITIONS[current.status] ?? [];
      if (!allowed.includes(newStatus)) {
        throw new Error(`Cannot transition listing from "${current.status}" to "${newStatus}"`);
      }

      const [updated] = await tx
        .update(listings)
        .set({ status: newStatus as any, updatedAt: new Date() })
        .where(eq(listings.id, id))
        .returning();

      return updated;
    });
  }

  async getNearCompletionListings(limit = 10): Promise<ListingWithCreator[]> {
    const allActive = await db.select({
      listing: listings,
      creator: users,
    })
      .from(listings)
      .innerJoin(users, eq(listings.creatorId, users.id))
      .where(eq(listings.status, "active"))
      .orderBy(desc(listings.filledSlots));

    const nearComplete = allActive
      .filter(row => row.listing.totalSlots > 0 && (row.listing.filledSlots / row.listing.totalSlots) >= 0.65)
      .slice(0, limit)
      .map(row => ({ ...row.listing, creator: row.creator })) as ListingWithCreator[];

    return nearComplete;
  }

  async createInvitation(data: { listingId: number; inviterId: string; invitedUserId: string }): Promise<Invitation> {
    const [inv] = await db.insert(invitations)
      .values({ ...data, status: "pending" })
      .onConflictDoNothing()
      .returning();
    return inv;
  }

  async getInvitationsForUser(userId: string): Promise<any[]> {
    const rows = await db.select({
      invitation: invitations,
      listing: { id: listings.id, title: listings.title, status: listings.status, imageUrl: listings.imageUrl },
      inviter: { id: users.id, firstName: users.firstName, lastName: users.lastName, profileImageUrl: users.profileImageUrl },
    })
      .from(invitations)
      .innerJoin(listings, eq(invitations.listingId, listings.id))
      .innerJoin(users, eq(invitations.inviterId, users.id))
      .where(and(eq(invitations.invitedUserId, userId), eq(invitations.status, "pending")))
      .orderBy(desc(invitations.createdAt));

    return rows.map(r => ({ ...r.invitation, listing: r.listing, inviter: r.inviter }));
  }

  async getInvitation(id: number): Promise<Invitation | null> {
    const [inv] = await db.select().from(invitations).where(eq(invitations.id, id)).limit(1);
    return inv ?? null;
  }

  async updateInvitation(id: number, status: "accepted" | "declined"): Promise<void> {
    await db.update(invitations).set({ status }).where(eq(invitations.id, id));
  }

  async subscribeNewsletterEmail(email: string, locale?: string | null): Promise<"created" | "exists"> {
    const normalized = email.trim().toLowerCase();
    const [existing] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, normalized)).limit(1);
    if (existing) return "exists";
    await db.insert(newsletterSubscribers).values({ email: normalized, locale: locale?.trim() || null });
    return "created";
  }
}

export const storage = new DatabaseStorage();

export async function isFeatureEnabled(key: string): Promise<boolean> {
  const flag = await storage.getFeatureFlag(key);
  return flag?.enabled ?? false;
}

export async function seedFeatureFlags(): Promise<void> {
  const defaultFlags = [
    "activity_feed",
    "invitations",
    "saved_search_alerts",
    "completion_celebrations",
    "enable_payments",
  ];
  for (const key of defaultFlags) {
    const existing = await storage.getFeatureFlag(key);
    if (!existing) {
      await storage.setFeatureFlag(key, false);
    }
  }
}
