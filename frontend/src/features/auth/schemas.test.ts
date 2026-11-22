import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "./schemas";

const valid = {
  full_name: "Asha Rao",
  email: "asha@example.com",
  password: "Strong123",
  confirm_password: "Strong123",
};

describe("registerSchema", () => {
  it("accepts a valid registration", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ ...valid, confirm_password: "Other1234" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Passwords do not match");
  });

  it("rejects a password without a number", () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: "onlyletters",
      confirm_password: "onlyletters",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({ ...valid, password: "short1", confirm_password: "short1" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(registerSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "asha@example.com", password: "" }).success).toBe(false);
  });

  it("accepts an email and password", () => {
    expect(loginSchema.safeParse({ email: "asha@example.com", password: "x" }).success).toBe(true);
  });
});