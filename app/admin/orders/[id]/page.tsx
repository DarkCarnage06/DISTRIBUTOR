import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { AdminOrderStatusForm } from "@/components/admin-order-status-form";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") notFound();

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  });
  if (!order) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/orders" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← All orders
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="mt-1 text-sm text-slate-600">{order.createdAt.toLocaleString()}</p>
        </div>
        <div className="flex flex-col items-start gap-2">
          <StatusBadge status={order.status} />
          <AdminOrderStatusForm orderId={order.id} current={order.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Customer</h2>
          <p className="mt-2 text-lg font-semibold text-slate-900">{order.customer.storeName}</p>
          <dl className="mt-3 space-y-1 text-sm text-slate-700">
            <div>
              <dt className="inline text-slate-500">Username: </dt>
              <dd className="inline">{order.customer.username}</dd>
            </div>
            <div>
              <dt className="inline text-slate-500">Phone: </dt>
              <dd className="inline">{order.customer.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Address</dt>
              <dd>{order.customer.address ?? "—"}</dd>
            </div>
          </dl>
          <Link
            href={`/admin/orders?customerId=${order.customerId}`}
            className="mt-4 inline-block text-sm font-medium text-slate-900 underline-offset-4 hover:underline"
          >
            View all orders from this customer
          </Link>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Notes</h2>
          <p className="mt-2 text-sm text-slate-800">{order.notes?.trim() ? order.notes : "—"}</p>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-600">Order total</p>
            <p className="text-2xl font-semibold text-slate-900">{formatInr(order.totalAmount)}</p>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">Line items</h2>
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Brand</th>
              <th className="px-4 py-2 text-right">Qty</th>
              <th className="px-4 py-2 text-right">Unit price</th>
              <th className="px-4 py-2 text-right">Line total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((i) => (
              <tr key={i.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{i.product.name}</td>
                <td className="px-4 py-3 text-slate-700">{i.product.brand}</td>
                <td className="px-4 py-3 text-right text-slate-800">{i.quantity}</td>
                <td className="px-4 py-3 text-right text-slate-800">{formatInr(i.priceAtTime)}</td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">
                  {formatInr(Number(i.priceAtTime) * i.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
