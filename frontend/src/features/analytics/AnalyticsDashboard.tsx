
import { useEffect, useMemo, useState } from "react";
import { listBusinesses } from "../businesses/api";
import type { Business } from "../businesses/types";
import { getAnalyticsSummary } from "./api";
import type { AnalyticsSummary } from "./types";

type Period = "today" | "week" | "month" | "year" | "custom";

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateRange(
  period: Period,
  customStart: string,
  customEnd: string,
) {
  const today = new Date();
  const end = new Date(today);
  let start = new Date(today);

  if (period === "today") {
    // Today only.
  } else if (period === "week") {
    const day = today.getDay();
    const daysSinceMonday = (day + 6) % 7;
    start.setDate(today.getDate() - daysSinceMonday);
  } else if (period === "month") {
    start = new Date(today.getFullYear(), today.getMonth(), 1);
  } else if (period === "year") {
    start = new Date(today.getFullYear(), 0, 1);
  } else {
    return {
      start_date: customStart || undefined,
      end_date: customEnd || undefined,
    };
  }

  return {
    start_date: toDateString(start),
    end_date: toDateString(end),
  };
}

function formatINR(value: number | string): string {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function toNumber(value: number | string): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  accent,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  accent: "green" | "red" | "gold" | "navy";
}) {
  const accentStyles = {
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-rose-50 text-rose-700",
    gold: "bg-amber-50 text-amber-700",
    navy: "bg-slate-100 text-[#172F40]",
  };

  return (
    <div className="group rounded-2xl border border-[#e9e5dc] bg-white p-5 shadow-[0_3px_15px_rgba(23,47,64,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(23,47,64,0.09)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#78838b]">{title}</p>
          <p className="mt-3 break-words text-2xl font-bold tracking-tight text-[#172F40]">
            {value}
          </p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-semibold ${accentStyles[accent]}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-xs text-[#929ba1]">{subtitle}</p>
    </div>
  );
}

export function AnalyticsDashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [period, setPeriod] = useState<Period>("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const dateRange = useMemo(
    () => getDateRange(period, customStart, customEnd),
    [period, customStart, customEnd],
  );

  useEffect(() => {
    let active = true;

    listBusinesses()
      .then((items) => {
        if (active) {
          setBusinesses(items);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unable to load businesses.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (
      period === "custom" &&
      (!customStart || !customEnd || customStart > customEnd)
    ) {
      setSummary(null);
      setLoading(false);
      setError(
        customStart && customEnd
          ? "Start date cannot be after end date."
          : "Select both dates to view custom analytics.",
      );
      return;
    }

    let active = true;

    async function loadAnalytics() {
      setLoading(true);
      setError("");

      try {
        const result = await getAnalyticsSummary({
          ...(businessId ? { business_id: businessId } : {}),
          ...dateRange,
        });

        if (active) {
          setSummary(result);
        }
      } catch (err: unknown) {
        if (active) {
          setSummary(null);
          setError(
            err instanceof Error ? err.message : "Unable to load analytics.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      active = false;
    };
  }, [businessId, period, dateRange, customStart, customEnd]);

  const monthlyTrend = summary?.monthly_trend ?? [];
  const categories = summary?.expense_categories ?? [];

  const maxMonthlyValue = Math.max(
    1,
    ...monthlyTrend.flatMap((item) => [
      toNumber(item.income),
      toNumber(item.expenses),
    ]),
  );

  return (
    <section className="space-y-6">
      {/* Analytics heading and filters */}
      <div className="rounded-2xl border border-[#e9e5dc] bg-white p-5 shadow-[0_3px_15px_rgba(23,47,64,0.04)] md:p-6">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#c6a66b]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a18a61]">
                Financial insights
              </p>
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-[#172F40]">
              Business Analytics
            </h2>
            <p className="mt-1 text-sm text-[#879198]">
              Track your financial performance and business trends.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[180px] flex-1">
              <label
                htmlFor="analytics-business"
                className="mb-1.5 block text-xs font-semibold text-[#65727b]"
              >
                Select Business
              </label>
              <select
                id="analytics-business"
                value={businessId}
                onChange={(event) => setBusinessId(event.target.value)}
                className="w-full rounded-xl border border-[#e5e1d8] bg-[#fbfaf7] px-3 py-2.5 text-sm text-[#263d4b] outline-none transition focus:border-[#c6a66b] focus:ring-2 focus:ring-[#c6a66b]/20"
              >
                <option value="">All Businesses</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[150px] flex-1">
              <label
                htmlFor="analytics-period"
                className="mb-1.5 block text-xs font-semibold text-[#65727b]"
              >
                Date Range
              </label>
              <select
                id="analytics-period"
                value={period}
                onChange={(event) => setPeriod(event.target.value as Period)}
                className="w-full rounded-xl border border-[#e5e1d8] bg-[#fbfaf7] px-3 py-2.5 text-sm text-[#263d4b] outline-none transition focus:border-[#c6a66b] focus:ring-2 focus:ring-[#c6a66b]/20"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
        </div>

        {period === "custom" && (
          <div className="mt-5 flex flex-wrap gap-3 border-t border-[#f0ede7] pt-5">
            <div>
              <label
                htmlFor="analytics-start-date"
                className="mb-1.5 block text-xs font-semibold text-[#65727b]"
              >
                Start Date
              </label>
              <input
                id="analytics-start-date"
                type="date"
                value={customStart}
                max={customEnd || undefined}
                onChange={(event) => setCustomStart(event.target.value)}
                className="rounded-xl border border-[#e5e1d8] bg-[#fbfaf7] px-3 py-2.5 text-sm text-[#263d4b] outline-none focus:border-[#c6a66b]"
              />
            </div>

            <div>
              <label
                htmlFor="analytics-end-date"
                className="mb-1.5 block text-xs font-semibold text-[#65727b]"
              >
                End Date
              </label>
              <input
                id="analytics-end-date"
                type="date"
                value={customEnd}
                min={customStart || undefined}
                onChange={(event) => setCustomEnd(event.target.value)}
                className="rounded-xl border border-[#e5e1d8] bg-[#fbfaf7] px-3 py-2.5 text-sm text-[#263d4b] outline-none focus:border-[#c6a66b]"
              />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#e9e5dc] bg-white py-16 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#e8e1d4] border-t-[#c6a66b]" />
          <p className="mt-4 text-sm text-[#879198]">
            Loading your financial insights...
          </p>
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700"
        >
          <p className="font-semibold">Unable to display analytics</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : summary ? (
        <>
          {/* Financial summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <SummaryCard
              title="Total Income"
              value={formatINR(summary.total_income)}
              subtitle="Income recorded in this period"
              icon="↗"
              accent="green"
            />
            <SummaryCard
              title="Total Expenses"
              value={formatINR(summary.total_expenses)}
              subtitle="Expenses recorded in this period"
              icon="↘"
              accent="red"
            />
            <SummaryCard
              title="Net Balance"
              value={formatINR(summary.net_balance)}
              subtitle="Income minus expenses"
              icon="₹"
              accent="gold"
            />
            <SummaryCard
              title="Transactions"
              value={String(summary.transaction_count)}
              subtitle="Total recorded transactions"
              icon="#"
              accent="navy"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 items-stretch gap-5 2xl:grid-cols-2">
            {/* Income and expenses chart */}
            <div className="min-w-0 rounded-2xl border border-[#e9e5dc] bg-white p-5 shadow-[0_3px_15px_rgba(23,47,64,0.04)] md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-[#172F40]">
                    Income vs Expenses
                  </h3>
                  <p className="mt-1 text-xs text-[#929ba1]">
                    Monthly financial comparison
                  </p>
                </div>
                <span className="rounded-lg bg-[#f7f4ed] px-3 py-1.5 text-xs font-medium text-[#927b51]">
                  Monthly trend
                </span>
              </div>

              {monthlyTrend.length === 0 ? (
                <p className="py-12 text-center text-sm text-[#929ba1]">
                  No monthly transaction data for this period.
                </p>
              ) : (
                <>
                  <div className="mb-5 mt-6 flex flex-wrap gap-5 text-xs">
                    <span className="flex items-center gap-2 font-medium text-[#52616a]">
                      <span className="h-2.5 w-2.5 rounded-sm bg-[#527d6b]" />
                      Income
                    </span>
                    <span className="flex items-center gap-2 font-medium text-[#52616a]">
                      <span className="h-2.5 w-2.5 rounded-sm bg-[#c6a66b]" />
                      Expenses
                    </span>
                  </div>

                  <div className="flex min-h-56 items-end gap-3 overflow-x-auto border-b border-[#eeeae2] px-2 pb-2">
                    {monthlyTrend.map((item) => {
                      const income = toNumber(item.income);
                      const expenses = toNumber(item.expenses);
                      const incomeHeight = (income / maxMonthlyValue) * 100;
                      const expenseHeight = (expenses / maxMonthlyValue) * 100;

                      return (
                        <div
                          key={item.month}
                          className="flex min-w-14 flex-1 flex-col items-center"
                        >
                          <div className="flex h-44 w-full items-end justify-center gap-1.5">
                            <div
                              title={`Income: ${formatINR(income)}`}
                              className="w-5 max-w-[40%] rounded-t-md bg-[#527d6b] transition-all duration-500 hover:bg-[#3e6655]"
                              style={{ height: `${incomeHeight}%` }}
                            />
                            <div
                              title={`Expenses: ${formatINR(expenses)}`}
                              className="w-5 max-w-[40%] rounded-t-md bg-[#c6a66b] transition-all duration-500 hover:bg-[#aa8c57]"
                              style={{ height: `${expenseHeight}%` }}
                            />
                          </div>
                          <span className="mt-3 whitespace-nowrap text-xs text-[#879198]">
                            {item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Expense categories */}
            <div className="min-w-0 rounded-2xl border border-[#e9e5dc] bg-white p-5 shadow-[0_3px_15px_rgba(23,47,64,0.04)] md:p-6">
              <div>
                <h3 className="font-bold text-[#172F40]">
                  Expense Breakdown
                </h3>
                <p className="mt-1 text-xs text-[#929ba1]">
                  Spending by category
                </p>
              </div>

              {categories.length === 0 ? (
                <p className="py-12 text-center text-sm text-[#929ba1]">
                  No expense data for this period.
                </p>
              ) : (
                <div className="mt-7 space-y-6">
                  {categories.map((item) => {
                    const percentage = Math.min(
                      100,
                      Math.max(0, toNumber(item.percentage)),
                    );

                    return (
                      <div key={item.category}>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                          <span className="font-medium text-[#52616a]">
                            {item.category}
                          </span>
                          <span className="font-semibold text-[#172F40]">
                            {formatINR(item.amount)}
                            <span className="ml-1.5 text-xs font-normal text-[#929ba1]">
                              ({percentage.toFixed(2)}%)
                            </span>
                          </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-[#f0eee8]">
                          <div
                            className="h-full rounded-full bg-[#c6a66b] transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-[#e9e5dc] bg-white py-12 text-center shadow-sm">
          <p className="text-sm text-[#879198]">
            No analytics data available.
          </p>
        </div>
      )}
    </section>
  );
}
