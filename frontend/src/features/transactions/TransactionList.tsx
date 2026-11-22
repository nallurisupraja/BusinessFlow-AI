
import type { Transaction } from "./types";
import type { Business } from "../businesses/types";
import { formatINR } from "../../lib/money";

interface TransactionListProps {
  transactions: Transaction[];
  businesses: Business[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  deletingId?: string | null;
}

export function TransactionList({
  transactions,
  businesses,
  onEdit,
  onDelete,
  deletingId = null,
}: TransactionListProps) {
  function handleDelete(transaction: Transaction) {
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${transaction.transaction_type} transaction?`,
    );

    if (confirmed) {
      onDelete(transaction.id);
    }
  }

  if (transactions.length === 0) {
    return (
      <p className="rounded-lg bg-gray-50 p-6 text-center text-gray-600">
        No transactions found. Add your first transaction.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full min-w-[750px] text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Business</th>
            <th className="px-4 py-3">Category / Description</th>
            <th className="px-4 py-3">Payment</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {transactions.map((transaction) => {
            const businessName =
              businesses.find(
                (business) => business.id === transaction.business_id,
              )?.name ?? "Unknown business";

            return (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3">
                  {transaction.transaction_date}
                </td>

                <td className="px-4 py-3">
                  {businessName}
                </td>

                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">
                    {transaction.category}
                  </p>
                  <p className="max-w-[200px] truncate text-gray-500">
                    {transaction.description || "—"}
                  </p>
                </td>

                <td className="whitespace-nowrap px-4 py-3 capitalize">
                  {transaction.payment_method.replace(/_/g, " ")}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={
                      transaction.transaction_type === "income"
                        ? "font-medium text-green-700"
                        : "font-medium text-red-700"
                    }
                  >
                    {transaction.transaction_type === "income"
                      ? "Income"
                      : "Expense"}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                  {formatINR(Number(transaction.amount))}
                </td>

                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(transaction)}
                      className="text-blue-700 hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(transaction)}
                      disabled={deletingId === transaction.id}
                      className="text-red-700 hover:underline disabled:opacity-50"
                    >
                      {deletingId === transaction.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
