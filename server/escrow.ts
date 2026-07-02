/**
 * Escrow.com sandbox API client.
 * Uses API key from ESCROW_API_KEY env var — never hardcoded.
 * Sandbox base: https://api.escrow-sandbox.com/2017-09-01/
 */
import { env } from "./env";

const ESCROW_BASE = process.env.ESCROW_API_BASE || "https://api.escrow-sandbox.com/2017-09-01";

/**
 * Fail closed in production: a sandbox base URL means escrow transactions would
 * be fake — no real buyer protection. Pure function so it's unit-testable.
 */
export function isEscrowBaseUnsafeForEnv(base: string, nodeEnv: string | undefined): boolean {
  return nodeEnv === "production" && base.includes("sandbox");
}

const ESCROW_DISABLED_UNSAFE_BASE = isEscrowBaseUnsafeForEnv(ESCROW_BASE, process.env.NODE_ENV);
if (ESCROW_DISABLED_UNSAFE_BASE) {
  // Prominent one-time warning at module load — escrow creation will throw.
  console.error(
    "[escrow] *** WARNING: NODE_ENV is 'production' but the escrow API base points at the sandbox " +
    `(${ESCROW_BASE}). Set ESCROW_API_BASE to the live Escrow.com endpoint. ` +
    "Escrow transaction creation is DISABLED until this is fixed. ***"
  );
}

function assertEscrowUsableForEnv(): void {
  if (ESCROW_DISABLED_UNSAFE_BASE) {
    throw new Error("Escrow disabled: ESCROW_API_BASE not configured for production");
  }
}

function authHeader(): string {
  const key = env.ESCROW_API_KEY;
  if (!key) throw new Error("ESCROW_API_KEY is not configured");
  const encoded = Buffer.from(`apikey:${key}`).toString("base64");
  return `Basic ${encoded}`;
}

async function escrowFetch(path: string, options: RequestInit = {}) {
  const url = `${ESCROW_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  let body: any;
  try { body = JSON.parse(text); } catch { body = { raw: text }; }
  if (!res.ok) {
    throw new Error(`Escrow API ${res.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

export interface EscrowParty {
  customer: string; // email
  role: "buyer" | "seller" | "broker";
  agreed?: boolean;
}

export interface CreateTransactionOptions {
  /** Buyer's email */
  buyerEmail: string;
  /** Seller's email */
  sellerEmail: string;
  /** Human-readable description */
  description: string;
  /** Amount in USD (dollars, not cents) */
  amountUsd: number;
  /** Internal reference so we can correlate */
  reference?: string;
}

export interface EscrowTransaction {
  id: string;
  status: string;
  amount: number;
  currency: string;
  description: string;
}

/**
 * Create a new escrow transaction.
 * Returns the transaction object from the API.
 */
export async function createEscrowTransaction(opts: CreateTransactionOptions): Promise<EscrowTransaction> {
  assertEscrowUsableForEnv();
  const body = {
    currency: "usd",
    description: opts.description,
    items: [
      {
        title: opts.description,
        description: opts.description,
        type: "general_merchandise",
        quantity: 1,
        unit_price: opts.amountUsd,
        inspection_period: 3,
        who_gets_paid: "seller",
        schedule: [
          {
            amount: opts.amountUsd,
            payer_customer: "me",
            beneficiary_customer: opts.sellerEmail,
          },
        ],
      },
    ],
    parties: [
      { customer: "me", role: "broker", agreed: true },
      { customer: opts.buyerEmail, role: "buyer" },
      { customer: opts.sellerEmail, role: "seller" },
    ],
    ...(opts.reference ? { reference: opts.reference } : {}),
  };

  const result = await escrowFetch("/transaction", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return {
    id: String(result.id),
    status: result.status ?? "created",
    amount: opts.amountUsd,
    currency: "usd",
    description: opts.description,
  };
}

/**
 * Fetch current status of an escrow transaction.
 */
export async function getEscrowTransaction(transactionId: string): Promise<EscrowTransaction> {
  const result = await escrowFetch(`/transaction/${transactionId}`);
  return {
    id: String(result.id),
    status: result.status ?? "unknown",
    amount: result.amount ?? 0,
    currency: result.currency ?? "usd",
    description: result.description ?? "",
  };
}

/**
 * Mark buyer's action as agreed (fund the escrow).
 */
export async function agreeToEscrowTransaction(transactionId: string, buyerEmail: string): Promise<void> {
  await escrowFetch(`/transaction/${transactionId}`, {
    method: "PATCH",
    body: JSON.stringify({
      action: "agree",
      by_customer: buyerEmail,
    }),
  });
}

/**
 * Release funds to the seller (after buyer receives goods).
 */
export async function releaseEscrow(transactionId: string, buyerEmail: string): Promise<void> {
  await escrowFetch(`/transaction/${transactionId}`, {
    method: "PATCH",
    body: JSON.stringify({
      action: "receive",
      by_customer: buyerEmail,
    }),
  });
}

/**
 * Cancel/refund an escrow transaction.
 */
export async function cancelEscrow(transactionId: string): Promise<void> {
  await escrowFetch(`/transaction/${transactionId}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "cancel" }),
  });
}

export function isEscrowConfigured(): boolean {
  return Boolean(env.ESCROW_API_KEY);
}
