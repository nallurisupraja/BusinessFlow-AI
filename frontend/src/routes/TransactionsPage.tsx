
import { useCallback, useEffect, useState } from "react";
import type { Business } from "../features/businesses/types";
import { listBusinesses } from "../features/businesses/api";
import {
  listTransactions,
  deleteTransaction,
} from "../features/transactions/api";
import type {
  Transaction,
  TransactionFilters,
  TransactionType,
} from "../features/transactions/types";
import { TransactionForm } from "../features/transactions/TransactionForm";
import { TransactionSummary } from "../features/transactions/TransactionSummary";
import { TransactionList } from "../features/transactions/TransactionList";

export function TransactionsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessError, setBusinessError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [businessFilter, setBusinessFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadBusinesses = useCallback(async () => {
    try {
      const data = await listBusinesses();
      setBusinesses(data);
      setBusinessError(null);
    } catch (err) {
      setBusinessError(
        err instanceof Error ? err.message : "Could not load businesses.",
      );
    }
  }, []);

  useEffect(() => {
    void loadBusinesses();
  }, [loadBusinesses]);

  useEffect(() => {
    let active = true;

    async function loadTransactions() {
      setLoading(true);
      setError(null);

      const filters: TransactionFilters = {
        ...(businessFilter ? { business_id: businessFilter } : {}),
        ...(typeFilter
          ? { transaction_type: typeFilter as TransactionType }
          : {}),
        ...(categoryFilter.trim()
          ? { category: categoryFilter.trim() }
          : {}),
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
      };

      try {
        const data = await listTransactions(filters);
        if (active) {
          setTransactions(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load transactions.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadTransactions();

    return () => {
      active = false;
    };
  }, [
    businessFilter,
    typeFilter,
    categoryFilter,
    startDate,
    endDate,
    refreshKey,
  ]);

  function handleAdd() {
    setEditingTransaction(undefined);
    setShowForm(true);
  }

  function handleEdit(transaction: Transaction) {
    setEditingTransaction(transaction);
    setShowForm(true);
  }

  function handleSaved() {
    setShowForm(false);
    setEditingTransaction(undefined);
    setRefreshKey((current) => current + 1);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);

    try {
      await deleteTransaction(id);
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete transaction.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleCancel() {
    setShowForm(false);
    setEditingTransaction(undefined);
  }

  function clearFilters() {
    setBusinessFilter("");
    setTypeFilter("");
    setCategoryFilter("");
    setStartDate("");
    setEndDate("");
  }

  const hasInvalidDateRange =
    Boolean(startDate && endDate && startDate > endDate);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Financial Management
            </h1>
            <p className="mt-2 text-gray-600">
              Track your business income and expenses.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={businesses.length === 0}
            className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add Transaction
          </button>
        </header>

        {businessError && (
          <p role="alert" className="rounded-md bg-red-50 p-3 text-red-700">
            {businessError}
          </p>
        )}

        {businesses.length === 0 && !businessError && (
          <p className="rounded-md bg-yellow-50 p-3 text-yellow-800">
            Add a business before recording transactions.
          </p>
        )}

        {showForm && (
          <TransactionForm
            businesses={businesses}
            transaction={editingTransaction}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        )}

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Financial Summary
          </h2>

          {loading ? (
            <p className="text-gray-600">Loading financial summary...</p>
          ) : (
            <TransactionSummary transactions={transactions} />
          )}
        </section>

        <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Filter Transactions
            </h2>
            <p className="text-sm text-gray-600">
              Narrow your transaction history.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label htmlFor="filter-business" className="text-sm font-medium">
                Business
              </label>
              <select
                id="filter-business"
                value={businessFilter}
                onChange={(e) => setBusinessFilter(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">All businesses</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-type" className="text-sm font-medium">
                Type
              </label>
              <select
                id="filter-type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-category" className="text-sm font-medium">
                Category
              </label>
              <input
                id="filter-category"
                type="text"
                maxLength={60}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                placeholder="Search category"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="filter-start" className="text-sm font-medium">
                From Date
              </label>
              <input
                id="filter-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="filter-end" className="text-sm font-medium">
                To Date
              </label>
              <input
                id="filter-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
            >
              Clear Filters
            </button>
            {hasInvalidDateRange && (
              <p role="alert" className="text-sm text-red-600">
                From Date must be on or before To Date.
              </p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Transaction History
          </h2>

          {error && (
            <p role="alert" className="rounded-md bg-red-50 p-3 text-red-700">
              {error}
            </p>
          )}

          {loading ? (
            <p className="text-gray-600">Loading transactions...</p>
          ) : hasInvalidDateRange ? (
            <p className="text-gray-600">
              Choose a valid date range to view transactions.
            </p>
          ) : error ? null : (
            <TransactionList
              transactions={transactions}
              businesses={businesses}
              onEdit={handleEdit}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          )}
        </section>
      </div>
    </main>
  );
}
