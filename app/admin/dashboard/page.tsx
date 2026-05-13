import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/format";
import { OrderStatus } from "@prisma/client";

export default async function AdminDashboardPage() {
  await auth();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    pendingOrders,
    todaysOrders,
    pendingApprovals,
    totalCustomers,
    revenueAgg,
  ] = await Promise.all([
    prisma.order.count({ where: { status: OrderStatus.PENDING } }),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.user.count({ where: { role: "CUSTOMER", isApproved: false, isActive: true } }),
    prisma.user.count({ where: { role: "CUSTOMER", isActive: true } }),
    prisma.order.aggregate({
      where: { status: { not: OrderStatus.CANCELLED } },
      _sum: { totalAmount: true },
    }),
  ]);

  const revenue = Number(revenueAgg._sum.totalAmount ?? 0);

  const cards = [
    { label: "Pending orders", value: pendingOrders, hint: "Awaiting confirmation" },
    { label: "Today's orders", value: todaysOrders, hint: "Since midnight" },
    { label: "Pending approvals", value: pendingApprovals, hint: "New store registrations" },
    { label: "Active customers", value: totalCustomers, hint: "Customer accounts" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Overview of orders, customers, and revenue.</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:p-6">
        <p className="text-sm font-medium text-slate-600">All-time revenue (excl. cancelled)</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{formatInr(revenue)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-600">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{c.value}</p>
            <p className="mt-1 text-xs text-slate-500">{c.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
