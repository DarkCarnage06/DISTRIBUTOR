import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateProductAction } from "@/lib/actions/admin-products";

export default async function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") notFound();

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const updateWithId = updateProductAction.bind(null, product.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Edit product</h1>
          <p className="mt-1 text-sm text-slate-600">{product.name}</p>
        </div>
        <Link href="/admin/products" className="text-sm font-medium text-slate-700 hover:text-slate-900">
          ← Back
        </Link>
      </div>

      <form action={updateWithId} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="text-sm font-medium text-slate-700">Name</label>
          <input name="name" required defaultValue={product.name} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Brand</label>
          <input name="brand" required defaultValue={product.brand} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Category</label>
          <input name="category" required defaultValue={product.category} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Unit</label>
          <input name="unit" required defaultValue={product.unit} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Price per unit (INR)</label>
          <input
            name="pricePerUnit"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={Number(product.pricePerUnit)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Stock available</label>
          <input
            name="stockAvailable"
            type="number"
            min="0"
            required
            defaultValue={product.stockAvailable}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Image URL (optional)</label>
          <input name="imageUrl" defaultValue={product.imageUrl ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          Save changes
        </button>
      </form>
    </div>
  );
}
