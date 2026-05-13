"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import type { OrderStatus } from "@prisma/client";
import { updateOrderStatusAction } from "@/lib/actions/admin-orders";

const options: OrderStatus[] = ["PENDING", "CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"];

export function AdminOrderStatusForm({ orderId, current }: { orderId: string; current: OrderStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as OrderStatus;
    if (next === current) return;
    startTransition(async () => {
      try {
        await updateOrderStatusAction(orderId, next);
        toast.success("Order status updated");
        router.refresh();
      } catch {
        toast.error("Could not update status");
      }
    });
  }

  return (
    <label className="text-xs font-medium text-slate-600">
      Update status
      <select
        key={current}
        defaultValue={current}
        disabled={pending}
        onChange={onChange}
        className="mt-1 block w-full min-w-[12rem] rounded-md border border-slate-300 px-2 py-2 text-sm"
      >
        {options.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </label>
  );
}
