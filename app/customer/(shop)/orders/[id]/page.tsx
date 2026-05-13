import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";

export default async function CustomerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, customerId: session.user.id },
    include: { items: { include: { product: true } } },
  });
  if (!order) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/customer/orders" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          ← My orders
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-slate-600">{order.createdAt.toLocaleString()}</p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Notes</h2>
        <p className="mt-2 text-sm text-slate-800">{order.notes?.trim() ? order.notes : "—"}</p>
        <p className="mt-6 text-sm text-slate-600">Total</p>
        <p className="text-2xl font-semibold text-slate-900">{formatInr(order.totalAmount)}</p>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">Items</h2>
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2 text-right">Qty</th>
              <th className="px-4 py-2 text-right">Unit price</th>
              <th className="px-4 py-2 text-right">Line total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((i) => (
              <tr key={i.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{i.product.name}</div>
                  <div className="text-xs text-slate-500">{i.product.brand}</div>
                </td>
                <td className="px-4 py-3 text-right text-slate-800">{i.quantity}</td>
                <td className="px-4 py-3 text-right text-slate-800">{formatInr(i.priceAtTime)}</td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">{formatInr(Number(i.priceAtTime) * i.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
