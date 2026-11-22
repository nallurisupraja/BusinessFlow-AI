
import { z } from "zod";

export const businessNameSchema = z
  .string()
  .trim()
  .min(2, "Business name must contain at least 2 characters")
  .max(100, "Business name must not exceed 100 characters");

export const positiveAmountSchema = z
  .number()
  .finite()
  .positive("Amount must be greater than zero");
