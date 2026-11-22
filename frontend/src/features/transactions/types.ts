
export type TransactionType = "income" | "expense";

export type PaymentMethod =
  | "cash"
  | "upi"
  | "card"
  | "bank_transfer"
  | "cheque"
  | "other";

export interface Transaction {
  id: string;
  business_id: string;
  transaction_type: TransactionType;
  amount: number | string;
  category: string;
  description: string | null;
  payment_method: PaymentMethod;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionCreate {
  business_id: string;
  transaction_type: TransactionType;
  amount: number;
  category: string;
  description: string | null;
  payment_method: PaymentMethod;
  transaction_date: string;
}

export interface TransactionUpdate {
  transaction_type?: TransactionType;
  amount?: number;
  category?: string;
  description?: string | null;
  payment_method?: PaymentMethod;
  transaction_date?: string;
}

export interface TransactionFilters {
  business_id?: string;
  transaction_type?: TransactionType;
  category?: string;
  start_date?: string;
  end_date?: string;
}

export const PAYMENT_METHOD_OPTIONS: {
  value: PaymentMethod;
  label: string;
}[] = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];
