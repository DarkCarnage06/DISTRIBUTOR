import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { setCustomerActiveAction, setCustomerApprovalAction } from "@/lib/actions/admin-customers";
import { CreateCustomerForm } from "@/components/admin-create-customer-form";

export default async function AdminCustomersPage() {
  await auth();

  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Customers</h1>
        <p className="mt-1 text-sm text-slate-600">Approve new stores, add accounts, and manage access.</p>
      </div>

      <CreateCustomerForm />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Store</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Username</th>
              <th className="hidden px-4 py-3 text-left font-semibold text-slate-700 md:table-cell">Phone</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{c.storeName}</div>
                  <div className="text-xs text-slate-500 line-clamp-2">{c.address}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">{c.username}</td>
                <td className="hidden px-4 py-3 text-slate-700 md:table-cell">{c.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.isApproved ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {c.isApproved ? "Approved" : "Pending approval"}
                    </span>
                    <span
                      className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.isActive ? "bg-slate-100 text-slate-800" : "bg-red-100 text-red-900"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    {!c.isApproved ? (
                      <>
                        <form action={setCustomerApprovalAction.bind(null, c.id, true)}>
                          <button
                            type="submit"
                            className="rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                          >
                            Approve
                          </button>
                        </form>
                        <form action={setCustomerApprovalAction.bind(null, c.id, false)}>
                          <button
                            type="submit"
                            className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                          >
                            Reject
                          </button>
                        </form>
                      </>
                    ) : (
                      <form action={setCustomerApprovalAction.bind(null, c.id, false)}>
                        <button
                          type="submit"
                          className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                        >
                          Revoke approval
                        </button>
                      </form>
                    )}
                    <form action={setCustomerActiveAction.bind(null, c.id, !c.isActive)}>
                      <button
                        type="submit"
                        className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                      >
                        {c.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-600">No customers yet.</p>
        ) : null}
      </div>
    </div>
  );
}
