import { describe, it, expect } from "vitest";
import { listingMatchesStatusFilter, getCardDisplayStatus, getNextAction } from "./group-utils";

describe("listingMatchesStatusFilter", () => {
  it("matches everything for 'all'", () => {
    expect(listingMatchesStatusFilter({ status: "active" }, "all")).toBe(true);
    expect(listingMatchesStatusFilter({ status: "cancelled" }, "all")).toBe(true);
  });

  it("treats cancelled as expired", () => {
    expect(listingMatchesStatusFilter({ status: "cancelled" }, "expired")).toBe(true);
    expect(listingMatchesStatusFilter({ status: "expired" }, "expired")).toBe(true);
    expect(listingMatchesStatusFilter({ status: "active" }, "expired")).toBe(false);
  });

  it("matches exact status otherwise", () => {
    expect(listingMatchesStatusFilter({ status: "completed" }, "completed")).toBe(true);
    expect(listingMatchesStatusFilter({ status: "active" }, "completed")).toBe(false);
  });
});

describe("getCardDisplayStatus", () => {
  it("maps known statuses", () => {
    expect(getCardDisplayStatus({ status: "cancelled" })).toBe("cancelled");
    expect(getCardDisplayStatus({ status: "completed" })).toBe("completed");
    expect(getCardDisplayStatus({ status: "expired" })).toBe("expired");
  });
  it("defaults to active for unknown/missing", () => {
    expect(getCardDisplayStatus({})).toBe("active");
    expect(getCardDisplayStatus({ status: "weird" })).toBe("active");
  });
});

describe("getNextAction", () => {
  const full = { filledSlots: 5, totalSlots: 5 };
  const partial = { filledSlots: 2, totalSlots: 5 };

  it("organizer of a full active group should collect payments", () => {
    expect(getNextAction({ ...full, status: "active" }, "created", true)?.key).toBe("collectPayments");
  });

  it("organizer of a partial active group should share to fill", () => {
    expect(getNextAction({ ...partial, status: "active" }, "created", true)?.key).toBe("shareToFill");
  });

  it("organizer of a completed group should mark deliveries", () => {
    expect(getNextAction({ ...full, status: "completed" }, "created", true)?.key).toBe("markDeliveries");
  });

  it("member with a payment method should send payment", () => {
    expect(getNextAction({ ...full, status: "active", paymentMethod: "venmo" }, "joined", false)?.key).toBe("sendPayment");
  });

  it("member of a completed group should leave a review", () => {
    expect(getNextAction({ ...full, status: "completed" }, "joined", false)?.key).toBe("leaveReview");
  });

  it("returns null for cancelled groups", () => {
    expect(getNextAction({ ...full, status: "cancelled" }, "joined", false)).toBeNull();
  });
});
