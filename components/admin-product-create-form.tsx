"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { createProductAction } from "@/lib/actions/admin-products";

export function AdminProductCreateForm() {
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await createProductAction(null, fd);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Product added");
      form.reset();
    });
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-lg font-semibold text-slate-900">Add product</h2>
      <form onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Name</label>
          <input name="name" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Brand</label>
          <input name="brand" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Category</label>
          <input name="category" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Unit</label>
          <input name="unit" required placeholder="dozen, box, kg…" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Price per unit (INR)</label>
          <input name="pricePerUnit" type="number" step="0.01" min="0" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Stock available</label>
          <input name="stockAvailable" type="number" min="0" defaultValue={0} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Image URL (optional)</label>
          <input name="imageUrl" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {pending ? "Adding…" : "Add product"}
          </button>
        </div>
      </form>
    </section>
  );
}
