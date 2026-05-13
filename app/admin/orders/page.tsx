import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import type { OrderStatus } from "@prisma/client";

const statuses: OrderStatus[] = ["PENDING", "CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; customerId?: string; from?: string; to?: string }>;
}) {
  await auth();
  const sp = await searchParams;

  const statusFilter = statuses.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : undefined;
  const customerId = sp.customerId?.trim() || undefined;
  const from = sp.from ? new Date(sp.from) : undefined;
  const to = sp.to ? new Date(sp.to) : undefined;
  if (to) to.setHours(23, 59, 59, 999);

  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { storeName: "asc" },
    select: { id: true, storeName: true, username: true },
  });

  const orders = await prisma.order.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(customerId ? { customerId } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { storeName: true, username: true, phone: true } },
    },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
        <p className="mt-1 text-sm text-slate-600">Filter by status, customer, and date range.</p>
      </div>

      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5 md:items-end" method="get">
        <div>
          <label className="text-xs font-medium text-slate-600">Status</label>
          <select name="status" defaultValue={sp.status ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-sm">
            <option value="">All</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Customer</label>
          <select name="customerId" defaultValue={customerId ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-sm">
            <option value="">All</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.storeName} ({c.username})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">From</label>
          <input type="date" name="from" defaultValue={sp.from ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">To</label>
          <input type="date" name="to" defaultValue={sp.to ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-sm" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Apply
          </button>
          <Link
            href="/admin/orders"
            className="rounded-md border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Order</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Customer</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium text-slate-900 hover:underline">
                      #{o.id.slice(-8).toUpperCase()}
                    </Link>
                    <div className="text-xs text-slate-500">{o.createdAt.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{o.customer.storeName}</div>
                    <div className="text-xs text-slate-500">{o.customer.username}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">{formatInr(o.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 ? <p className="p-6 text-center text-sm text-slate-600">No orders match your filters.</p> : null}
      </div>
    </div>
  );
}
