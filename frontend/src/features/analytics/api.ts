
import { API_BASE_URL } from "../health/api";
import { SessionExpiredError } from "../auth/api";
import type { AnalyticsSummary, AnalyticsFilters } from "./types";

const ANALYTICS_URL = `${API_BASE_URL}/api/v1/analytics`;

async function readJson<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    throw new SessionExpiredError();
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const body = (await response.json()) as { detail?: unknown };

      if (typeof body.detail === "string") {
        message = body.detail;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function getAnalyticsSummary(
  filters: AnalyticsFilters = {},
): Promise<AnalyticsSummary> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, value);
    }
  });

  const query = params.toString();
  const url = query
    ? `${ANALYTICS_URL}?${query}`
    : ANALYTICS_URL;

  const response = await fetch(url, {
    credentials: "include",
  });

  return readJson<AnalyticsSummary>(response);
}
