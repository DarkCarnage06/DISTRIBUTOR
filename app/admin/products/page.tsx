import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/format";
import { setProductActiveAction } from "@/lib/actions/admin-products";
import { AdminProductCreateForm } from "@/components/admin-product-create-form";
import { AdminProductBulkUpload } from "@/components/admin-product-bulk-upload";

export default async function AdminProductsPage() {
  await auth();

  const products = await prisma.product.findMany({
    orderBy: [{ brand: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
        <p className="mt-1 text-sm text-slate-600">Manage catalog, pricing, and stock.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AdminProductCreateForm />
        <AdminProductBulkUpload />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Product</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Brand</th>
              <th className="hidden px-4 py-3 text-left font-semibold text-slate-700 lg:table-cell">Category</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Price</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Stock</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-500">per {p.unit}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">{p.brand}</td>
                <td className="hidden px-4 py-3 text-slate-700 lg:table-cell">{p.category}</td>
                <td className="px-4 py-3 text-right text-slate-800">{formatInr(p.pricePerUnit)}</td>
                <td className="px-4 py-3 text-right text-slate-800">{p.stockAvailable}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      Edit
                    </Link>
                    <form action={setProductActiveAction.bind(null, p.id, !p.isActive)}>
                      <button
                        type="submit"
                        className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                      >
                        {p.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
