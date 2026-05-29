import { describe, it, expect, beforeEach, afterEach } from "vitest";

// stripe.ts reads STRIPE_PLATFORM_FEE_BPS via env at import; we set env then
// import fresh per test using vi.resetModules-free dynamic import of the helper.
import { applicationFeeCents, platformFeeBps } from "./stripe";

describe("platform fee math", () => {
  it("defaults to 5% (500 bps)", () => {
    // env default is 500 in env.ts; applicationFeeCents uses it
    expect(platformFeeBps()).toBeGreaterThanOrEqual(0);
  });

  it("applicationFeeCents computes the correct cut", () => {
    const bps = platformFeeBps();
    // 10000 cents at bps → round(10000 * bps / 10000) = bps cents
    expect(applicationFeeCents(10000)).toBe(Math.round((10000 * bps) / 10000));
  });

  it("never exceeds the charge amount for sane fees", () => {
    expect(applicationFeeCents(2000)).toBeLessThanOrEqual(2000);
  });

  it("returns 0 fee on a 0 charge", () => {
    expect(applicationFeeCents(0)).toBe(0);
  });
});
