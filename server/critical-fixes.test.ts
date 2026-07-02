import { describe, it, expect } from "vitest";
import { isEscrowBaseUnsafeForEnv } from "./escrow";

// Regression guard for C2: production must never run escrow against the sandbox.
describe("isEscrowBaseUnsafeForEnv (C2 fail-closed)", () => {
  it("flags sandbox base in production as unsafe", () => {
    expect(
      isEscrowBaseUnsafeForEnv("https://api.escrow-sandbox.com/2017-09-01", "production"),
    ).toBe(true);
  });

  it("allows a live base in production", () => {
    expect(
      isEscrowBaseUnsafeForEnv("https://api.escrow.com/2017-09-01", "production"),
    ).toBe(false);
  });

  it("allows sandbox base outside production (dev/test)", () => {
    expect(
      isEscrowBaseUnsafeForEnv("https://api.escrow-sandbox.com/2017-09-01", "development"),
    ).toBe(false);
    expect(
      isEscrowBaseUnsafeForEnv("https://api.escrow-sandbox.com/2017-09-01", undefined),
    ).toBe(false);
  });
});
