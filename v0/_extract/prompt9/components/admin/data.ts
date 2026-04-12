// Mock data for the Admin Dashboard

export const mockVerifications = [
  { id: "v1", name: "Ahmed Benali", type: "individual", email: "ahmed@email.com", initials: "AB", idDoc: "#", selfie: "#" },
  { id: "v2", name: "Sara Nouri", type: "business", email: "sara.nouri@company.com", initials: "SN", idDoc: "#", selfie: "#" },
  { id: "v3", name: "Karim Ouzzani", type: "individual", email: "karim.o@mail.com", initials: "KO", idDoc: "#", selfie: "#" },
];

export const mockReports = [
  {
    id: "r1",
    type: "listing",
    category: "fraud",
    date: "2024-07-10",
    reporter: { name: "Leila Mansouri", email: "leila@email.com" },
    reported: { name: "Fake Seller Co.", email: "fake@scam.com" },
    listing: "iPhone 15 Pro – Group Buy",
  },
  {
    id: "r2",
    type: "user",
    category: "harassment",
    date: "2024-07-09",
    reporter: { name: "Omar Tazi", email: "omar@email.com" },
    reported: { name: "Bad Actor", email: "bad@user.com" },
    listing: null,
  },
  {
    id: "r3",
    type: "listing",
    category: "spam",
    date: "2024-07-08",
    reporter: { name: "Nadia Khalil", email: "nadia@email.com" },
    reported: { name: "Spam Store", email: "spam@store.com" },
    listing: "Nike Shoes Bulk Deal",
  },
  {
    id: "r4",
    type: "user",
    category: "fake",
    date: "2024-07-07",
    reporter: { name: "Youssef El-Amin", email: "youssef@email.com" },
    reported: { name: "Ghost Account", email: "ghost@fake.com" },
    listing: null,
  },
  {
    id: "r5",
    type: "listing",
    category: "other",
    date: "2024-07-06",
    reporter: { name: "Amira Bouzid", email: "amira@email.com" },
    reported: { name: "Unknown Seller", email: "unknown@seller.com" },
    listing: "Samsung Bundle",
  },
];

export const mockFlagged = [
  {
    id: "f1",
    name: "SuspiciousUser99",
    email: "sus@user.com",
    initials: "SU",
    reason: "Multiple failed payment attempts and rapid listing creation in 24h window.",
    flaggedAt: "2024-07-10 14:32",
    riskScore: 87,
  },
  {
    id: "f2",
    name: "BulkBuyer2024",
    email: "bulk@buyer.com",
    initials: "BB",
    reason: "Repeated chargebacks and account age mismatch.",
    flaggedAt: "2024-07-09 09:15",
    riskScore: 72,
  },
];

export const mockHealthMetrics = {
  db: { status: "healthy", latency: "12ms", connections: 48 },
  server: { status: "healthy", uptime: "14d 6h 22m", cpu: "34%", memory: "61%" },
  api: { status: "healthy", avgResponse: "98ms", errorRate: "0.3%" },
  queue: { status: "degraded", pending: 142, failed: 7 },
};

export const mockSystemEvents = [
  { id: "e1", type: "verification_changed", actor: "admin@grouperry.com", target: "Ahmed Benali", detail: "Status → approved", at: "2024-07-10 15:00" },
  { id: "e2", type: "user_banned", actor: "admin@grouperry.com", target: "BulkBuyer2024", detail: "Reason: chargebacks", at: "2024-07-10 14:45" },
  { id: "e3", type: "feature_flag_updated", actor: "dev@grouperry.com", target: "ai_analytics", detail: "Enabled → true", at: "2024-07-10 13:30" },
  { id: "e4", type: "report_resolved", actor: "mod@grouperry.com", target: "Report #r2", detail: "Marked resolved", at: "2024-07-10 12:00" },
  { id: "e5", type: "listing_deleted", actor: "admin@grouperry.com", target: "Fake iPhone Listing", detail: "Removed by admin", at: "2024-07-10 11:10" },
  { id: "e6", type: "verification_changed", actor: "admin@grouperry.com", target: "Sara Nouri", detail: "Status → rejected", at: "2024-07-09 17:22" },
  { id: "e7", type: "settings_updated", actor: "admin@grouperry.com", target: "site_settings", detail: "max_group_size → 500", at: "2024-07-09 16:00" },
  { id: "e8", type: "user_banned", actor: "mod@grouperry.com", target: "SuspiciousUser99", detail: "Reason: fraud signals", at: "2024-07-09 10:30" },
];

export const mockFeatureFlags = [
  { id: "ff1", name: "ai_analytics", description: "Enable AI-powered platform analytics tab.", enabled: true },
  { id: "ff2", name: "id_verification", description: "Require ID verification for new organisers.", enabled: true },
  { id: "ff3", name: "group_payments_v2", description: "New payment flow with escrow support.", enabled: false },
  { id: "ff4", name: "referral_program", description: "Enable referral bonuses for new user signups.", enabled: false },
  { id: "ff5", name: "dark_mode_public", description: "Show dark mode toggle to all users.", enabled: true },
  { id: "ff6", name: "bulk_export", description: "Allow admins to export data as CSV.", enabled: false },
];

export const mockEditHistory = [
  { id: "eh1", listing: "iPhone 15 Pro Group Buy", field: "price", before: "£950", after: "£920", editor: "organiser@email.com", at: "2024-07-10 10:15" },
  { id: "eh2", listing: "Nike Shoes Bulk Deal", field: "description", before: "Old desc…", after: "Updated desc…", editor: "seller@store.com", at: "2024-07-09 16:40" },
  { id: "eh3", listing: "Samsung Bundle", field: "max_participants", before: "50", after: "100", editor: "samsung@seller.com", at: "2024-07-08 09:00" },
  { id: "eh4", listing: "AirPods Group Order", field: "deadline", before: "2024-08-01", after: "2024-08-15", editor: "organiser2@email.com", at: "2024-07-07 14:55" },
];

export const mockUsers = [
  { id: "u1", name: "Ahmed Benali", email: "ahmed@email.com", type: "organiser", verified: true, disabled: false, initials: "AB" },
  { id: "u2", name: "Sara Nouri", email: "sara@company.com", type: "member", verified: true, disabled: false, initials: "SN" },
  { id: "u3", name: "Karim Ouzzani", email: "karim.o@mail.com", type: "member", verified: false, disabled: false, initials: "KO" },
  { id: "u4", name: "BulkBuyer2024", email: "bulk@buyer.com", type: "member", verified: false, disabled: true, initials: "BB" },
  { id: "u5", name: "Leila Mansouri", email: "leila@email.com", type: "organiser", verified: true, disabled: false, initials: "LM" },
  { id: "u6", name: "Omar Tazi", email: "omar@email.com", type: "member", verified: true, disabled: false, initials: "OT" },
  { id: "u7", name: "Nadia Khalil", email: "nadia@email.com", type: "organiser", verified: true, disabled: false, initials: "NK" },
  { id: "u8", name: "SuspiciousUser99", email: "sus@user.com", type: "member", verified: false, disabled: true, initials: "SU" },
];

export const mockOrders = [
  { id: "o1", listing: "iPhone 15 Pro Group Buy", buyer: "Omar Tazi", amount: "£920", date: "2024-07-10", status: "pending" },
  { id: "o2", listing: "Nike Shoes Bulk Deal", buyer: "Leila Mansouri", amount: "£145", date: "2024-07-09", status: "pending" },
  { id: "o3", listing: "Samsung Bundle", buyer: "Karim Ouzzani", amount: "£620", date: "2024-07-08", status: "pending" },
];

export const mockSettings = [
  { key: "max_group_size", value: "500", description: "Maximum participants per group buy" },
  { key: "platform_fee_pct", value: "2.5", description: "Platform fee percentage on transactions" },
  { key: "verification_required", value: "true", description: "Require verification for organisers" },
  { key: "support_email", value: "support@grouperry.com", description: "Platform support email address" },
  { key: "min_fill_rate", value: "60", description: "Minimum fill rate % to proceed to payment" },
];

export const mockPlatformStats = {
  totalUsers: 1247,
  activeListings: 89,
  pendingVerifications: 3,
  openReports: 5,
  totalRevenue: "£48,320",
  avgFillRate: "74%",
};
