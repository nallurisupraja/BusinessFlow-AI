import { describe, it, expect, vi, afterEach } from "vitest";
import { getCurrentUser, loginUser, logoutUser } from "./api";

const user = {
  id: "1",
  full_name: "Asha Rao",
  email: "asha@example.com",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
};

function stubFetch(status: number, body: unknown = {}) {
  const fn = vi.fn((_url: string, _init?: RequestInit) =>
    Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) }),
  );
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("auth api", () => {
  it("loginUser throws the invalid-credentials message on 401", async () => {
    stubFetch(401, { detail: "Invalid email or password." });
    await expect(loginUser("a@b.com", "wrong")).rejects.toThrow("Invalid email or password.");
  });

  it("loginUser sends the cookie with credentials include", async () => {
    const fn = stubFetch(200, user);
    await loginUser("asha@example.com", "Strong123");
    expect(fn.mock.calls[0][1]).toMatchObject({ method: "POST", credentials: "include" });
  });

  it("getCurrentUser returns null when logged out (401)", async () => {
    stubFetch(401, {});
    expect(await getCurrentUser()).toBeNull();
  });

  it("getCurrentUser returns the user on 200", async () => {
    stubFetch(200, user);
    expect((await getCurrentUser())?.full_name).toBe("Asha Rao");
  });

  it("logoutUser does not throw when the network fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, _init?: RequestInit) => Promise.reject(new Error("offline"))),
    );
    await expect(logoutUser()).resolves.toBeUndefined();
  });
});