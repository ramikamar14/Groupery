import { users, vendorDetails, notifications, blockedUsers, type User, type UpsertUser, type VendorDetails, type Notification } from "@shared/models/auth";
import { listings } from "@shared/schema";
import { db } from "../../db";
import { eq, and, desc, sql } from "drizzle-orm";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User | undefined>;
  
  // Vendor details
  createVendorDetails(details: any): Promise<VendorDetails>;
  getVendorDetails(userId: string): Promise<VendorDetails | undefined>;
  
  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: Omit<Notification, "id" | "createdAt" | "isRead">): Promise<Notification>;
  markNotificationRead(id: string, userId: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;
  
  // Blocking
  blockUser(blockerId: string, blockedId: string): Promise<void>;
  unblockUser(blockerId: string, blockedId: string): Promise<void>;
  isBlocked(blockerId: string, blockedId: string): Promise<boolean>;
  
  // Admin
  getUserByEmail(email: string): Promise<User | undefined>;
  getPendingVerifications(): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  getAdminStats(): Promise<any>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Vendor details
  async createVendorDetails(details: any): Promise<VendorDetails> {
    const [result] = await db.insert(vendorDetails).values(details).returning();
    return result;
  }

  async getVendorDetails(userId: string): Promise<VendorDetails | undefined> {
    const [result] = await db.select().from(vendorDetails).where(eq(vendorDetails.userId, userId));
    return result;
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: Omit<Notification, "id" | "createdAt" | "isRead">): Promise<Notification> {
    const [result] = await db.insert(notifications).values(notification).returning();
    return result;
  }

  async markNotificationRead(id: string, userId: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(
      and(eq(notifications.id, id), eq(notifications.userId, userId))
    );
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
  }

  // Blocking
  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    await db.insert(blockedUsers).values({ blockerId, blockedId });
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    await db.delete(blockedUsers).where(
      and(eq(blockedUsers.blockerId, blockerId), eq(blockedUsers.blockedId, blockedId))
    );
  }

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const [result] = await db.select().from(blockedUsers).where(
      and(eq(blockedUsers.blockerId, blockerId), eq(blockedUsers.blockedId, blockedId))
    );
    return !!result;
  }

  // Admin
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getPendingVerifications(): Promise<User[]> {
    return db.select().from(users)
      .where(eq(users.verificationStatus, "pending"))
      .orderBy(desc(users.createdAt));
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAdminStats(): Promise<any> {
    const [userCountResult] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [listingCountResult] = await db.select({ count: sql<number>`count(*)` }).from(listings).where(eq(listings.status, "active"));
    
    return {
      totalUsers: Number(userCountResult.count),
      activeListings: Number(listingCountResult.count),
    };
  }
}

export const authStorage = new AuthStorage();
