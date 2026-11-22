import { describe, it, expect, vi, afterEach } from "vitest";
import { listBusinesses } from "./api";
import { SessionExpiredError } from "../auth/api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("business api credentials", () => {
  it("sends the session cookie on list requests", async () => {
    const fn = vi.fn((_url: string, _init?: RequestInit) =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) }),
    );
    vi.stubGlobal("fetch", fn);
    await listBusinesses();
    expect(fn.mock.calls[0][1]).toMatchObject({ credentials: "include" });
  });

  it("maps a 401 response to SessionExpiredError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, _init?: RequestInit) =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ detail: "Not authenticated" }),
        }),
      ),
    );
    await expect(listBusinesses()).rejects.toBeInstanceOf(SessionExpiredError);
  });
});