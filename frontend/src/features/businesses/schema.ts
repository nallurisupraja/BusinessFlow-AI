import { z } from "zod";

// Zod 3 has no .toLowerCase()/.toUpperCase(), so we use transform instead.
export const businessFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Business name is required")
    .max(120, "Business name must not exceed 120 characters"),
  business_type: z.enum([
    "restaurant",
    "salon_beauty",
    "retail_shop",
    "shopping_mall",
    "freelancer",
    "other",
  ]),
  owner_name: z
    .string()
    .trim()
    .min(1, "Owner name is required")
    .max(120, "Owner name must not exceed 120 characters"),
  email: z
    .string()
    .trim()
    .transform((v) => v.toLowerCase())
    .refine((v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .refine(
      (v) => /^(\+91)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, "")),
      "Enter a valid 10-digit Indian mobile number",
    ),
  country: z.string().trim().min(1, "Country is required"),
  state: z.string().trim().min(1, "State is required"),
  city: z.string().trim().min(1, "City is required"),
  address: z.string().trim().max(500, "Address must not exceed 500 characters"),
  pin_code: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{6}$/.test(v), "PIN code must be 6 digits"),
  gstin: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase())
    .refine(
      (v) => v === "" || /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/.test(v),
      "Enter a valid 15-character GSTIN",
    ),
  website: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || /^https?:\/\//.test(v),
      "Website must start with http:// or https://",
    ),
  description: z.string().trim().max(1000, "Description must not exceed 1000 characters"),
});

export type BusinessFormValues = z.infer<typeof businessFormSchema>;

export const businessFormDefaults: BusinessFormValues = {
  name: "",
  business_type: "restaurant",
  owner_name: "",
  email: "",
  phone: "",
  country: "India",
  state: "",
  city: "",
  address: "",
  pin_code: "",
  gstin: "",
  website: "",
  description: "",
};
