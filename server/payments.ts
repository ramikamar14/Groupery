/**
 * Orchestrates charge-on-completion for the marketplace.
 *
 * When a listing reaches "completed", every committed order that has a saved
 * payment method is charged off-session, funds are split to the organizer's
 * Stripe Connect account, and the platform keeps its fee. All failures are
 * non-fatal and logged — the existing escrow / manual flow is unaffected.
 */
import { storage } from "./storage";
import { authStorage } from "./replit_integrations/auth/storage";
import { isStripeConfigured, chargeOnCompletion, refundPaymentIntent } from "./stripe";
import { logger } from "./logger";

/**
 * Charge all eligible orders for a completed listing. Safe to call multiple
 * times — already-paid orders are skipped and Stripe is idempotent per order.
 */
export async function chargeCompletedListing(listingId: number): Promise<void> {
  if (!isStripeConfigured()) return;

  const listing = await storage.getListing(listingId);
  if (!listing || listing.status !== "completed") return;
  if (!listing.pricePerSlot || listing.pricePerSlot <= 0) return;

  const organizer = await authStorage.getUser(listing.creatorId);
  if (!organizer?.stripeAccountId || !organizer.stripePayoutsEnabled) {
    logger.warn("payments", `listing ${listingId}: organizer not payout-ready, skipping charges`);
    return;
  }

  const orders = await storage.getOrdersByListing(listingId);
  for (const order of orders) {
    if (order.chargeStatus === "paid" || order.chargeStatus === "refunded") continue;
    if (!order.stripePaymentMethodId) continue;

    const buyer = await authStorage.getUser(order.userId);
    if (!buyer?.stripeCustomerId) continue;

    try {
      const { paymentIntentId, status } = await chargeOnCompletion({
        customerId: buyer.stripeCustomerId,
        paymentMethodId: order.stripePaymentMethodId,
        amountCents: order.amountCents ?? listing.pricePerSlot,
        destinationAccountId: organizer.stripeAccountId,
        description: `Groupery: ${listing.title}`,
        idempotencyKey: `charge-order-${order.id}`,
        metadata: { listingId: String(listingId), orderId: String(order.id), userId: order.userId },
      });
      await storage.updateOrder(order.id, {
        stripePaymentIntentId: paymentIntentId,
        chargeStatus: status === "succeeded" ? "paid" : status,
        paidAt: status === "succeeded" ? new Date() : null,
        status: status === "succeeded" ? "confirmed" : order.status,
      });
      logger.info("payments", `charged order ${order.id} (${status})`);
    } catch (err: any) {
      await storage.updateOrder(order.id, { chargeStatus: "failed" });
      logger.error("payments", `charge failed for order ${order.id}: ${err?.message ?? err}`);
    }
  }
}

/** Refund a single paid order (used by dispute / refund flow). */
export async function refundOrder(orderId: number): Promise<{ ok: boolean; message: string }> {
  if (!isStripeConfigured()) return { ok: false, message: "Stripe not configured" };
  const order = await storage.getOrderById(orderId);
  if (!order) return { ok: false, message: "Order not found" };
  if (!order.stripePaymentIntentId || order.chargeStatus !== "paid") {
    return { ok: false, message: "Order has no captured payment to refund" };
  }
  try {
    await refundPaymentIntent(order.stripePaymentIntentId);
    await storage.updateOrder(orderId, { chargeStatus: "refunded", status: "refunded" });
    return { ok: true, message: "Refunded" };
  } catch (err: any) {
    return { ok: false, message: err?.message ?? "Refund failed" };
  }
}

/** Fire-and-forget wrapper: trigger charging without blocking the request. */
export function triggerChargeCompletedListing(listingId: number): void {
  if (!isStripeConfigured()) return;
  chargeCompletedListing(listingId).catch((err) =>
    logger.error("payments", `chargeCompletedListing(${listingId}) failed: ${err?.message ?? err}`),
  );
}
