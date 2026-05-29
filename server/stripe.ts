/**
 * Stripe payments for the group-buy marketplace.
 *
 * Model: buyers save a card when they commit; they are only charged after the
 * deal completes. Organizers are Stripe Connect (Express) accounts that receive
 * payouts minus the platform fee.
 *
 * Everything here is gated behind `isStripeConfigured()` — if STRIPE_SECRET_KEY
 * is unset the module is dormant and the app falls back to the existing
 * escrow / manual-payment flow. Keys come from env vars, never hardcoded.
 */
import Stripe from "stripe";
import { env } from "./env";

let client: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return !!env.STRIPE_SECRET_KEY;
}

function stripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not configured");
  if (!client) {
    client = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2025-01-27.acacia" as any });
  }
  return client;
}

export function platformFeeBps(): number {
  const n = parseInt(env.STRIPE_PLATFORM_FEE_BPS ?? "500", 10);
  return Number.isFinite(n) && n >= 0 && n <= 10000 ? n : 500;
}

/** Compute the platform's application fee (in cents) for a given charge. */
export function applicationFeeCents(amountCents: number): number {
  return Math.round((amountCents * platformFeeBps()) / 10000);
}

/* ── Customers (buyers) ──────────────────────────────────────────────────── */

export async function ensureCustomer(opts: {
  existingCustomerId?: string | null;
  email?: string | null;
  name?: string | null;
  userId: string;
}): Promise<string> {
  if (opts.existingCustomerId) return opts.existingCustomerId;
  const customer = await stripe().customers.create({
    email: opts.email ?? undefined,
    name: opts.name ?? undefined,
    metadata: { grouperyUserId: opts.userId },
  });
  return customer.id;
}

/**
 * Create a SetupIntent so the buyer can save a card now and be charged later
 * (off-session) when the deal completes.
 */
export async function createSetupIntent(customerId: string): Promise<{ clientSecret: string; setupIntentId: string }> {
  const si = await stripe().setupIntents.create({
    customer: customerId,
    usage: "off_session",
    payment_method_types: ["card"],
  });
  return { clientSecret: si.client_secret!, setupIntentId: si.id };
}

/** The default (most recently saved) card payment method for a customer, if any. */
export async function getDefaultPaymentMethod(customerId: string): Promise<string | null> {
  const methods = await stripe().paymentMethods.list({ customer: customerId, type: "card", limit: 1 });
  return methods.data[0]?.id ?? null;
}

/* ── Connect (organizer payouts) ─────────────────────────────────────────── */

export async function ensureConnectAccount(opts: {
  existingAccountId?: string | null;
  email?: string | null;
  country?: string | null;
  userId: string;
}): Promise<string> {
  if (opts.existingAccountId) return opts.existingAccountId;
  const account = await stripe().accounts.create({
    type: "express",
    email: opts.email ?? undefined,
    country: opts.country || undefined,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: { grouperyUserId: opts.userId },
  });
  return account.id;
}

export async function createConnectOnboardingLink(accountId: string, returnUrl: string, refreshUrl: string): Promise<string> {
  const link = await stripe().accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    return_url: returnUrl,
    refresh_url: refreshUrl,
  });
  return link.url;
}

export async function getConnectAccount(accountId: string): Promise<{ payoutsEnabled: boolean; detailsSubmitted: boolean }> {
  const acct = await stripe().accounts.retrieve(accountId);
  return { payoutsEnabled: !!acct.payouts_enabled, detailsSubmitted: !!acct.details_submitted };
}

/* ── Charging on completion ──────────────────────────────────────────────── */

/**
 * Charge the buyer's saved card off-session and split funds to the organizer's
 * connected account, keeping the platform fee. Idempotent via `idempotencyKey`.
 */
export async function chargeOnCompletion(opts: {
  customerId: string;
  paymentMethodId: string;
  amountCents: number;
  destinationAccountId: string;
  description: string;
  idempotencyKey: string;
  metadata?: Record<string, string>;
}): Promise<{ paymentIntentId: string; status: string }> {
  const pi = await stripe().paymentIntents.create(
    {
      amount: opts.amountCents,
      currency: "usd",
      customer: opts.customerId,
      payment_method: opts.paymentMethodId,
      off_session: true,
      confirm: true,
      description: opts.description,
      application_fee_amount: applicationFeeCents(opts.amountCents),
      transfer_data: { destination: opts.destinationAccountId },
      metadata: opts.metadata,
    },
    { idempotencyKey: opts.idempotencyKey },
  );
  return { paymentIntentId: pi.id, status: pi.status };
}

export async function refundPaymentIntent(paymentIntentId: string): Promise<{ refundId: string; status: string }> {
  const refund = await stripe().refunds.create({
    payment_intent: paymentIntentId,
    reverse_transfer: true,
    refund_application_fee: true,
  });
  return { refundId: refund.id, status: refund.status ?? "unknown" };
}

/* ── Webhooks ────────────────────────────────────────────────────────────── */

export function constructWebhookEvent(payload: Buffer | string, signature: string): Stripe.Event {
  if (!env.STRIPE_WEBHOOK_SECRET) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  return stripe().webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
}
