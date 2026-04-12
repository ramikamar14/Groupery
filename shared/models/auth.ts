import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, text, pgEnum, boolean, integer } from "drizzle-orm/pg-core";

// Enums for user types, verification, and roles
export const userTypeEnum = pgEnum("user_type", ["individual", "vendor"]);
export const verificationStatusEnum = pgEnum("verification_status", ["pending", "verified", "rejected"]);
export const userRoleEnum = pgEnum("user_role", ["user", "admin", "moderator"]);

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  phoneVerified: boolean("phone_verified").default(false),
  country: varchar("country"),
  city: varchar("city"),
  language: varchar("language"),
  bio: text("bio"),
  onboardingComplete: boolean("onboarding_complete").default(false),
  userType: userTypeEnum("user_type").default("individual"),
  verificationStatus: verificationStatusEnum("verification_status").default("pending"),
  idDocumentUrl: text("id_document_url"),
  selfieUrl: text("selfie_url"),
  isAdmin: boolean("is_admin").default(false),
  role: userRoleEnum("role").default("user").notNull(),
  isDisabled: boolean("is_disabled").default(false),
  rating: integer("rating").default(0),
  ratingCount: integer("rating_count").default(0),
  reliabilityScore: integer("reliability_score").default(50),
  joinCount: integer("join_count").default(0),
  completedParticipations: integer("completed_participations").default(0),
  cancelledParticipations: integer("cancelled_participations").default(0),
  noShowFlags: integer("no_show_flags").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  passwordHash: varchar("password_hash"),
  googleId: varchar("google_id").unique(),
  authProvider: varchar("auth_provider").default("local"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendor details table
export const vendorDetails = pgTable("vendor_details", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessName: text("business_name").notNull(),
  businessLicenseUrl: text("business_license_url"),
  storeAddress: text("store_address"),
  contactPhone: varchar("contact_phone"),
  logoUrl: text("logo_url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedListingId: integer("related_listing_id"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blocked users table
export const blockedUsers = pgTable("blocked_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockerId: varchar("blocker_id").notNull().references(() => users.id),
  blockedId: varchar("blocked_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type VendorDetails = typeof vendorDetails.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type BlockedUser = typeof blockedUsers.$inferSelect;
