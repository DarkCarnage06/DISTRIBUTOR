export function formatInr(amount: number | string | { toString(): string }) {
  const n = typeof amount === "number" ? amount : Number(amount.toString());
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}
