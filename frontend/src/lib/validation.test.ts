
import { describe, it, expect } from "vitest";
import {
  businessNameSchema,
  positiveAmountSchema,
} from "./validation";

describe("businessNameSchema", () => {
  it("accepts a valid business name", () => {
    expect(businessNameSchema.safeParse("My Restaurant").success).toBe(true);
  });

  it("rejects an empty business name", () => {
    expect(businessNameSchema.safeParse("").success).toBe(false);
  });
});

describe("positiveAmountSchema", () => {
  it("accepts a positive amount", () => {
    expect(positiveAmountSchema.safeParse(1500).success).toBe(true);
  });

  it("rejects zero and negative amounts", () => {
    expect(positiveAmountSchema.safeParse(0).success).toBe(false);
    expect(positiveAmountSchema.safeParse(-100).success).toBe(false);
  });
});
