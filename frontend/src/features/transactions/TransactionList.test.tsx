
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { TransactionList } from "./TransactionList";
import type { Transaction } from "./types";
import type { Business } from "../businesses/types";

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

const sampleBusiness = {
  id: "business-1",
  name: "Test Cafe",
} as Business;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("TransactionList", () => {
  it("displays an empty message when there are no transactions", () => {
    render(
      <TransactionList
        transactions={[]}
        businesses={[sampleBusiness]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByText("No transactions found. Add your first transaction."),
    ).toBeInTheDocument();
  });

  it("displays transaction details and business name", () => {
    render(
      <TransactionList
        transactions={[sampleTransaction]}
        businesses={[sampleBusiness]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("Test Cafe")).toBeInTheDocument();
    expect(screen.getByText("Sales")).toBeInTheDocument();
    expect(screen.getByText("Test income")).toBeInTheDocument();
    expect(screen.getByText("Income")).toBeInTheDocument();
    expect(screen.getByText("₹10,000.00")).toBeInTheDocument();
    expect(screen.getByText("upi")).toBeInTheDocument();
  });

  it("displays Unknown business when business is not found", () => {
    render(
      <TransactionList
        transactions={[sampleTransaction]}
        businesses={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("Unknown business")).toBeInTheDocument();
  });

  it("displays Expense for expense transactions", () => {
    const expense: Transaction = {
      ...sampleTransaction,
      transaction_type: "expense",
      category: "Rent",
    };

    render(
      <TransactionList
        transactions={[expense]}
        businesses={[sampleBusiness]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("Expense")).toBeInTheDocument();
    expect(screen.getByText("Rent")).toBeInTheDocument();
  });

  it("calls onEdit when Edit is clicked", () => {
    const onEdit = vi.fn();

    render(
      <TransactionList
        transactions={[sampleTransaction]}
        businesses={[sampleBusiness]}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(onEdit).toHaveBeenCalledWith(sampleTransaction);
  });

  it("calls onDelete when deletion is confirmed", () => {
    const onDelete = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <TransactionList
        transactions={[sampleTransaction]}
        businesses={[sampleBusiness]}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(window.confirm).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith("1");
  });

  it("does not call onDelete when deletion is cancelled", () => {
    const onDelete = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(
      <TransactionList
        transactions={[sampleTransaction]}
        businesses={[sampleBusiness]}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onDelete).not.toHaveBeenCalled();
  });
});
