import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthContext, type AuthContextValue } from "./AuthContext";
import RequireAuth from "./RequireAuth";

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }));

// Replace the router's Navigate with a stub that records where it was sent.
vi.mock("@tanstack/react-router", () => ({
  Navigate: (props: { to: string }) => {
    navigateSpy(props);
    return null;
  },
}));

function authValue(status: AuthContextValue["status"]): AuthContextValue {
  return {
    user: null,
    status,
    sessionMessage: null,
    login: async () => {},
    logout: async () => {},
    expireSession: () => {},
    clearSessionMessage: () => {},
  };
}

function renderGuard(status: AuthContextValue["status"]) {
  return render(
    <AuthContext.Provider value={authValue(status)}>
      <RequireAuth>
        <p>Secret dashboard</p>
      </RequireAuth>
    </AuthContext.Provider>,
  );
}

beforeEach(() => {
  navigateSpy.mockClear();
});

describe("RequireAuth", () => {
  it("shows a checking message while the session loads", () => {
    renderGuard("loading");
    expect(screen.getByText("Checking your session...")).toBeInTheDocument();
    expect(screen.queryByText("Secret dashboard")).not.toBeInTheDocument();
  });

  it("redirects anonymous users to /login and hides the content", () => {
    renderGuard("anonymous");
    expect(navigateSpy).toHaveBeenCalledWith({ to: "/login" });
    expect(screen.queryByText("Secret dashboard")).not.toBeInTheDocument();
  });

  it("shows the content for authenticated users", () => {
    renderGuard("authenticated");
    expect(screen.getByText("Secret dashboard")).toBeInTheDocument();
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});