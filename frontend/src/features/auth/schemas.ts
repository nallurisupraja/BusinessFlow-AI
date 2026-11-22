import { z } from "zod";

export const registerSchema = z
  .object({
    full_name: z.string().trim().min(1, "Full name is required").max(120),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .max(254)
      .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128)
      .regex(/[A-Za-z]/, "Password must contain a letter")
      .regex(/\d/, "Password must contain a number"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;