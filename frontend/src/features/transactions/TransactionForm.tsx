
import { useState } from "react";
import type { FormEvent } from "react";
import type { Business } from "../businesses/types";
import {
  PAYMENT_METHOD_OPTIONS,
  type Transaction,
  type TransactionCreate,
  type TransactionType,
} from "./types";
import { createTransaction, updateTransaction } from "./api";

interface TransactionFormProps {
  businesses: Business[];
  transaction?: Transaction;
  onSaved: () => void;
  onCancel: () => void;
}

function getToday(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function TransactionForm({
  businesses,
  transaction,
  onSaved,
  onCancel,
}: TransactionFormProps) {
  const [businessId, setBusinessId] = useState(
    transaction?.business_id ?? businesses[0]?.id ?? "",
  );
  const [type, setType] = useState<TransactionType>(
    transaction?.transaction_type ?? "income",
  );
  const [amount, setAmount] = useState(
    transaction ? String(transaction.amount) : "",
  );
  const [category, setCategory] = useState(transaction?.category ?? "");
  const [description, setDescription] = useState(
    transaction?.description ?? "",
  );
  const [paymentMethod, setPaymentMethod] = useState(
    transaction?.payment_method ?? "upi",
  );
  const [date, setDate] = useState(
    transaction?.transaction_date ?? getToday(),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(amount.trim())) {
      setError("Amount can have a maximum of 2 decimal places.");
      return;
    }

    if (!category.trim()) {
      setError("Please enter a category.");
      return;
    }

    if (!businessId) {
      setError("Please select a business.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data: TransactionCreate = {
        business_id: businessId,
        transaction_type: type,
        amount: numericAmount,
        category: category.trim(),
        description: description.trim() || null,
        payment_method: paymentMethod,
        transaction_date: date,
      };

      if (transaction) {
        const { business_id: _businessId, ...updateData } = data;
        await updateTransaction(transaction.id, updateData);
      } else {
        await createTransaction(data);
      }

      onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save the transaction.",
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900">
        {transaction ? "Edit Transaction" : "Add Transaction"}
      </h2>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="transaction-business" className="text-sm font-medium">
          Business
        </label>
        <select
          id="transaction-business"
          className={inputClass}
          value={businessId}
          onChange={(e) => setBusinessId(e.target.value)}
          required
        >
          <option value="">Select business</option>
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="transaction-type" className="text-sm font-medium">
          Transaction Type
        </label>
        <select
          id="transaction-type"
          className={inputClass}
          value={type}
          onChange={(e) =>
            setType(e.target.value as TransactionType)
          }
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div>
        <label htmlFor="transaction-amount" className="text-sm font-medium">
          Amount (₹)
        </label>
        <input
          id="transaction-amount"
          type="number"
          min="0.01"
          step="0.01"
          max="999999999999.99"
          className={inputClass}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          required
        />
      </div>

      <div>
        <label htmlFor="transaction-category" className="text-sm font-medium">
          Category
        </label>
        <input
          id="transaction-category"
          type="text"
          maxLength={60}
          className={inputClass}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Sales, Rent, Salary"
          required
        />
      </div>

      <div>
        <label htmlFor="transaction-description" className="text-sm font-medium">
          Description (Optional)
        </label>
        <textarea
          id="transaction-description"
          maxLength={255}
          rows={3}
          className={inputClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details..."
        />
      </div>

      <div>
        <label htmlFor="transaction-payment" className="text-sm font-medium">
          Payment Method
        </label>
        <select
          id="transaction-payment"
          className={inputClass}
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
        >
          {PAYMENT_METHOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="transaction-date" className="text-sm font-medium">
          Transaction Date
        </label>
        <input
          id="transaction-date"
          type="date"
          className={inputClass}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading || businesses.length === 0}
          className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : transaction ? "Update Transaction" : "Save Transaction"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-md border border-gray-300 px-5 py-2 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
