"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createProductsBulkAction } from "@/lib/actions/admin-products";

export function AdminProductBulkUpload() {
  const [pending, startTransition] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);

    startTransition(async () => {
      const res = await createProductsBulkAction(null, fd);
      if (!res.ok) {
        toast.error(res.error ?? "Bulk upload failed");
        return;
      }
      const created = (res.created ?? 0) as number;
      const errors = (res.errors ?? []) as Array<any>;
      toast.success(`${created} products created. ${errors.length} errors.`);
      if (errors.length > 0) console.error("Bulk upload errors:", errors);
      form.reset();
      setFileName(null);
    });
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    setFileName(f ? f.name : null);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-lg font-semibold text-slate-900">Bulk upload products</h2>
      <p className="mt-1 text-sm text-slate-600">Upload a CSV with columns: name,brand,category,unit,pricePerUnit,stockAvailable,imageUrl(optional). Header row allowed.</p>

      <form onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <input type="file" name="csvFile" accept=".csv,text/csv" onChange={onFileChange} className="mt-1" />
        </div>
        <input type="hidden" name="csv" value="" />
        <div className="md:col-span-2">
          <button
            type="button"
            onClick={async () => {
              const input = document.querySelector('input[type=file][name="csvFile"]') as HTMLInputElement | null;
              const file = input?.files?.[0];
              if (!file) return toast.error("Select a CSV file first");
              const text = await file.text();
              const hidden = document.querySelector('input[type=hidden][name="csv"]') as HTMLInputElement | null;
              if (hidden) hidden.value = text;
              // submit the form programmatically
              const form = input!.closest("form") as HTMLFormElement;
              form.requestSubmit();
            }}
            disabled={pending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {pending ? "Uploading…" : `Upload CSV${fileName ? ` (${fileName})` : ""}`}
          </button>
        </div>
      </form>
    </section>
  );
}
