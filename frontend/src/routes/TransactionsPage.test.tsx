
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { TransactionsPage } from "./TransactionsPage";
import { listBusinesses } from "../features/businesses/api";
import {
  listTransactions,
  deleteTransaction,
} from "../features/transactions/api";
import type { Business } from "../features/businesses/types";
import type { Transaction } from "../features/transactions/types";

vi.mock("../features/businesses/api", () => ({
  listBusinesses: vi.fn(),
}));

vi.mock("../features/transactions/api", () => ({
  listTransactions: vi.fn(),
  deleteTransaction: vi.fn(),
}));

const sampleBusiness = {
  id: "business-1",
  name: "Test Cafe",
} as Business;

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

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(listBusinesses).mockResolvedValue([sampleBusiness]);
  vi.mocked(listTransactions).mockResolvedValue([sampleTransaction]);
  vi.mocked(deleteTransaction).mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("TransactionsPage", () => {
  it("loads businesses and transactions successfully", async () => {
    render(<TransactionsPage />);

    expect(
      await screen.findByRole("heading", { name: "Financial Management" }),
    ).toBeInTheDocument();

    expect(await screen.findByRole("option", { name: "Test Cafe" }),).toBeInTheDocument();
    expect(screen.getByText("Sales")).toBeInTheDocument();
    expect(screen.getByText("Financial Summary")).toBeInTheDocument();
    expect(screen.getByText("Transaction History")).toBeInTheDocument();

    expect(listBusinesses).toHaveBeenCalled();
    expect(listTransactions).toHaveBeenCalledWith({});
  });

  it("displays an error when businesses fail to load", async () => {
    vi.mocked(listBusinesses).mockRejectedValueOnce(
      new Error("Could not load businesses"),
    );

    render(<TransactionsPage />);

    expect(
      await screen.findByText("Could not load businesses"),
    ).toBeInTheDocument();
  });

  it("displays an error when transactions fail to load", async () => {
    vi.mocked(listTransactions).mockRejectedValueOnce(
      new Error("Could not load transactions"),
    );

    render(<TransactionsPage />);

    expect(
      await screen.findByText("Could not load transactions"),
    ).toBeInTheDocument();
  });

  it("displays a warning and disables Add Transaction when no businesses exist", async () => {
    vi.mocked(listBusinesses).mockResolvedValueOnce([]);

    render(<TransactionsPage />);

    expect(
      await screen.findByText(
        "Add a business before recording transactions.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "+ Add Transaction" }),
    ).toBeDisabled();
  });

  it("opens the Add Transaction form and closes it with Cancel", async () => {
    render(<TransactionsPage />);

    const addButton = await screen.findByRole("button", {
      name: "+ Add Transaction",
    });

    fireEvent.click(addButton);

    expect(
      screen.getByRole("heading", { name: "Add Transaction" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.queryByRole("heading", { name: "Add Transaction" }),
    ).not.toBeInTheDocument();
  });

  it("opens the edit form when a transaction is edited", async () => {
    render(<TransactionsPage />);

    const editButton = await screen.findByRole("button", {
      name: "Edit",
    });

    fireEvent.click(editButton);

    expect(
      screen.getByRole("heading", { name: "Edit Transaction" }),
    ).toBeInTheDocument();

    expect(screen.getByDisplayValue("Sales")).toBeInTheDocument();
  });

  it("applies transaction filters", async () => {
    render(<TransactionsPage />);

    await screen.findByRole("option", { name: "Test Cafe" });

    fireEvent.change(screen.getByLabelText("Business"), {
      target: { value: "business-1" },
    });

    fireEvent.change(screen.getByLabelText("Type"), {
      target: { value: "expense" },
    });

    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "Rent" },
    });

    fireEvent.change(screen.getByLabelText("From Date"), {
      target: { value: "2026-11-01" },
    });

    fireEvent.change(screen.getByLabelText("To Date"), {
      target: { value: "2026-11-30" },
    });

    await waitFor(() => {
      expect(listTransactions).toHaveBeenLastCalledWith({
        business_id: "business-1",
        transaction_type: "expense",
        category: "Rent",
        start_date: "2026-11-01",
        end_date: "2026-11-30",
      });
    });
  });



  it("clears all transaction filters", async () => {
    render(<TransactionsPage />);

    await screen.findByRole("option", { name: "Test Cafe" });

    fireEvent.change(screen.getByLabelText("Type"), {
      target: { value: "expense" },
    });

    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "Rent" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Clear Filters" }));

    expect(screen.getByLabelText("Type")).toHaveValue("");
    expect(screen.getByLabelText("Category")).toHaveValue("");

    await waitFor(() => {
      expect(listTransactions).toHaveBeenLastCalledWith({});
    });
  });

  it("deletes a transaction and reloads the transaction list", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<TransactionsPage />);

    const deleteButton = await screen.findByRole("button", {
      name: "Delete",
    });

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteTransaction).toHaveBeenCalledWith("1");
    });

    await waitFor(() => {
      expect(vi.mocked(listTransactions).mock.calls.length).toBeGreaterThan(1);
    });
  });

  it("shows a message when the selected date range is invalid", async () => {
    render(<TransactionsPage />);

    await screen.findByRole("option", { name: "Test Cafe" });

    fireEvent.change(screen.getByLabelText("From Date"), {
      target: { value: "2026-11-30" },
    });

    fireEvent.change(screen.getByLabelText("To Date"), {
      target: { value: "2026-11-01" },
    });

    expect(
      await screen.findByText("From Date must be on or before To Date."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Choose a valid date range to view transactions."),
    ).toBeInTheDocument();
  });
});


    
