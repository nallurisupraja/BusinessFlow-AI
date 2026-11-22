import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

const user = {
  id: "1",
  full_name: "Asha Rao",
  email: "asha@example.com",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
};

// Shows the auth state and offers a logout button.
function Probe() {
  const { status, user: current, logout } = useAuth();
  return (
    <div>
      <p>status: {status}</p>
      <p>name: {current?.full_name ?? "none"}</p>
      <button type="button" onClick={() => void logout()}>
        Log out
      </button>
    </div>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("AuthContext", () => {
  it("throws when useAuth is used outside AuthProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow("useAuth must be used inside AuthProvider");
  });

  it("is anonymous when /auth/me returns 401", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, _init?: RequestInit) =>
        Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({}) }),
      ),
    );
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    expect(await screen.findByText("status: anonymous")).toBeInTheDocument();
  });

  it("restores the logged-in user from /auth/me on load", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, _init?: RequestInit) =>
        Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(user) }),
      ),
    );
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    expect(await screen.findByText("status: authenticated")).toBeInTheDocument();
    expect(screen.getByText("name: Asha Rao")).toBeInTheDocument();
  });

  it("logout clears the user and sets anonymous", async () => {
    let calls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, _init?: RequestInit) => {
        calls += 1;
        const isMeCall = calls === 1;
        return Promise.resolve({
          ok: true,
          status: isMeCall ? 200 : 204,
          json: () => Promise.resolve(isMeCall ? user : {}),
        });
      }),
    );
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    expect(await screen.findByText("status: authenticated")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    expect(await screen.findByText("status: anonymous")).toBeInTheDocument();
    expect(screen.getByText("name: none")).toBeInTheDocument();
  });
});