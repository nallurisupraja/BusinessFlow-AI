import { describe, expect, it } from "vitest";
import { businessFormSchema, type BusinessFormValues } from "./schema";

const validValues: BusinessFormValues = {
  name: "Spice Corner",
  business_type: "restaurant",
  owner_name: "Asha Rao",
  email: "asha@example.com",
  phone: "9876543210",
  country: "India",
  state: "Karnataka",
  city: "Bengaluru",
  address: "MG Road",
  pin_code: "560001",
  gstin: "27AAPFU0939F1ZV",
  website: "https://example.com",
  description: "Family restaurant",
};

const minimalValues: BusinessFormValues = {
  name: "Spice Corner",
  business_type: "other",
  owner_name: "Asha Rao",
  email: "asha@example.com",
  phone: "+91 98765-43210",
  country: "India",
  state: "Karnataka",
  city: "Bengaluru",
  address: "",
  pin_code: "",
  gstin: "",
  website: "",
  description: "",
};

describe("businessFormSchema", () => {
  it("accepts a fully valid payload", () => {
    expect(businessFormSchema.safeParse(validValues).success).toBe(true);
  });

  it("accepts a minimal payload with only required fields", () => {
    expect(businessFormSchema.safeParse(minimalValues).success).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(businessFormSchema.safeParse({ ...validValues, name: "" }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(businessFormSchema.safeParse({ ...validValues, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects a phone number that is too short", () => {
    expect(businessFormSchema.safeParse({ ...validValues, phone: "12345" }).success).toBe(false);
  });

  it("rejects a PIN code with five digits", () => {
    expect(businessFormSchema.safeParse({ ...validValues, pin_code: "12345" }).success).toBe(false);
  });

  it("rejects an invalid GSTIN", () => {
    expect(businessFormSchema.safeParse({ ...validValues, gstin: "ABC" }).success).toBe(false);
  });

  it("rejects a website without http or https", () => {
    expect(businessFormSchema.safeParse({ ...validValues, website: "example.com" }).success).toBe(false);
  });
});
