
export function formatINR(amount: number): string {
  if (!Number.isFinite(amount)) {
    throw new Error("Amount must be a valid number");
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}
