
export interface MonthlyTrend {
  month: string;
  income: number | string;
  expenses: number | string;
}

export interface ExpenseCategory {
  category: string;
  amount: number | string;
  percentage: number | string;
}

export interface AnalyticsSummary {
  total_income: number | string;
  total_expenses: number | string;
  net_balance: number | string;
  transaction_count: number;
  monthly_trend: MonthlyTrend[];
  expense_categories: ExpenseCategory[];
}

export interface AnalyticsFilters {
  business_id?: string;
  start_date?: string;
  end_date?: string;
}
