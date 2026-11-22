export type BusinessType =
  | "restaurant"
  | "salon_beauty"
  | "retail_shop"
  | "shopping_mall"
  | "freelancer"
  | "other";

export const BUSINESS_TYPE_OPTIONS: { value: BusinessType; label: string }[] = [
  { value: "restaurant", label: "Restaurant" },
  { value: "salon_beauty", label: "Salon / Beauty" },
  { value: "retail_shop", label: "Retail Shop" },
  { value: "shopping_mall", label: "Shopping Mall" },
  { value: "freelancer", label: "Freelancer" },
  { value: "other", label: "Other" },
];

// Shape of a business as returned by the backend API.
export interface Business {
  id: string;
  name: string;
  business_type: BusinessType;
  owner_name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address: string | null;
  pin_code: string | null;
  gstin: string | null;
  website: string | null;
  description: string | null;
  currency_code: string;
  created_at: string;
  updated_at: string;
}
