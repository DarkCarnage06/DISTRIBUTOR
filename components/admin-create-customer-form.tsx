"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createCustomerAction } from "@/lib/actions/admin-customers";

export function CreateCustomerForm() {
  const [pending, startTransition] = useTransition();
  const [creds, setCreds] = useState<{ username: string; password: string } | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await createCustomerAction(null, fd);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Customer created");
      setCreds({ username: res.username, password: res.password });
      form.reset();
    });
  }

  async function copyCreds() {
    if (!creds) return;
    const text = `Username: ${creds.username}\nPassword: ${creds.password}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy — copy manually");
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-lg font-semibold text-slate-900">Add customer</h2>
      <p className="mt-1 text-sm text-slate-600">
        Creates a store login. A password is generated unless you provide one. Optionally approve immediately.
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-1">
          <label className="text-sm font-medium text-slate-700" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            name="username"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="e.g. lakshmistores"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="storeName">
            Store name
          </label>
          <input
            id="storeName"
            name="storeName"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="phone">
            Phone
          </label>
          <input id="phone" name="phone" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="address">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            rows={2}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="password">
            Password (optional)
          </label>
          <input
            id="password"
            name="password"
            type="text"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Leave blank to auto-generate"
          />
        </div>
        <div className="flex items-end gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="approveNow" className="rounded border-slate-300" />
            Approve immediately
          </label>
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create customer"}
          </button>
        </div>
      </form>

      {creds ? (
        <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
          <p className="font-semibold">New credentials</p>
          <p className="mt-2 font-mono text-xs">
            Username: {creds.username}
            <br />
            Password: {creds.password}
          </p>
          <button
            type="button"
            onClick={copyCreds}
            className="mt-3 rounded-md bg-emerald-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
          >
            Copy credentials
          </button>
        </div>
      ) : null}
    </section>
  );
}
