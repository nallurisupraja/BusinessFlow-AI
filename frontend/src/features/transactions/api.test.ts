
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "./api";
import { API_BASE_URL } from "../health/api";
import { SessionExpiredError } from "../auth/api";
import type { Transaction, TransactionCreate } from "./types";

const TRANSACTIONS_URL = `${API_BASE_URL}/api/v1/transactions`;

const sampleTransaction: Transaction = {
  id: "1",
  business_id: "business-1",
  transaction_type: "income",
  amount: "10000.00",
  category: "Sales",
  description: "Test income",
  payment_method: "upi",
  transaction_date: "2026-11-22",
  created_at: "2026-11-22T09:00:00",
  updated_at: "2026-11-22T09:00:00",
};

const sampleData: TransactionCreate = {
  business_id: "business-1",
  transaction_type: "income",
  amount: 10000,
  category: "Sales",
  description: "Test income",
  payment_method: "upi",
  transaction_date: "2026-11-22",
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Transaction API", () => {
  it("lists transactions with credentials included", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse([sampleTransaction]),
    );

    const result = await listTransactions();

    expect(result).toEqual([sampleTransaction]);
    expect(fetch).toHaveBeenCalledWith(TRANSACTIONS_URL, {
      credentials: "include",
    });
  });

  it("includes filters in the list request URL", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));

    await listTransactions({
      business_id: "business-1",
      transaction_type: "income",
      category: "",
    });

    const requestedUrl = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(requestedUrl).toContain("business_id=business-1");
    expect(requestedUrl).toContain("transaction_type=income");
    expect(requestedUrl).not.toContain("category=");
  });

  it("creates a transaction using POST", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(sampleTransaction),
    );

    const result = await createTransaction(sampleData);

    expect(result).toEqual(sampleTransaction);
    expect(fetch).toHaveBeenCalledWith(TRANSACTIONS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(sampleData),
    });
  });

  it("updates a transaction using PATCH", async () => {
    const updateData = {
      amount: 12000,
      category: "Updated Sales",
    };

    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        ...sampleTransaction,
        ...updateData,
      }),
    );

    const result = await updateTransaction("1", updateData);

    expect(result.amount).toBe(12000);
    expect(fetch).toHaveBeenCalledWith(`${TRANSACTIONS_URL}/1`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updateData),
    });
  });

  it("deletes a transaction using DELETE", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 204 }),
    );

    await expect(deleteTransaction("1")).resolves.toBeUndefined();

    expect(fetch).toHaveBeenCalledWith(`${TRANSACTIONS_URL}/1`, {
      method: "DELETE",
      credentials: "include",
    });
  });

  it("throws SessionExpiredError when list request returns 401", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ detail: "Unauthorized" }, 401),
    );

    await expect(listTransactions()).rejects.toBeInstanceOf(
      SessionExpiredError,
    );
  });

  it("throws the API error detail when a request fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ detail: "Transaction not found" }, 404),
    );

    await expect(deleteTransaction("missing")).rejects.toThrow(
      "Transaction not found",
    );
  });

  it("uses the default error message when error response has no detail", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ message: "Something went wrong" }, 500),
    );

    await expect(listTransactions()).rejects.toThrow(
      "Request failed with status 500",
    );
  });

  it("throws SessionExpiredError when delete request returns 401", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ detail: "Unauthorized" }, 401),
    );

    await expect(deleteTransaction("1")).rejects.toBeInstanceOf(
      SessionExpiredError,
    );
  });
});
