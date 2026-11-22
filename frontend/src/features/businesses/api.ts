import { API_BASE_URL } from "../health/api";
import { SessionExpiredError } from "../auth/api";
import type { BusinessFormValues } from "./schema";
import type { Business } from "./types";

const BUSINESSES_URL = `${API_BASE_URL}/api/v1/businesses`;
const OPTIONAL_KEYS = ["address", "pin_code", "gstin", "website", "description"] as const;

// Empty optional text fields are sent as null, as the backend expects.
export function toApiPayload(values: Partial<BusinessFormValues>): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...values };
  for (const key of OPTIONAL_KEYS) {
    if (values[key] === "") {
      payload[key] = null;
    }
  }
  return payload;
}

// Reads the JSON body. A 401 means the session is missing or expired.
// Other failures throw an Error with the backend message.
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
      // Body was not JSON; keep the default message.
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export async function listBusinesses(): Promise<Business[]> {
  const response = await fetch(BUSINESSES_URL, { credentials: "include" });
  return readJson<Business[]>(response);
}

export async function getBusiness(id: string): Promise<Business> {
  const response = await fetch(`${BUSINESSES_URL}/${id}`, { credentials: "include" });
  return readJson<Business>(response);
}

export async function createBusiness(data: BusinessFormValues): Promise<Business> {
  const response = await fetch(BUSINESSES_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(toApiPayload(data)),
  });
  return readJson<Business>(response);
}

export async function updateBusiness(
  id: string,
  data: Partial<BusinessFormValues>,
): Promise<Business> {
  const response = await fetch(`${BUSINESSES_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(toApiPayload(data)),
  });
  return readJson<Business>(response);
}
