
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { HealthStatus } from "./HealthStatus";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("HealthStatus", () => {
  it("displays healthy backend status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: "ok",
          database: "connected",
        }),
      }),
    );

    render(<HealthStatus />);

    expect(await screen.findByText("Backend: ok")).toBeTruthy();
    expect(screen.getByText("Database: connected")).toBeTruthy();
  });

  it("displays an error when the backend is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );

    render(<HealthStatus />);

    expect(
      await screen.findByText("Unable to connect to the backend."),
    ).toBeTruthy();
  });

  it("calls the backend on port 8000", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ status: "ok", database: "ok" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<HealthStatus />);

    expect(await screen.findByText(/Backend: ok/)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/health",
    );
  });

});
