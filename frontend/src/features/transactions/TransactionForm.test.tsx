
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TransactionForm } from "./TransactionForm";
import { createTransaction, updateTransaction } from "./api";
import type { Transaction } from "./types";
import type { Business } from "../businesses/types";

vi.mock("./api", () => ({
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
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
  vi.mocked(createTransaction).mockResolvedValue(undefined as never);
  vi.mocked(updateTransaction).mockResolvedValue(undefined as never);
});

describe("TransactionForm", () => {
  it("displays the Add Transaction form with default values", () => {
    render(
      <TransactionForm
        businesses={[sampleBusiness]}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Add Transaction")).toBeInTheDocument();
    expect(screen.getByLabelText("Business")).toHaveValue("business-1");
    expect(screen.getByLabelText("Transaction Type")).toHaveValue("income");
    expect(screen.getByLabelText("Payment Method")).toHaveValue("upi");
    expect(screen.getByRole("button", { name: "Save Transaction" })).toBeInTheDocument();
  });

  it("displays existing transaction values in edit mode", () => {
    render(
      <TransactionForm
        businesses={[sampleBusiness]}
        transaction={sampleTransaction}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Edit Transaction")).toBeInTheDocument();
    expect(screen.getByLabelText("Business")).toHaveValue("business-1");
    expect(screen.getByLabelText("Transaction Type")).toHaveValue("income");
    expect(screen.getByLabelText("Amount (₹)")).toHaveValue(10000);
    expect(screen.getByLabelText("Category")).toHaveValue("Sales");
    expect(screen.getByLabelText("Description (Optional)")).toHaveValue("Test income");
    expect(screen.getByRole("button", { name: "Update Transaction" })).toBeInTheDocument();
  });

  it("creates a transaction with valid form data", async () => {
    const onSaved = vi.fn();

    render(
      <TransactionForm
        businesses={[sampleBusiness]}
        onSaved={onSaved}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Amount (₹)"), {
      target: { value: "5000" },
    });
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "  Sales  " },
    });
    fireEvent.change(screen.getByLabelText("Description (Optional)"), {
      target: { value: "  Monthly sales  " },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Transaction" }));

    await waitFor(() => {
      expect(createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          business_id: "business-1",
          transaction_type: "income",
          amount: 5000,
          category: "Sales",
          description: "Monthly sales",
          payment_method: "upi",
        }),
      );
    });

    expect(onSaved).toHaveBeenCalledOnce();
  });

  it("shows an error when amount is zero", async () => {
    render(
      <TransactionForm
        businesses={[sampleBusiness]}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Amount (₹)"), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "Sales" },
    });

    fireEvent.submit(screen.getByRole("button", { name: "Save Transaction" }).closest("form")!);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please enter a valid amount greater than zero.",
    );
    expect(createTransaction).not.toHaveBeenCalled();
  });

  it("rejects amounts with more than two decimal places", async () => {
    render(
      <TransactionForm
        businesses={[sampleBusiness]}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Amount (₹)"), {
      target: { value: "100.123" },
    });
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "Sales" },
    });

    fireEvent.submit(screen.getByRole("button", { name: "Save Transaction" }).closest("form")!);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Amount can have a maximum of 2 decimal places.",
    );
    expect(createTransaction).not.toHaveBeenCalled();
  });

  it("shows an error when category is empty", async () => {
    render(
      <TransactionForm
        businesses={[sampleBusiness]}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Amount (₹)"), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "   " },
    });

    fireEvent.submit(screen.getByRole("button", { name: "Save Transaction" }).closest("form")!);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please enter a category.",
    );
    expect(createTransaction).not.toHaveBeenCalled();
  });

  it("updates an existing transaction without sending business_id", async () => {
    const onSaved = vi.fn();

    render(
      <TransactionForm
        businesses={[sampleBusiness]}
        transaction={sampleTransaction}
        onSaved={onSaved}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Amount (₹)"), {
      target: { value: "12000" },
    });
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "Updated Sales" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Update Transaction" }));

    await waitFor(() => {
      expect(updateTransaction).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({
          transaction_type: "income",
          amount: 12000,
          category: "Updated Sales",
        }),
      );
    });

    expect(vi.mocked(updateTransaction).mock.calls[0][1]).not.toHaveProperty("business_id");
    expect(onSaved).toHaveBeenCalledOnce();
    expect(createTransaction).not.toHaveBeenCalled();
  });

  it("displays an API error when saving fails", async () => {
    vi.mocked(createTransaction).mockRejectedValueOnce(
      new Error("Server error"),
    );

    render(
      <TransactionForm
        businesses={[sampleBusiness]}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Amount (₹)"), {
      target: { value: "500" },
    });
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "Sales" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Transaction" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Server error");
  });

  it("calls onCancel when Cancel is clicked", () => {
    const onCancel = vi.fn();

    render(
      <TransactionForm
        businesses={[sampleBusiness]}
        onSaved={vi.fn()}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledOnce();
  });
});
