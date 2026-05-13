import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";

export default async function CustomerOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My orders</h1>
        <p className="mt-1 text-sm text-slate-600">Track status for orders you have placed.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Order</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Placed</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  <Link href={`/customer/orders/${o.id}`} className="font-medium text-slate-900 hover:underline">
                    #{o.id.slice(-8).toUpperCase()}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-700">{o.createdAt.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">{formatInr(o.totalAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-600">
            No orders yet.{" "}
            <Link href="/customer/catalog" className="font-semibold text-slate-900 underline">
              Start ordering
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
