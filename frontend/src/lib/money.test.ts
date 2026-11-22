
import { describe, it, expect } from "vitest";
import { formatINR } from "./money";

describe("formatINR", () => {
  it("formats an amount in Indian currency", () => {
    expect(formatINR(150000)).toBe("₹1,50,000.00");
  });

  it("formats zero correctly", () => {
    expect(formatINR(0)).toBe("₹0.00");
  });

  it("rejects invalid amounts", () => {
    expect(() => formatINR(Number.NaN)).toThrow(
      "Amount must be a valid number",
    );
  });
});
