
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TransactionSummary } from "./TransactionSummary";
import type { Transaction } from "./types";

const sampleTransactions: Transaction[] = [
  {
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
  },
  {
    id: "2",
    business_id: "business-1",
    transaction_type: "expense",
    amount: "2000.00",
    category: "Rent",
    description: "Test expense",
    payment_method: "cash",
    transaction_date: "2026-11-22",
    created_at: "2026-11-22T09:00:00",
    updated_at: "2026-11-22T09:00:00",
  },
];

describe("TransactionSummary", () => {
  it("displays zero amounts when there are no transactions", () => {
    render(<TransactionSummary transactions={[]} />);

    expect(screen.getByText("Total Income")).toBeInTheDocument();
    expect(screen.getByText("Total Expenses")).toBeInTheDocument();
    expect(screen.getByText("Net Balance")).toBeInTheDocument();

    expect(screen.getAllByText("₹0.00")).toHaveLength(3);
  });

  it("calculates income, expenses and net balance correctly", () => {
    render(
      <TransactionSummary transactions={sampleTransactions} />,
    );

    expect(screen.getByText("₹10,000.00")).toBeInTheDocument();
    expect(screen.getByText("₹2,000.00")).toBeInTheDocument();
    expect(screen.getByText("₹8,000.00")).toBeInTheDocument();
  });

  it("displays a negative balance when expenses exceed income", () => {
    const transactions = [
      {
        ...sampleTransactions[1],
        amount: "12000.00",
      },
    ];

    render(<TransactionSummary transactions={transactions} />);

    expect(screen.getByText("-₹12,000.00")).toBeInTheDocument();
  });
});
