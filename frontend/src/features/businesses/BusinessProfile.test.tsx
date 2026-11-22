import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BusinessProfile } from "./BusinessProfile";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const sampleBusiness = {
  id: "1",
  name: "Spice Corner",
  business_type: "restaurant",
  owner_name: "Asha Rao",
  email: "asha@example.com",
  phone: "9876543210",
  country: "India",
  state: "Karnataka",
  city: "Bengaluru",
  address: null,
  pin_code: null,
  gstin: null,
  website: null,
  description: null,
  currency_code: "INR",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

describe("BusinessProfile", () => {
  it("shows the business name and city after loading", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(sampleBusiness), { status: 200 })));

    render(<BusinessProfile businessId="1" />);

    expect(await screen.findByText("Spice Corner")).toBeTruthy();
    expect(screen.getByText("Bengaluru")).toBeTruthy();
  });

  it("opens the edit form when Edit Business is clicked", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(sampleBusiness), { status: 200 })));

    render(<BusinessProfile businessId="1" />);
    fireEvent.click(await screen.findByRole("button", { name: "Edit Business" }));

    expect(screen.getByLabelText("Business name")).toBeTruthy();
  });
});
