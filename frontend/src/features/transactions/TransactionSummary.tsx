
import type { Transaction } from "./types";
import { formatINR } from "../../lib/money";

interface TransactionSummaryProps {
  transactions: Transaction[];
}

function toPaise(amount: number | string): number {
  const value = Number(amount);
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}

export function TransactionSummary({
  transactions,
}: TransactionSummaryProps) {
  const incomePaise = transactions
    .filter((item) => item.transaction_type === "income")
    .reduce((total, item) => total + toPaise(item.amount), 0);

  const expensePaise = transactions
    .filter((item) => item.transaction_type === "expense")
    .reduce((total, item) => total + toPaise(item.amount), 0);

  const balancePaise = incomePaise - expensePaise;

  const cards = [
    {
      title: "Total Income",
      amount: incomePaise,
      color: "text-green-700",
      background: "bg-green-50",
    },
    {
      title: "Total Expenses",
      amount: expensePaise,
      color: "text-red-700",
      background: "bg-red-50",
    },
    {
      title: "Net Balance",
      amount: balancePaise,
      color: balancePaise >= 0 ? "text-blue-700" : "text-red-700",
      background: "bg-blue-50",
    },
  ];

  return (
    <section
      aria-label="Financial summary"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {cards.map((card) => (
        <article
          key={card.title}
          className={`rounded-xl border border-gray-200 p-5 shadow-sm ${card.background}`}
        >
          <p className="text-sm font-medium text-gray-600">
            {card.title}
          </p>
          <p className={`mt-2 text-2xl font-bold ${card.color}`}>
            {formatINR(card.amount / 100)}
          </p>
        </article>
      ))}
    </section>
  );
}
