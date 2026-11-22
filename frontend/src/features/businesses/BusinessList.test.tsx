import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import BusinessList from "./BusinessList";

// Router-free stand-in for TanStack's Link, so the list renders without a router.
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, params, children, className }: { to: string; params?: Record<string, string>; children: ReactNode; className?: string }) => (
    <a href={to.replace("$businessId", params?.businessId ?? "")} className={className}>
      {children}
    </a>
  ),
}));

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

describe("BusinessList", () => {
  it("shows the empty message when there are no businesses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("[]", { status: 200 })));

    render(<BusinessList />);

    expect(await screen.findByText("No businesses yet. Add your first business.")).toBeTruthy();
  });

  it("shows business names when businesses are returned", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify([sampleBusiness]), { status: 200 })));

    render(<BusinessList />);

    expect(await screen.findByText("Spice Corner")).toBeTruthy();
  });
});
