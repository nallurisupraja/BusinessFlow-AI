
import { API_BASE_URL } from "../health/api";
import { SessionExpiredError } from "../auth/api";
import type {
  Transaction,
  TransactionCreate,
  TransactionUpdate,
  TransactionFilters,
} from "./types";

const TRANSACTIONS_URL = `${API_BASE_URL}/api/v1/transactions`;

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

export async function listTransactions(
  filters: TransactionFilters = {},
): Promise<Transaction[]> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, value);
    }
  });

  const query = params.toString();
  const url = query
    ? `${TRANSACTIONS_URL}?${query}`
    : TRANSACTIONS_URL;

  const response = await fetch(url, {
    credentials: "include",
  });

  return readJson<Transaction[]>(response);
}

export async function createTransaction(
  data: TransactionCreate,
): Promise<Transaction> {
  const response = await fetch(TRANSACTIONS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return readJson<Transaction>(response);
}

export async function updateTransaction(
  id: string,
  data: TransactionUpdate,
): Promise<Transaction> {
  const response = await fetch(`${TRANSACTIONS_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return readJson<Transaction>(response);
}

export async function deleteTransaction(id: string): Promise<void> {
  const response = await fetch(`${TRANSACTIONS_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

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
}
