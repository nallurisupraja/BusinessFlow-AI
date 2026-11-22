import { API_BASE_URL } from "../health/api";
import type { AuthUser } from "./types";

const AUTH_URL = `${API_BASE_URL}/api/v1/auth`;

// Thrown when the server says the session is missing or expired.
export class SessionExpiredError extends Error {
  constructor(message = "Your session has expired. Please log in again.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

// Reads the "detail" text FastAPI sends with an error, if there is one.
async function readDetail(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { detail?: unknown };
    return typeof body.detail === "string" ? body.detail : null;
  } catch {
    return null;
  }
}

export async function registerUser(values: {
  full_name: string;
  email: string;
  password: string;
}): Promise<AuthUser> {
  const response = await fetch(`${AUTH_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(values),
  });
  if (!response.ok) {
    throw new Error((await readDetail(response)) ?? "Registration failed. Please try again.");
  }
  return (await response.json()) as AuthUser;
}

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const response = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (response.status === 401) {
    throw new Error("Invalid email or password.");
  }
  if (!response.ok) {
    throw new Error((await readDetail(response)) ?? "Login failed. Please try again.");
  }
  return (await response.json()) as AuthUser;
}

// Returns the logged-in user, or null when nobody is logged in.
export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch(`${AUTH_URL}/me`, { credentials: "include" });
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Could not check your session.");
  }
  return (await response.json()) as AuthUser;
}

// Asks the server to clear the session cookie. Network errors are ignored so
// the user can always log out locally.
export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${AUTH_URL}/logout`, { method: "POST", credentials: "include" });
  } catch {
    // ignore: local state is cleared by the caller
  }
}