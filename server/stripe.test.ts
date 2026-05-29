import { describe, it, expect, beforeEach, afterEach } from "vitest";

// stripe.ts reads STRIPE_PLATFORM_FEE_BPS via env at import; we set env then
// import fresh per test using vi.resetModules-free dynamic import of the helper.
import { applicationFeeCents, platformFeeBps } from "./stripe";

describe("platform fee math", () => {
  // vitest.config.ts sets STRIPE_PLATFORM_FEE_BPS=500 for the test env
  it("defaults to exactly 5% (500 bps)", () => {
    expect(platformFeeBps()).toBe(500);
  });

  it("takes a concrete 5% cut of a $100 charge", () => {
    expect(applicationFeeCents(10000)).toBe(500); // 5% of 10000 cents
  });

  it("rounds the fee to the nearest cent", () => {
    expect(applicationFeeCents(199)).toBe(10); // 5% of 199 = 9.95 → 10
    expect(applicationFeeCents(150)).toBe(8);  // 5% of 150 = 7.5 → 8
  });

  it("never exceeds the charge amount for sane fees", () => {
    expect(applicationFeeCents(2000)).toBeLessThanOrEqual(2000);
  });

  it("returns 0 fee on a 0 charge", () => {
    expect(applicationFeeCents(0)).toBe(0);
  });
});
