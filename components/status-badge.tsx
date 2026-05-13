import type { OrderStatus } from "@prisma/client";

const styles: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900 ring-amber-600/20",
  CONFIRMED: "bg-blue-100 text-blue-900 ring-blue-600/20",
  DISPATCHED: "bg-orange-100 text-orange-900 ring-orange-600/20",
  DELIVERED: "bg-emerald-100 text-emerald-900 ring-emerald-600/20",
  CANCELLED: "bg-red-100 text-red-900 ring-red-600/20",
};

const labels: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
